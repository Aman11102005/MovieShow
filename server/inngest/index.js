import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async (event) => {
    if (!event.data) {
      throw new Error("Event data is undefined");
    }
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
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
  async ({ data }) => {
    if (!data) {
      throw new Error("Event data is undefined");
    }
    const { id } = data;
    await User.findByIdAndDelete(id);
  }
);

// Inngest Function to update user data in the database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ data }) => {
    if (!data) {
      throw new Error("Event data is undefined");
    }
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
