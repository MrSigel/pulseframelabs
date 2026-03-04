import { createClient } from "./client";
import type {
  BotCustomCommand, Bonushunt, BonushuntEntry, BalanceProfile, Casino, CasinoDeal, ChatMessage,
  DashboardStat, DuelSession, DuelPlayer, Game, GiveawayHistoryEntry,
  GiveawaySession, GiveawayParticipant,
  HotwordSettings, HotwordEntry, LoyaltyPreset, Moderator,
  Package, PaymentRequest,
  PersonalBest, PointsBattleBet, PointsBattlePreset, PointsBattleSession,
  PointsTransaction, Promotion, QuickGuessSettings, QuickGuessSession,
  QuickGuessEntry, QuickGuessHistoryEntry, RaffleHistoryEntry,
  SlotBattle, SlotBattleEntry, SlotRequest, SlotRequestSettings,
  SlideshowItem, SpinnerPrize, SpinnerHistoryEntry, StoreItem,
  StoreRedemption, StoreSettings, StreamerPageSettings, StreamPointsConfig,
  StreamViewer, ThemeSettings, Tournament, TournamentBet, TournamentParticipant, BracketData, TwitchConnection, UserProfile,
  UserSubscription, WagerSession, Wallet, WalletTransaction,
} from "./types";

// ============================================================
// Generic helpers
// ============================================================

function getSupabase() {
  return createClient();
}

