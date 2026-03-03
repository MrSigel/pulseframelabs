import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { slotRequests } from "@/lib/supabase/db";

export function createSlotRequestHandler(): MessageHandler {
  return {
    name: "slot-requests",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      const lower = message.toLowerCase().trim();
      return lower.startsWith("!sr ");
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      const args = message.slice(4).trim();
      const username = tags["display-name"] || tags.username || "anonymous";

      // Handle !sr cancel — remove own pending request
      if (args.toLowerCase() === "cancel") {
        try {
          const allRequests = await slotRequests.list();
          const own = allRequests.find(
            (r) =>
              r.viewer_username.toLowerCase() === username.toLowerCase() &&
              r.status === "pending"
          );
          if (own) {
            await slotRequests.remove(own.id);
            context.say(`🎰 @${username} dein Slot-Wunsch wurde entfernt! ❌`);
          } else {
            context.say(`@${username} du hast keinen aktiven Slot-Wunsch.`);
          }
        } catch {
          // Ignore errors
        }
        return;
      }

      const slotName = args;
      if (!slotName) return;

      // Check allow_multiple setting
      try {
        const settings = await slotRequests.settings.get();
        if (settings && !settings.allow_multiple) {
          const allRequests = await slotRequests.list();
          const existing = allRequests.find(
            (r) =>
              r.viewer_username.toLowerCase() === username.toLowerCase() &&
              r.status === "pending"
          );
          if (existing) {
            context.say(
              `@${username} du hast bereits einen Slot-Wunsch ("${existing.slot_name}"). Nutze !sr cancel um ihn zu entfernen.`
            );
            return;
          }
        }
      } catch {
        // If settings check fails, allow the request anyway
      }

      await slotRequests.create({
        viewer_username: username,
        slot_name: slotName,
      });

      context.say(`🎰 @${username} dein Slot-Wunsch "${slotName}" wurde hinzugefügt! ✅`);
    },
  };
}
