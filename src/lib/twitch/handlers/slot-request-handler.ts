import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { slotRequests } from "@/lib/supabase/db";

export function createSlotRequestHandler(): MessageHandler {
  return {
    name: "slot-requests",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      return message.toLowerCase().startsWith("!sr ");
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      const slotName = message.slice(4).trim();
      if (!slotName) return;

      const username = tags["display-name"] || tags.username || "anonymous";

      await slotRequests.create({
        viewer_username: username,
        slot_name: slotName,
      });

      context.say(`@${username} your slot request "${slotName}" has been added!`);
    },
  };
}