async function getUserId(): Promise<string> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// Generic select for a table filtered by user_id
async function selectByUser<T>(
  table: string,
  orderBy?: string,
  ascending = true,
): Promise<T[]> {
  const supabase = getSupabase();
  const userId = await getUserId();
  let query = supabase.from(table).select("*").eq("user_id", userId);
  if (orderBy) query = query.order(orderBy, { ascending });
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

// Generic select single row for a table (for singleton settings)
async function selectSingleByUser<T>(table: string): Promise<T | null> {
  const supabase = getSupabase();
  const userId = await getUserId();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as T | null;
}

// Generic insert
async function insertRow<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const supabase = getSupabase();
  const userId = await getUserId();
  const { data, error } = await supabase
    .from(table)
    .insert({ ...row, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

// Generic update by id — always scoped to current user
async function updateRow<T>(table: string, id: string, updates: Record<string, unknown>): Promise<T> {
  const supabase = getSupabase();
  const userId = await getUserId();
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

// Generic upsert for singleton settings (one row per user)
async function upsertSingleton<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const supabase = getSupabase();
  const userId = await getUserId();
  const { data, error } = await supabase
    .from(table)
    .upsert({ ...row, user_id: userId }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

// Generic delete by id — always scoped to current user
async function deleteRow(table: string, id: string): Promise<void> {
  const supabase = getSupabase();
  const userId = await getUserId();
  const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

// Delete all rows for a user in a table
async function deleteAllByUser(table: string): Promise<void> {
  const supabase = getSupabase();
  const userId = await getUserId();
  const { error } = await supabase.from(table).delete().eq("user_id", userId);
  if (error) throw error;
}

// ============================================================
// User Profile
// ============================================================
export const userProfiles = {
  get: () => selectSingleByUser<UserProfile>("user_profiles"),
  update: (updates: Partial<UserProfile>) =>
    userProfiles.get().then((p) => p ? updateRow<UserProfile>("user_profiles", p.id, updates) : null),
};

// ============================================================
// Dashboard Stats
// ============================================================
export const dashboardStats = {
  get: () => selectSingleByUser<DashboardStat>("dashboard_stats"),
  update: (updates: Partial<DashboardStat>) =>
    dashboardStats.get().then((s) => s ? updateRow<DashboardStat>("dashboard_stats", s.id, updates) : null),
};

// ============================================================
// Casinos
// ============================================================
export const casinos = {
  list: () => selectByUser<Casino>("casinos", "created_at", false),
  create: (data: { name: string; description?: string; image_url?: string }) =>
    insertRow<Casino>("casinos", data),
  update: (id: string, updates: Partial<Casino>) => updateRow<Casino>("casinos", id, updates),
  remove: (id: string) => deleteRow("casinos", id),
};

// ============================================================
// Bonushunts
// ============================================================
export const bonushunts = {
  list: () => selectByUser<Bonushunt>("bonushunts", "created_at", false),
  create: (data: { name: string; description?: string; start_balance?: number; currency?: string }) =>
    insertRow<Bonushunt>("bonushunts", data),
  update: (id: string, updates: Partial<Bonushunt>) => updateRow<Bonushunt>("bonushunts", id, updates),
  remove: (id: string) => deleteRow("bonushunts", id),
  entries: {
    list: async (bonushuntId: string) => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("bonushunt_entries")
        .select("*")
        .eq("bonushunt_id", bonushuntId)
        .eq("user_id", userId)
        .order("position");
      if (error) throw error;
      return (data ?? []) as BonushuntEntry[];
    },
    listAll: () => selectByUser<BonushuntEntry>("bonushunt_entries", "created_at", false),
    create: (data: { bonushunt_id: string; game_name: string; provider?: string; buy_in?: number; win_amount?: number; multiplier?: number; position?: number }) =>
      insertRow<BonushuntEntry>("bonushunt_entries", data),
    update: (id: string, updates: Partial<BonushuntEntry>) =>
      updateRow<BonushuntEntry>("bonushunt_entries", id, updates),
    remove: (id: string) => deleteRow("bonushunt_entries", id),
  },
};

// ============================================================
// Wager Sessions
// ============================================================
export const wagerSessions = {
  getActive: async () => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("wager_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    return data as WagerSession | null;
  },
  list: () => selectByUser<WagerSession>("wager_sessions", "created_at", false),
  create: (data: Partial<WagerSession>) => insertRow<WagerSession>("wager_sessions", data),
  update: (id: string, updates: Partial<WagerSession>) => updateRow<WagerSession>("wager_sessions", id, updates),
  remove: (id: string) => deleteRow("wager_sessions", id),
};

// ============================================================
// Balance Profiles (singleton per user)
// ============================================================
export const balanceProfiles = {
  get: () => selectSingleByUser<BalanceProfile>("balance_profiles"),
  update: (updates: Partial<BalanceProfile>) =>
    upsertSingleton<BalanceProfile>("balance_profiles", updates),
};

// ============================================================
// Duel Sessions
// ============================================================
export const duelSessions = {
  getActive: async () => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("duel_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw error;
    return data as DuelSession | null;
  },
  create: (data: { max_players?: number; raffle_pool?: boolean }) =>
    insertRow<DuelSession>("duel_sessions", data),
  update: (id: string, updates: Partial<DuelSession>) => updateRow<DuelSession>("duel_sessions", id, updates),
  players: {
    list: async (sessionId: string) => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("duel_players")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .order("position");
      if (error) throw error;
      return (data ?? []) as DuelPlayer[];
    },
    create: (data: { session_id: string; name?: string; position?: number }) =>
      insertRow<DuelPlayer>("duel_players", data),
    update: (id: string, updates: Partial<DuelPlayer>) => updateRow<DuelPlayer>("duel_players", id, updates),
    remove: (id: string) => deleteRow("duel_players", id),
  },
};

// ============================================================
// Slot Battles
// ============================================================
export const slotBattles = {
  list: () => selectByUser<SlotBattle>("slot_battles", "created_at", false),
  create: (data: { name: string; start_balance?: number; currency?: string; number_of_buys?: number }) =>
    insertRow<SlotBattle>("slot_battles", data),
  update: (id: string, updates: Partial<SlotBattle>) => updateRow<SlotBattle>("slot_battles", id, updates),
  remove: (id: string) => deleteRow("slot_battles", id),
  entries: {
    list: async (battleId: string) => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("slot_battle_entries")
        .select("*")
        .eq("battle_id", battleId)
        .eq("user_id", userId)
        .order("position");
      if (error) throw error;
      return (data ?? []) as SlotBattleEntry[];
    },
    create: (data: { battle_id: string; game_name: string; buy_in?: number }) =>
      insertRow<SlotBattleEntry>("slot_battle_entries", data),
    update: (id: string, updates: Partial<SlotBattleEntry>) =>
      updateRow<SlotBattleEntry>("slot_battle_entries", id, updates),
    remove: (id: string) => deleteRow("slot_battle_entries", id),
  },
};

// ============================================================
// Tournaments
// ============================================================
export const tournaments = {
  list: () => selectByUser<Tournament>("tournaments", "created_at", false),
  create: (data: { name: string; description?: string; participant_count?: number }) =>
    insertRow<Tournament>("tournaments", { ...data, status: "join_open" }),
  update: (id: string, updates: Partial<Tournament>) => updateRow<Tournament>("tournaments", id, updates),
  remove: (id: string) => deleteRow("tournaments", id),
  getJoinOpen: async (userId: string): Promise<Tournament | null> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "join_open")
      .maybeSingle();
    if (error) throw error;
    return data as Tournament | null;
  },
  participants: {
    list: async (tournamentId: string): Promise<TournamentParticipant[]> => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("*")
        .eq("user_id", userId)
        .eq("tournament_id", tournamentId)
        .order("joined_at");
      if (error) throw error;
      return (data ?? []) as TournamentParticipant[];
    },
    listByStreamer: async (tournamentId: string, streamerId: string): Promise<TournamentParticipant[]> => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("*")
        .eq("user_id", streamerId)
        .eq("tournament_id", tournamentId)
        .order("joined_at");
      if (error) throw error;
      return (data ?? []) as TournamentParticipant[];
    },
    add: async (tournamentId: string, viewerUsername: string, streamerId: string, gameName: string = ''): Promise<void> => {
      const supabase = getSupabase();

      // Lookup the viewer's most recently purchased badge
      let badgeImageUrl: string | null = null;
      try {
        const { data: redemptions } = await supabase
          .from("store_redemptions")
          .select("item_id, redeemed_at")
          .eq("user_id", streamerId)
          .eq("viewer_username", viewerUsername)
          .eq("status", "completed")
          .order("redeemed_at", { ascending: false });

        if (redemptions && redemptions.length > 0) {
          const itemIds = redemptions.map((r: { item_id: string }) => r.item_id);
          const { data: badgeItems } = await supabase
            .from("store_items")
            .select("id, image_url")
            .eq("user_id", streamerId)
            .eq("item_type", "badge")
            .in("id", itemIds);

          if (badgeItems && badgeItems.length > 0) {
            for (const r of redemptions) {
              const badge = badgeItems.find(
                (b: { id: string; image_url: string | null }) => b.id === r.item_id
              );
              if (badge?.image_url) {
                badgeImageUrl = badge.image_url;
                break;
              }
            }
          }
        }
      } catch {
        // Badge lookup is non-critical — continue without badge
      }

      const { error } = await supabase
        .from("tournament_participants")
        .upsert(
          {
            user_id: streamerId,
            tournament_id: tournamentId,
            viewer_username: viewerUsername,
            game_name: gameName,
            badge_image_url: badgeImageUrl,
          },
          { onConflict: "tournament_id,viewer_username", ignoreDuplicates: false }
        );
      if (error) throw error;
    },
    clear: async (tournamentId: string): Promise<void> => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { error } = await supabase
        .from("tournament_participants")
        .delete()
        .eq("user_id", userId)
        .eq("tournament_id", tournamentId);
      if (error) throw error;
    },
  },
  updateBracket: async (id: string, bracketData: BracketData): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("tournaments")
      .update({ bracket_data: bracketData as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
  bets: {
    list: async (tournamentId: string): Promise<TournamentBet[]> => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("tournament_bets")
        .select("*")
        .eq("user_id", userId)
        .eq("tournament_id", tournamentId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as TournamentBet[];
    },
    place: async (tournamentId: string, viewerUsername: string, betOnPlayer: string, amount: number): Promise<void> => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { error } = await supabase.from("tournament_bets").insert({
        user_id: userId,
        tournament_id: tournamentId,
        viewer_username: viewerUsername,
        bet_on_player: betOnPlayer,
        amount,
        resolved: false,
        won: null,
      });
      if (error) throw error;
    },
    resolveEliminated: async (tournamentId: string, eliminatedPlayer: string): Promise<void> => {
      const supabase = getSupabase();
      const userId = await getUserId();
      await supabase
        .from("tournament_bets")
        .update({ resolved: true, won: false })
        .eq("user_id", userId)
        .eq("tournament_id", tournamentId)
        .eq("bet_on_player", eliminatedPlayer)
        .eq("resolved", false);
    },
    resolveWinner: async (tournamentId: string, winnerName: string): Promise<void> => {
      const supabase = getSupabase();
      const userId = await getUserId();
      // Mark winning bets
      await supabase
        .from("tournament_bets")
        .update({ resolved: true, won: true })
        .eq("user_id", userId)
        .eq("tournament_id", tournamentId)
        .eq("bet_on_player", winnerName)
        .eq("resolved", false);
      // Mark remaining bets as lost
      await supabase
        .from("tournament_bets")
        .update({ resolved: true, won: false })
        .eq("user_id", userId)
        .eq("tournament_id", tournamentId)
        .eq("resolved", false);
      // Payout winners (2x multiplier)
      const { data: winningBets } = await supabase
        .from("tournament_bets")
        .select("*")
        .eq("user_id", userId)
        .eq("tournament_id", tournamentId)
        .eq("won", true);
      if (!winningBets) return;
      for (const bet of winningBets) {
        const payout = bet.amount * 2;
        const { data: viewer } = await supabase
          .from("stream_viewers")
          .select("id, total_points")
          .eq("user_id", userId)
          .ilike("username", bet.viewer_username)
          .maybeSingle();
        if (viewer) {
          await supabase
            .from("stream_viewers")
            .update({ total_points: viewer.total_points + payout })
            .eq("id", viewer.id);
          await supabase.from("points_transactions").insert({
            user_id: userId,
            viewer_id: viewer.id,
            amount: payout,
            reason: `Tournament bet won (${bet.bet_on_player})`,
            type: "add",
          });
        }
      }
    },
  },
};

