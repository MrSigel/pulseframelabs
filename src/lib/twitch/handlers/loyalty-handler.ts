import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { createClient } from "@/lib/supabase/client";

interface LoyaltyState {
  activeSessionId: string | null;
  keyword: string;
  pointsAmount: number;
}

export function createLoyaltyHandler(state: LoyaltyState): MessageHandler {
  return {
    name: "loyalty",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      return message.trim().toLowerCase() === state.keyword.toLowerCase();
    },
    async handle(_channel: string, tags: ChatUserstate, _message: string, context: HandlerContext) {
      if (!state.activeSessionId) return;

      const username = tags["display-name"] || tags.username || "anonymous";
      const supabase = createClient();

      // Check if already participated (unique constraint will also catch this)
      const { data: existing } = await supabase
        .from("giveaway_participants")
        .select("id")
        .eq("session_id", state.activeSessionId)
        .eq("username", username)
        .maybeSingle();

      if (existing) return; // silently ignore duplicates

      // Add participant
      await supabase.from("giveaway_participants").insert({
        user_id: context.userId,
        session_id: state.activeSessionId,
        username,
      });

      // Add or update viewer points
      const { data: viewer } = await supabase
        .from("stream_viewers")
        .select("id, total_points")
        .eq("user_id", context.userId)
        .eq("username", username)
        .maybeSingle();

      if (viewer) {
        await supabase
          .from("stream_viewers")
          .update({ total_points: viewer.total_points + state.pointsAmount })
          .eq("id", viewer.id);

        await supabase.from("points_transactions").insert({
          user_id: context.userId,
          viewer_id: viewer.id,
          amount: state.pointsAmount,
          reason: `Giveaway: ${state.keyword}`,
          type: "add",
        });
      } else {
        const { data: newViewer } = await supabase
          .from("stream_viewers")
          .insert({
            user_id: context.userId,
            username,
            total_points: state.pointsAmount,
            watch_time_minutes: 0,
            last_seen: new Date().toISOString(),
          })
          .select()
          .single();

        if (newViewer) {
          await supabase.from("points_transactions").insert({
            user_id: context.userId,
            viewer_id: newViewer.id,
            amount: state.pointsAmount,
            reason: `Giveaway: ${state.keyword}`,
            type: "add",
          });
        }
      }
    },
  };
}
