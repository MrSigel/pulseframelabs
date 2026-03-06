import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { guessSessions } from "@/lib/supabase/db";

export function createGuessHandler(): MessageHandler {
  return {
    name: "guess",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      // Match any message that is just a number (the guess)
      const trimmed = message.trim();
      return /^-?\d+(\.\d+)?$/.test(trimmed);
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";
      const guess = parseFloat(message.trim());
      if (isNaN(guess)) return;

      try {
        const session = await guessSessions.getOpen(context.userId);
        if (!session) return; // No open session — silently ignore

        // Check if this number is already taken by someone else
        const existing = await guessSessions.entries.getByNumber(session.id, guess, context.userId);
        if (existing && existing.username.toLowerCase() !== username.toLowerCase()) {
          context.say(`@${username} — ${guess} is already taken by ${existing.username}! Choose a different number.`);
          return;
        }

        // Upsert the guess (allows changing)
        await guessSessions.entries.upsert(session.id, username, guess, context.userId);
        context.say(`@${username} — your guess of ${guess} has been registered! ✅`);
      } catch {
        // Ignore errors silently
      }
    },
  };
}
