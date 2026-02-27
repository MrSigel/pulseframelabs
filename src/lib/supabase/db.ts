import { createClient } from "./client";
import type {
  Bonushunt, BonushuntEntry, BalanceProfile, Casino, ChatMessage,
  DashboardStat, DuelSession, DuelPlayer, Game, GiveawayHistoryEntry,
  HotwordSettings, HotwordEntry, LoyaltyPreset, Moderator,
  PersonalBest, PointsBattlePreset, PointsBattleSession,
  PointsTransaction, Promotion, QuickGuessSettings, QuickGuessSession,
  QuickGuessEntry, QuickGuessHistoryEntry, RaffleHistoryEntry,
  SlotBattle, SlotBattleEntry, SlotRequest, SlotRequestSettings,
  SlideshowItem, SpinnerPrize, SpinnerHistoryEntry, StoreItem,
  StoreRedemption, StoreSettings, StreamPointsConfig, StreamViewer,
  ThemeSettings, Tournament, UserProfile, WagerSession,
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
  let query = supabase.from(table).select("*");
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

// Generic update by id
async function updateRow<T>(table: string, id: string, updates: Record<string, unknown>): Promise<T> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
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

// Generic delete by id
async function deleteRow(table: string, id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from(table).delete().eq("id", id);
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
      const { data, error } = await supabase
        .from("bonushunt_entries")
        .select("*")
        .eq("bonushunt_id", bonushuntId)
        .order("position");
      if (error) throw error;
      return (data ?? []) as BonushuntEntry[];
    },
    create: (data: { bonushunt_id: string; game_name: string; provider?: string; buy_in?: number }) =>
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
      const { data, error } = await supabase
        .from("duel_players")
        .select("*")
        .eq("session_id", sessionId)
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
      const { data, error } = await supabase
        .from("slot_battle_entries")
        .select("*")
        .eq("battle_id", battleId)
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
    insertRow<Tournament>("tournaments", data),
  update: (id: string, updates: Partial<Tournament>) => updateRow<Tournament>("tournaments", id, updates),
  remove: (id: string) => deleteRow("tournaments", id),
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
      const { data, error } = await supabase
        .from("quick_guess_entries")
        .select("*")
        .eq("session_id", sessionId)
        .order("guessed_at");
      if (error) throw error;
      return (data ?? []) as QuickGuessEntry[];
    },
    create: (data: { session_id: string; username: string; guess: string }) =>
      insertRow<QuickGuessEntry>("quick_guess_entries", data),
    remove: (id: string) => deleteRow("quick_guess_entries", id),
    clearSession: async (sessionId: string) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("quick_guess_entries")
        .delete()
        .eq("session_id", sessionId);
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
    create: (data: { name: string; description?: string; price_points?: number; quantity_available?: number }) =>
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