// ============================================================
// Spinner
// ============================================================
export const spinner = {
  prizes: {
    list: () => selectByUser<SpinnerPrize>("spinner_prizes", "position"),
    create: (data: { prize: string; color: string; position?: number }) =>
      insertRow<SpinnerPrize>("spinner_prizes", data),
    update: (id: string, updates: Partial<SpinnerPrize>) =>
      updateRow<SpinnerPrize>("spinner_prizes", id, updates),
    remove: (id: string) => deleteRow("spinner_prizes", id),
  },
  history: {
    list: () => selectByUser<SpinnerHistoryEntry>("spinner_history", "spun_at", false),
    create: (data: { winner: string }) => insertRow<SpinnerHistoryEntry>("spinner_history", data),
    clear: () => deleteAllByUser("spinner_history"),
  },
};

// ============================================================
// Loyalty
// ============================================================
export const loyalty = {
  presets: {
    list: () => selectByUser<LoyaltyPreset>("loyalty_presets", "created_at", false),
    create: (data: { name: string; keyword: string; points?: number; duration_seconds?: number }) =>
      insertRow<LoyaltyPreset>("loyalty_presets", data),
    update: (id: string, updates: Partial<LoyaltyPreset>) =>
      updateRow<LoyaltyPreset>("loyalty_presets", id, updates),
    remove: (id: string) => deleteRow("loyalty_presets", id),
  },
  history: {
    list: () => selectByUser<GiveawayHistoryEntry>("giveaway_history", "started_at", false),
    create: (data: { keyword: string; points_amount: number; duration_seconds: number; participant_count?: number }) =>
      insertRow<GiveawayHistoryEntry>("giveaway_history", data),
  },
};

