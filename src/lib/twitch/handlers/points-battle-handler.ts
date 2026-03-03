import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { createClient } from "@/lib/supabase/client";

interface PointsBattleOption {
  command: string;
  keyword: string;
  description: string;
}

interface PointsBattleState {
  activeSessionId: string | null;
  options: PointsBattleOption[];
  minPoints: number;
  maxPoints: number;
}

export function createPointsBattleHandler(state: PointsBattleState): MessageHandler {
  return {
    name: "points-battle",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      return message.toLowerCase().startsWith("!bet ");
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      if (!state.activeSessionId) return;

      const username = tags["display-name"] || tags.username || "anonymous";
      const parts = message.split(" ");
      const keyword = parts[1]?.toLowerCase();
      const amount = parseInt(parts[2] || "", 10);

      // Find matching option
      const optionIndex = state.options.findIndex(
        (o) => o.keyword.toLowerCase() === keyword
      );

      if (optionIndex === -1) {
        const validKeywords = state.options.map((o) => o.keyword).join(", ");
        context.say(`❌ @${username} ungültige Option. Nutze: ${validKeywords}`);
        return;
      }

      if (isNaN(amount) || amount < state.minPoints || amount > state.maxPoints) {
        context.say(`⚠️ @${username} Einsatz muss zwischen ${state.minPoints} und ${state.maxPoints} Punkten liegen.`);
        return;
      }

      const supabase = createClient();

      // Check viewer has enough points
      const { data: viewer } = await supabase
        .from("stream_viewers")
        .select("id, total_points")
        .eq("user_id", context.userId)
        .eq("username", username)
        .maybeSingle();

      if (!viewer || viewer.total_points < amount) {
        context.say(`💸 @${username} du hast nicht genug Punkte!`);
        return;
      }

      // Check if already bet
      const { data: existingBet } = await supabase
        .from("points_battle_bets")
        .select("id")
        .eq("session_id", state.activeSessionId)
        .eq("viewer_username", username)
        .maybeSingle();

      if (existingBet) {
        context.say(`⚠️ @${username} du hast bereits gewettet!`);
        return;
      }

      // Deduct points
      await supabase
        .from("stream_viewers")
        .update({ total_points: viewer.total_points - amount })
        .eq("id", viewer.id);

      // Place bet
      await supabase.from("points_battle_bets").insert({
        user_id: context.userId,
        session_id: state.activeSessionId,
        viewer_username: username,
        option_index: optionIndex,
        amount,
      });

      // Log transaction
      await supabase.from("points_transactions").insert({
        user_id: context.userId,
        viewer_id: viewer.id,
        amount: -amount,
        reason: `Bet on ${state.options[optionIndex].keyword}`,
        type: "remove",
      });

      context.say(`🎲 @${username} setzt ${amount} Punkte auf "${state.options[optionIndex].keyword}"! 🔥`);
    },
  };
}
