import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { createClient } from "@/lib/supabase/client";

interface TournamentBetState {
  activeTournamentId: string | null;
  drawnPlayers: string[];
  bettingOpen: boolean;
}

export function createTournamentBetHandler(state: TournamentBetState): MessageHandler {
  return {
    name: "tournament-bet",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      return message.toLowerCase().startsWith("!tbet ");
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      if (!state.activeTournamentId || !state.bettingOpen) return;

      const username = tags["display-name"] || tags.username || "anonymous";
      const parts = message.trim().split(/\s+/);

      if (parts.length < 3) {
        context.say(`@${username} Nutze: !tbet SpielerName Punkte`);
        return;
      }

      const playerName = parts[1];
      const amount = parseInt(parts[2], 10);

      // Validate player exists in drawn bracket
      const matchedPlayer = state.drawnPlayers.find(
        (p) => p.toLowerCase() === playerName.toLowerCase()
      );
      if (!matchedPlayer) {
        context.say(`@${username} Spieler "${playerName}" nicht im Turnier!`);
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        context.say(`@${username} Ungueltiger Betrag!`);
        return;
      }

      const supabase = createClient();

      // Check viewer has enough points
      const { data: viewer } = await supabase
        .from("stream_viewers")
        .select("id, total_points")
        .eq("user_id", context.userId)
        .ilike("username", username)
        .maybeSingle();

      if (!viewer || viewer.total_points < amount) {
        context.say(`@${username} Du hast nicht genug Punkte!`);
        return;
      }

      // Check if already bet
      const { data: existingBet } = await supabase
        .from("tournament_bets")
        .select("id")
        .eq("tournament_id", state.activeTournamentId)
        .eq("viewer_username", username)
        .maybeSingle();

      if (existingBet) {
        context.say(`@${username} Du hast bereits auf dieses Turnier gewettet!`);
        return;
      }

      // Deduct points
      await supabase
        .from("stream_viewers")
        .update({ total_points: viewer.total_points - amount })
        .eq("id", viewer.id);

      // Place bet
      await supabase.from("tournament_bets").insert({
        user_id: context.userId,
        tournament_id: state.activeTournamentId,
        viewer_username: username,
        bet_on_player: matchedPlayer,
        amount,
        resolved: false,
        won: null,
      });

      // Log transaction
      await supabase.from("points_transactions").insert({
        user_id: context.userId,
        viewer_id: viewer.id,
        amount: -amount,
        reason: `Turnierwette auf ${matchedPlayer}`,
        type: "remove",
      });

      context.say(`@${username} setzt ${amount} Punkte auf ${matchedPlayer}!`);
    },
  };
}