// ============================================================
// Points Battle
// ============================================================
export const pointsBattle = {
  presets: {
    list: () => selectByUser<PointsBattlePreset>("points_battle_presets", "created_at", false),
    create: (data: { name: string; options: unknown; min_points?: number; max_points?: number; duration_seconds?: number }) =>
      insertRow<PointsBattlePreset>("points_battle_presets", data),
    update: (id: string, updates: Partial<PointsBattlePreset>) =>
      updateRow<PointsBattlePreset>("points_battle_presets", id, updates),
    remove: (id: string) => deleteRow("points_battle_presets", id),
  },
  sessions: {
    getActive: async () => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("points_battle_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data as PointsBattleSession | null;
    },
    create: (data: { options: unknown; min_points?: number; max_points?: number; duration_seconds?: number }) =>
      insertRow<PointsBattleSession>("points_battle_sessions", data),
    update: (id: string, updates: Partial<PointsBattleSession>) =>
      updateRow<PointsBattleSession>("points_battle_sessions", id, updates),
  },
};

// ============================================================
// Quick Guesses
// ============================================================
export const quickGuesses = {
  settings: {
    get: () => selectSingleByUser<QuickGuessSettings>("quick_guess_settings"),
    update: (updates: Partial<QuickGuessSettings>) =>
      upsertSingleton<QuickGuessSettings>("quick_guess_settings", updates),
  },
  sessions: {
    getActive: async () => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("quick_guess_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_open", true)
        .maybeSingle();
      if (error) throw error;
      return data as QuickGuessSession | null;
    },
    create: () => insertRow<QuickGuessSession>("quick_guess_sessions", { is_open: true }),
    update: (id: string, updates: Partial<QuickGuessSession>) =>
      updateRow<QuickGuessSession>("quick_guess_sessions", id, updates),
  },
  entries: {
    list: async (sessionId: string) => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("quick_guess_entries")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .order("guessed_at");
      if (error) throw error;
      return (data ?? []) as QuickGuessEntry[];
    },
    create: (data: { session_id: string; username: string; guess: string }) =>
      insertRow<QuickGuessEntry>("quick_guess_entries", data),
    remove: (id: string) => deleteRow("quick_guess_entries", id),
    clearSession: async (sessionId: string) => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { error } = await supabase
        .from("quick_guess_entries")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", userId);
      if (error) throw error;
    },
  },
  history: {
    list: () => selectByUser<QuickGuessHistoryEntry>("quick_guess_history", "played_at", false),
    create: (data: { participant_count: number; winner: string; winning_guess: string }) =>
      insertRow<QuickGuessHistoryEntry>("quick_guess_history", data),
  },
};

