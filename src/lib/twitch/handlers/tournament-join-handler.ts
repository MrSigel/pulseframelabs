import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { tournaments } from "@/lib/supabase/db";

export function createTournamentJoinHandler(): MessageHandler {
  return {
    name: "tournament-join",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      const lower = message.trim().toLowerCase();
      return lower === "!join" || lower.startsWith("!join ");
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";

      // Parse game name: everything after "!join "
      const trimmed = message.trim();
      const gameName = trimmed.length > 5 ? trimmed.slice(5).trim() : "";

      try {
        // Find the open tournament for this streamer
        const tournament = await tournaments.getJoinOpen(context.userId);
        if (!tournament) return; // No join_open tournament — silently ignore

        await tournaments.participants.add(tournament.id, username, context.userId, gameName);

        const gameInfo = gameName ? ` (${gameName})` : "";
        context.say(`@${username} wurde zum Turnier "${tournament.name}" angemeldet${gameInfo}! 🏆`);
      } catch {
        // Ignore duplicate join errors silently
      }
    },
  };
}
