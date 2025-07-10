import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Helper to safely extract user data
function extractUserData(event) {
  // If event is an array, use the first element
  const actualEvent = Array.isArray(event) ? event[0] : event;
  // Log the event for debugging
  console.log("Inngest event received:", JSON.stringify(actualEvent, null, 2));
  // Try to get data from event.data or event.data.data or event.data.object
  let data = actualEvent.data || actualEvent?.data?.data || actualEvent?.data?.object || actualEvent?.data?.user;
  if (!data) throw new Error("Event data is undefined");
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

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];