// ============================================================
// Slot Requests
// ============================================================
export const slotRequests = {
  settings: {
    get: () => selectSingleByUser<SlotRequestSettings>("slot_request_settings"),
    update: (updates: Partial<SlotRequestSettings>) =>
      upsertSingleton<SlotRequestSettings>("slot_request_settings", updates),
  },
  list: () => selectByUser<SlotRequest>("slot_requests", "requested_at", false),
  create: (data: { viewer_username: string; slot_name: string }) =>
    insertRow<SlotRequest>("slot_requests", data),
  update: (id: string, updates: Partial<SlotRequest>) => updateRow<SlotRequest>("slot_requests", id, updates),
  remove: (id: string) => deleteRow("slot_requests", id),
  clearAll: () => deleteAllByUser("slot_requests"),
  clearPending: async () => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { error } = await supabase
      .from("slot_requests")
      .delete()
      .eq("user_id", userId)
      .eq("status", "pending");
    if (error) throw error;
  },
  raffleHistory: {
    list: () => selectByUser<RaffleHistoryEntry>("raffle_history", "raffled_at", false),
    create: (data: { slot_name: string; winner: string }) =>
      insertRow<RaffleHistoryEntry>("raffle_history", data),
  },
};

// ============================================================
// Hotwords
// ============================================================
export const hotwords = {
  settings: {
    get: () => selectSingleByUser<HotwordSettings>("hotword_settings"),
    update: (updates: Partial<HotwordSettings>) =>
      upsertSingleton<HotwordSettings>("hotword_settings", updates),
  },
  entries: {
    list: () => selectByUser<HotwordEntry>("hotword_entries", "count", false),
    create: (data: { word: string; count?: number }) => insertRow<HotwordEntry>("hotword_entries", data),
    update: (id: string, updates: Partial<HotwordEntry>) => updateRow<HotwordEntry>("hotword_entries", id, updates),
    clearAll: () => deleteAllByUser("hotword_entries"),
  },
};

