import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../config/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Helper to safely extract user data
function extractUserData(event) {
  // Log the raw event for debugging
  console.log("Inngest event (raw):", JSON.stringify(event, null, 2));

  // Try to find the actual event object
  let actualEvent = event;
  if (event.event) {
    actualEvent = event.event;
  } else if (Array.isArray(event.events) && event.events.length > 0) {
    actualEvent = event.events[0];
  } else if (Array.isArray(event) && event.length > 0) {
    actualEvent = event[0];
  }

  // Log the actual event for debugging
  console.log(
    "Inngest event (actualEvent):",
    JSON.stringify(actualEvent, null, 2)
  );

  // Try to get data from actualEvent
  let data =
    actualEvent.data ||
    actualEvent?.data?.data ||
    actualEvent?.data?.object ||
    actualEvent?.data?.user;
  if (!data) {
    throw new Error(
      "Event data is undefined. Event received: " +
        JSON.stringify(actualEvent, null, 2)
    );
  }
  return data;
}

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async (event) => {
    const data = extractUserData(event);
    const { id, first_name, last_name, email_addresses, image_url } = data;
    const userdata = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };
    await User.create(userdata);
  }
);

// Inngest Function to delete user data from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async (event) => {
    const data = extractUserData(event);
    const { id } = data;
    await User.findByIdAndDelete(id);
  }
);

// Inngest Function to update user data in the database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async (event) => {
    const data = extractUserData(event);
    const { id, first_name, last_name, email_addresses, image_url } = data;
    const userdata = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };
    await User.findByIdAndUpdate(id, userdata);
  }
);

// Inngest Function to cancel booking and release seats of show after 10 minutes of booking created if paymetn is not made

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
  },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      // If payment is not made, release seats and delete booking
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  }
);

// Inngest Function to send email when user books a show

const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async (event, step) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `<div style="font-family: Arial, sans-serif; line-height:1.5;">
    <h2>Hi ${booking.user.name},</h2>
    <p>Your booking for <strong style="color: #F84565; ">" ${
      booking.show.movie.title
    }"</strong> is confirmed.</p>
    <p>
      <strong>Date:</strong>${new Date(
        booking.show.showDateTime
      ).toLocaleDateString("en-US", {
        timeZone: "Asia/Kolkata",
      })}<br/>
      <strong>Time:</strong> ${new Date(
        booking.show.showDateTime
      ).toLocaleTimeString(" en-US ", { timeZone: "Asia/Kolkata" })}
    </p>
    <p>Enjoy the show! 🍿</p>
    <p>Thanks for booking with us! <br/>— MovieShow Team </p>
    </div>`,
    });
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail
];
