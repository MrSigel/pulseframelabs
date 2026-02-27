import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { chatMessages } from "@/lib/supabase/db";

function getUserRole(tags: ChatUserstate): "viewer" | "moderator" | "subscriber" {
  if (tags.mod) return "moderator";
  if (tags.subscriber) return "subscriber";
  return "viewer";
}

export function createChatHandler(): MessageHandler {
  return {
    name: "chat",
    enabled: true,
    canHandle() {
      return true; // relay every message
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, _context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";
      await chatMessages.create({
        username,
        user_role: getUserRole(tags),
        message,
      });
    },
  };
}