// ============================================================
// Moderators
// ============================================================
export const moderators = {
  list: () => selectByUser<Moderator>("moderators", "created_at", false),
  create: (data: { moderator_email: string; permissions?: unknown }) =>
    insertRow<Moderator>("moderators", data),
  update: (id: string, updates: Partial<Moderator>) => updateRow<Moderator>("moderators", id, updates),
  remove: (id: string) => deleteRow("moderators", id),
};

// ============================================================
// Games (Now Playing)
// ============================================================
export const games = {
  list: () => selectByUser<Game>("games", "updated_at", false),
  create: (data: { name: string; provider?: string; image_url?: string }) =>
    insertRow<Game>("games", data),
  update: (id: string, updates: Partial<Game>) => updateRow<Game>("games", id, updates),
  remove: (id: string) => deleteRow("games", id),
  setPlaying: async (id: string) => {
    const supabase = getSupabase();
    const userId = await getUserId();
    // Unset all first
    await supabase.from("games").update({ is_playing: false }).eq("user_id", userId);
    // Set the one
    return updateRow<Game>("games", id, { is_playing: true });
  },
};

// ============================================================
// Personal Bests
// ============================================================
export const personalBests = {
  list: () => selectByUser<PersonalBest>("personal_bests", "win_amount", false),
  create: (data: { game_name: string; provider?: string; win_amount?: number; multiplier?: number }) =>
    insertRow<PersonalBest>("personal_bests", data),
  remove: (id: string) => deleteRow("personal_bests", id),
};

// ============================================================
// Chat Messages
// ============================================================
export const chatMessages = {
  list: async (limit = 100) => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  },
  create: (data: { username: string; user_role?: string; message: string }) =>
    insertRow<ChatMessage>("chat_messages", data),
  clearAll: () => deleteAllByUser("chat_messages"),
};

// ============================================================
// Slideshow
// ============================================================
export const slideshow = {
  list: () => selectByUser<SlideshowItem>("slideshow_items", "position"),
  create: (data: { casino_name: string; position?: number }) =>
    insertRow<SlideshowItem>("slideshow_items", data),
  update: (id: string, updates: Partial<SlideshowItem>) =>
    updateRow<SlideshowItem>("slideshow_items", id, updates),
  remove: (id: string) => deleteRow("slideshow_items", id),
};

