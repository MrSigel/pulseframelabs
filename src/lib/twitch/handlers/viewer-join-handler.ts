import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { createClient } from "@/lib/supabase/client";

interface ViewerJoinConfig {
  streamerUsername: string;
}

/**
 * Handler for !joinSTREAMERNAME command.
 * Registers a viewer in the stream_viewers table so they can accumulate points.
 */
export function createViewerJoinHandler(config: ViewerJoinConfig): MessageHandler {
  const keyword = `!join${config.streamerUsername}`.toLowerCase();

  return {
    name: "viewer-join",
    enabled: true,

    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      return message.trim().toLowerCase() === keyword;
    },

    async handle(_channel: string, tags: ChatUserstate, _message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";
      const lowerUser = username.toLowerCase();

      try {
        const supabase = createClient();

        // Check if viewer already exists
        const { data: existing } = await supabase
          .from("stream_viewers")
          .select("id, total_points")
          .eq("user_id", context.userId)
          .ilike("username", lowerUser)
          .limit(1)
          .maybeSingle();

        if (existing) {
          context.say(`✅ @${username}, du bist bereits registriert! Deine Punkte: ${existing.total_points.toLocaleString()} 🪙`);
          return;
        }

        // Register new viewer
        await supabase
          .from("stream_viewers")
          .insert({
            user_id: context.userId,
            username,
            total_points: 0,
            watch_time_minutes: 0,
          });

        context.say(`🎉 @${username} wurde erfolgreich registriert! Willkommen! 🌟`);
      } catch (err) {
        console.error(`Failed to register viewer ${username}:`, err);
        context.say(`❌ @${username}, Registrierung fehlgeschlagen. Bitte versuche es erneut.`);
      }
    },
  };
}
