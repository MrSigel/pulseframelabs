import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { joinSessions } from "@/lib/supabase/db";

export function createJoinHandler(): MessageHandler {
  return {
    name: "join-draw",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      return message.trim().toLowerCase() === "!join";
    },
    async handle(_channel: string, tags: ChatUserstate, _message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";

      try {
        const session = await joinSessions.getOpen(context.userId);
        if (!session) return; // No open session — silently ignore

        await joinSessions.participants.add(session.id, username, context.userId);
        context.say(`@${username} joined! ✅`);
      } catch {
        // Ignore errors silently
      }
    },
  };
}