// ============================================================
// Store
// ============================================================
export const store = {
  settings: {
    get: () => selectSingleByUser<StoreSettings>("store_settings"),
    update: (updates: Partial<StoreSettings>) =>
      upsertSingleton<StoreSettings>("store_settings", updates),
  },
  items: {
    list: () => selectByUser<StoreItem>("store_items", "created_at", false),
    create: (data: { name: string; description?: string; price_points?: number; quantity_available?: number; item_type?: 'item' | 'badge'; image_url?: string }) =>
      insertRow<StoreItem>("store_items", data),
    update: (id: string, updates: Partial<StoreItem>) => updateRow<StoreItem>("store_items", id, updates),
    remove: (id: string) => deleteRow("store_items", id),
  },
  redemptions: {
    list: () => selectByUser<StoreRedemption>("store_redemptions", "redeemed_at", false),
    create: (data: { item_id: string; viewer_username: string; viewer_email?: string }) =>
      insertRow<StoreRedemption>("store_redemptions", data),
    update: (id: string, updates: Partial<StoreRedemption>) =>
      updateRow<StoreRedemption>("store_redemptions", id, updates),
  },
};

// ============================================================
// Stream Viewers & Points
// ============================================================
export const streamViewers = {
  list: () => selectByUser<StreamViewer>("stream_viewers", "total_points", false),
  create: (data: { username: string; total_points?: number }) =>
    insertRow<StreamViewer>("stream_viewers", data),
  update: (id: string, updates: Partial<StreamViewer>) =>
    updateRow<StreamViewer>("stream_viewers", id, updates),
  remove: (id: string) => deleteRow("stream_viewers", id),
  transactions: {
    list: () => selectByUser<PointsTransaction>("points_transactions", "created_at", false),
    create: (data: { viewer_id?: string; amount: number; reason?: string; type?: string }) =>
      insertRow<PointsTransaction>("points_transactions", data),
  },
};

// ============================================================
// Stream Points Config (singleton)
// ============================================================
export const streamPointsConfig = {
  get: () => selectSingleByUser<StreamPointsConfig>("stream_points_config"),
  update: (updates: Partial<StreamPointsConfig>) =>
    upsertSingleton<StreamPointsConfig>("stream_points_config", updates),
};

// ============================================================
// Promotions
// ============================================================
export const promotions = {
  list: () => selectByUser<Promotion>("promotions", "created_at", false),
  create: (data: { title: string; description?: string; code?: string }) =>
    insertRow<Promotion>("promotions", data),
  update: (id: string, updates: Partial<Promotion>) => updateRow<Promotion>("promotions", id, updates),
  remove: (id: string) => deleteRow("promotions", id),
};

// ============================================================
// Theme Settings (singleton)
// ============================================================
export const themeSettingsDb = {
  get: () => selectSingleByUser<ThemeSettings>("theme_settings"),
  update: (updates: Partial<ThemeSettings>) =>
    upsertSingleton<ThemeSettings>("theme_settings", updates),
};

// ============================================================
// Twitch Connections (singleton per user)
// ============================================================
export const twitchConnections = {
  get: () => selectSingleByUser<TwitchConnection>("twitch_connections"),
  upsert: (data: { twitch_user_id: string; twitch_username: string; access_token: string; refresh_token: string; scopes?: string[] }) =>
    upsertSingleton<TwitchConnection>("twitch_connections", data),
  remove: async () => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { error } = await supabase.from("twitch_connections").delete().eq("user_id", userId);
    if (error) throw error;
  },
};

// ============================================================
// Points Battle Bets
// ============================================================
export const pointsBattleBets = {
  list: async (sessionId: string) => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("points_battle_bets")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .order("placed_at");
    if (error) throw error;
    return (data ?? []) as PointsBattleBet[];
  },
  create: (data: { session_id: string; viewer_username: string; option_index: number; amount: number }) =>
    insertRow<PointsBattleBet>("points_battle_bets", data),
};

// ============================================================
// Giveaway Sessions & Participants
// ============================================================
export const giveaways = {
  sessions: {
    getActive: async () => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("giveaway_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data as GiveawaySession | null;
    },
    create: (data: { keyword: string; points_amount: number; duration_seconds: number }) =>
      insertRow<GiveawaySession>("giveaway_sessions", data),
    update: (id: string, updates: Partial<GiveawaySession>) =>
      updateRow<GiveawaySession>("giveaway_sessions", id, updates),
  },
  participants: {
    list: async (sessionId: string) => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("giveaway_participants")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .order("joined_at");
      if (error) throw error;
      return (data ?? []) as GiveawayParticipant[];
    },
    create: (data: { session_id: string; username: string }) =>
      insertRow<GiveawayParticipant>("giveaway_participants", data),
    count: async (sessionId: string) => {
      const supabase = getSupabase();
      const userId = await getUserId();
      const { count, error } = await supabase
        .from("giveaway_participants")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("user_id", userId);
      if (error) throw error;
      return count ?? 0;
    },
  },
};

