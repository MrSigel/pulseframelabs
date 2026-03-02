import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { tournaments } from "@/lib/supabase/db";

export function createTournamentJoinHandler(): MessageHandler {
  return {
    name: "tournament-join",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      return message.trim().toLowerCase() === "!join";
    },
    async handle(_channel: string, tags: ChatUserstate, _message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";

      try {
        // Find the open tournament for this streamer
        const tournament = await tournaments.getJoinOpen(context.userId);
        if (!tournament) return; // No join_open tournament — silently ignore

        await tournaments.participants.add(tournament.id, username, context.userId);
        context.say(`@${username} wurde zum Turnier "${tournament.name}" angemeldet! 🏆`);
      } catch {
        // Ignore duplicate join errors silently
      }
    },
  };
}
