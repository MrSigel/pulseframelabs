import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { createClient } from "@/lib/supabase/client";

interface PointsDropConfig {
  keyword: string;
  amount: number;
  onClaim?: (username: string) => void;
}

/**
 * Handler for points drops: when a viewer types the keyword in chat, they get points.
 * Each viewer can only claim once per drop.
 */
export function createPointsDropHandler(config: PointsDropConfig): MessageHandler {
  const claimed = new Set<string>();

  return {
    name: "points-drop",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      return message.trim().toLowerCase() === config.keyword.toLowerCase();
    },
    async handle(_channel: string, tags: ChatUserstate, _message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";
      const lowerUser = username.toLowerCase();

      // Prevent double-claim
      if (claimed.has(lowerUser)) return;
      claimed.add(lowerUser);

      try {
        const supabase = createClient();

        // Find existing viewer or create new one
        const { data: existing } = await supabase
          .from("stream_viewers")
          .select("id, total_points")
          .eq("user_id", context.userId)
          .ilike("username", lowerUser)
          .limit(1)
          .maybeSingle();

        if (existing) {
          // Update existing viewer's points
          await supabase
            .from("stream_viewers")
            .update({ total_points: existing.total_points + config.amount })
            .eq("id", existing.id);
        } else {
          // Create new viewer with the points
          await supabase
            .from("stream_viewers")
            .insert({ user_id: context.userId, username, total_points: config.amount, watch_time_minutes: 0 });
        }

        config.onClaim?.(username);
      } catch (err) {
        console.error(`Failed to award points to ${username}:`, err);
      }
    },
  };
}