// ============================================================
// Wallet (singleton per user)
// ============================================================
export const wallet = {
  get: () => selectSingleByUser<Wallet>("wallets"),
  getTransactions: async (limit = 50): Promise<WalletTransaction[]> => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as WalletTransaction[];
  },
};

// ============================================================
// Packages (public, no user_id filter)
// ============================================================
export const packages = {
  list: async (): Promise<Package[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Package[];
  },
};

// ============================================================
// User Subscriptions
// ============================================================
export const userSubscriptions = {
  list: () => selectByUser<UserSubscription>("user_subscriptions", "created_at", false),
  getActive: async (): Promise<UserSubscription | null> => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as UserSubscription | null;
  },
};

// ============================================================
// Payment Requests
// ============================================================
export const paymentRequests = {
  list: () => selectByUser<PaymentRequest>("payment_requests", "created_at", false),
  getPending: async (): Promise<PaymentRequest[]> => {
    const supabase = getSupabase();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["pending", "confirming"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as PaymentRequest[];
  },
};

// ============================================================
// Bot Custom Commands
// ============================================================
export const botCustomCommands = {
  list: () => selectByUser<BotCustomCommand>("bot_custom_commands", "created_at"),
  create: (data: Pick<BotCustomCommand, "command" | "action_type" | "alias_target" | "response_text" | "cooldown_seconds">) =>
    insertRow<BotCustomCommand>("bot_custom_commands", data),
  update: (id: string, data: Partial<Pick<BotCustomCommand, "command" | "action_type" | "alias_target" | "response_text" | "enabled" | "cooldown_seconds">>) =>
    updateRow<BotCustomCommand>("bot_custom_commands", id, data),
  remove: (id: string) => deleteRow("bot_custom_commands", id),
};

// ============================================================
// Streamer Page Settings (singleton)
// ============================================================
export const streamerPage = {
  get: () => selectSingleByUser<StreamerPageSettings>("streamer_page_settings"),
  update: async (updates: Partial<StreamerPageSettings>): Promise<StreamerPageSettings> => {
    const supabase = getSupabase();
    const userId = await getUserId();

    // Check if a row already exists for this user
    const { data: existing } = await supabase
      .from("streamer_page_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("streamer_page_settings")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data as StreamerPageSettings;
    } else {
      const { data, error } = await supabase
        .from("streamer_page_settings")
        .insert({ ...updates, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data as StreamerPageSettings;
    }
  },
  getBySlug: async (slug: string): Promise<StreamerPageSettings | null> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("streamer_page_settings")
      .select("*")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw error;
    return data as StreamerPageSettings | null;
  },
};

// ============================================================
// Casino Deals
// ============================================================
export const casinoDeals = {
  list: () => selectByUser<CasinoDeal>("casino_deals", "sort_order"),
  create: (data: Omit<CasinoDeal, "id" | "user_id" | "created_at" | "updated_at">) =>
    insertRow<CasinoDeal>("casino_deals", data as Record<string, unknown>),
  update: (id: string, data: Partial<CasinoDeal>) =>
    updateRow<CasinoDeal>("casino_deals", id, data as Record<string, unknown>),
  remove: (id: string) => deleteRow("casino_deals", id),
  getByUserId: async (userId: string): Promise<CasinoDeal[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("casino_deals")
      .select("*")
      .eq("user_id", userId)
      .eq("enabled", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CasinoDeal[];
  },
};
