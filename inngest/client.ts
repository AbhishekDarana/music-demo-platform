import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "artist-portal", eventKey: process.env.INNGEST_EVENT_KEY! });