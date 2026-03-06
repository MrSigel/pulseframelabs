import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { bossfightSessions } from "@/lib/supabase/db";

export function createBossfightBetHandler(): MessageHandler {
  return {
    name: "bossfight-bet",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      const lower = message.trim().toLowerCase();
      return lower.startsWith("!team ");
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";
      const parts = message.trim().split(/\s+/);
      // Format: !team boss/player <amount>
      if (parts.length < 3) {
        context.say(`@${username} — Usage: !team boss <amount> or !team player <amount>`);
        return;
      }

      const teamRaw = parts[1].toLowerCase();
      const amount = parseInt(parts[2], 10);

      if (teamRaw !== "boss" && teamRaw !== "player" && teamRaw !== "players") {
        context.say(`@${username} — Choose "boss" or "player". Example: !team boss 100`);
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        context.say(`@${username} — Enter a valid amount. Example: !team boss 100`);
        return;
      }

      const team: "boss" | "players" = teamRaw === "boss" ? "boss" : "players";

      try {
        const session = await bossfightSessions.getBetting(context.userId);
        if (!session) return; // No betting session

        await bossfightSessions.bets.place(session.id, username, team, amount, context.userId);
        context.say(`@${username} bet ${amount} on ${team === "boss" ? "the BOSS" : "the PLAYERS"}! ✅`);
      } catch {
        // Ignore
      }
    },
  };
}
