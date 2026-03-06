import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { bossfightSessions } from "@/lib/supabase/db";

export function createBossfightJoinHandler(): MessageHandler {
  return {
    name: "bossfight-join",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      const lower = message.trim().toLowerCase();
      return lower === "!join" || lower.startsWith("!join ");
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";
      const trimmed = message.trim();
      const gameName = trimmed.length > 5 ? trimmed.slice(5).trim() : "";

      try {
        // Check if bossfight is in join_open phase
        const session = await bossfightSessions.getJoinOpen(context.userId);
        if (!session) return; // No open bossfight — let other handlers handle it

        // Add directly to bossfight_players as join pool (position = -1 means not yet drawn)
        await bossfightSessions.players.add(
          session.id, username, gameName, context.userId, false, -1
        );
        const gameInfo = gameName ? ` (${gameName})` : "";
        context.say(`@${username} joined the Bossfight${gameInfo}! ✅`);
      } catch {
        // Ignore
      }
    },
  };
}
