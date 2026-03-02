export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Helper type for table rows
type Row<T> = T;
type Insert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
type Update<T> = Partial<Omit<T, 'id'>> & { id?: string };

// ============================================================
// Table Row Types
// ============================================================

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  twitch_username: string | null;
  kick_username: string | null;
  timezone: string;
  is_locked: boolean;
  locked_at: string | null;
  locked_reason: string | null;
  ip_whitelist: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStat {
  id: string;
  user_id: string;
  total_wagered: number;
  total_deposits: number;
  total_withdrawals: number;
  net_profit: number;
  active_viewers: number;
  games_played: number;
  best_multiplier: number;
  total_users: number;
  updated_at: string;
}

export interface Casino {
  id: string;
  user_id: string;
  name: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bonushunt {
  id: string;
  user_id: string;
  name: string;
  description: string;
  start_balance: number;
  currency: string;
  status: 'active' | 'paused' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface BonushuntEntry {
  id: string;
  user_id: string;
  bonushunt_id: string;
  game_name: string;
  provider: string;
  buy_in: number;
  win_amount: number;
  multiplier: number;
  position: number;
  created_at: string;
}

export interface WagerSession {
  id: string;
  user_id: string;
  casino_name: string;
  header_text: string;
  bonus_type: string;
  currency: string;
  deposit_amount: number;
  bonus_amount: number;
  wager_amount: number;
  wagered_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BalanceProfile {
  id: string;
  user_id: string;
  currency: string;
  deposits: number;
  deposits_add: number;
  withdrawals: number;
  withdrawals_add: number;
  leftover: number;
  leftover_add: number;
  created_at: string;
  updated_at: string;
}

export interface DuelSession {
  id: string;
  user_id: string;
  max_players: number;
  raffle_pool: boolean;
  status: 'active' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface DuelPlayer {
  id: string;
  user_id: string;
  session_id: string;
  name: string;
  game: string;
  buy_in: string;
  result: string;
  rank: string;
  position: number;
  created_at: string;
}

export interface SlotBattle {
  id: string;
  user_id: string;
  name: string;
  start_balance: number;
  currency: string;
  number_of_buys: number;
  status: 'active' | 'paused' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface SlotBattleEntry {
  id: string;
  user_id: string;
  battle_id: string;
  game_name: string;
  buy_in: number;
  win_amount: number;
  multiplier: number;
  position: number;
  created_at: string;
}

export interface Tournament {
  id: string;
  user_id: string;
  name: string;
  description: string;
  participant_count: number;
  bracket_data: Json;
  status: 'pending' | 'ongoing' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface SpinnerPrize {
  id: string;
  user_id: string;
  prize: string;
  color: string;
  position: number;
  created_at: string;
}

export interface SpinnerHistoryEntry {
  id: string;
  user_id: string;
  winner: string;
  spun_at: string;
}

export interface LoyaltyPreset {
  id: string;
  user_id: string;
  name: string;
  keyword: string;
  points: number;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface GiveawayHistoryEntry {
  id: string;
  user_id: string;
  keyword: string;
  points_amount: number;
  duration_seconds: number;
  participant_count: number;
  started_at: string;
  ended_at: string | null;
}

export interface PointsBattlePreset {
  id: string;
  user_id: string;
  name: string;
  options: Json;
  min_points: number;
  max_points: number;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface PointsBattleSession {
  id: string;
  user_id: string;
  options: Json;
  min_points: number;
  max_points: number;
  duration_seconds: number;
  status: 'active' | 'finished' | 'cancelled';
  started_at: string;
  ended_at: string | null;
}

export interface QuickGuessSettings {
  id: string;
  user_id: string;
  twitch_username: string;
  success_msg: string;
  already_in_use_msg: string;
  guess_changed_msg: string;
  wrong_numbers_msg: string;
  not_active_msg: string;
  winner_msg: string;
  commands: Json;
  created_at: string;
  updated_at: string;
}

export interface QuickGuessSession {
  id: string;
  user_id: string;
  is_open: boolean;
  winner_username: string | null;
  winner_guess: string | null;
  created_at: string;
  closed_at: string | null;
}

export interface QuickGuessEntry {
  id: string;
  user_id: string;
  session_id: string;
  username: string;
  guess: string;
  guessed_at: string;
  changed_at: string | null;
}

export interface QuickGuessHistoryEntry {
  id: string;
  user_id: string;
  participant_count: number;
  winner: string;
  winning_guess: string;
  played_at: string;
}

export interface SlotRequestSettings {
  id: string;
  user_id: string;
  points_cost: number;
  allow_multiple: boolean;
  animation_emojis: Json;
  holding_time_ms: number;
  created_at: string;
  updated_at: string;
}

export interface SlotRequest {
  id: string;
  user_id: string;
  viewer_username: string;
  slot_name: string;
  status: 'pending' | 'raffled' | 'completed';
  requested_at: string;
}

export interface RaffleHistoryEntry {
  id: string;
  user_id: string;
  slot_name: string;
  winner: string;
  raffled_at: string;
}

export interface HotwordSettings {
  id: string;
  user_id: string;
  twitch_username: string;
  kick_username: string;
  excluded_words: Json;
  bot_status: 'online' | 'offline';
  created_at: string;
  updated_at: string;
}

export interface HotwordEntry {
  id: string;
  user_id: string;
  word: string;
  count: number;
  first_seen: string;
  last_seen: string;
}

export interface Moderator {
  id: string;
  user_id: string;
  moderator_email: string;
  moderator_user_id: string | null;
  status: 'active' | 'inactive';
  permissions: Json;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  image_url: string | null;
  is_playing: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonalBest {
  id: string;
  user_id: string;
  game_name: string;
  provider: string;
  win_amount: number;
  multiplier: number;
  achieved_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  user_role: 'viewer' | 'moderator' | 'subscriber';
  message: string;
  sent_at: string;
}

export interface SlideshowItem {
  id: string;
  user_id: string;
  casino_name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string;
  store_currency: string;
  store_image_url: string | null;
  allow_redemptions: boolean;
  show_prices: boolean;
  primary_color: string;
  background_color: string;
  show_overlay: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreItem {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price_points: number;
  quantity_available: number;
  email_required: boolean;
  visible: boolean;
  redemption_limit: number;
  excluded_users: Json;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreRedemption {
  id: string;
  user_id: string;
  item_id: string;
  viewer_username: string;
  viewer_email: string | null;
  status: 'pending' | 'completed' | 'refunded';
  redeemed_at: string;
  completed_at: string | null;
}

export interface StreamViewer {
  id: string;
  user_id: string;
  username: string;
  total_points: number;
  watch_time_minutes: number;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  viewer_id: string | null;
  amount: number;
  reason: string;
  type: 'add' | 'remove';
  created_at: string;
}

export interface StreamPointsConfig {
  id: string;
  user_id: string;
  points_per_minute: number;
  points_per_follow: number;
  points_per_sub: number;
  points_per_donation: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  current_uses: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThemeSettings {
  id: string;
  user_id: string;
  preset_name: string;
  colors: Json;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface TwitchConnection {
  id: string;
  user_id: string;
  twitch_user_id: string;
  twitch_username: string;
  access_token: string;
  refresh_token: string;
  scopes: string[];
  connected_at: string;
  updated_at: string;
}

export interface PointsBattleBet {
  id: string;
  user_id: string;
  session_id: string;
  viewer_username: string;
  option_index: number;
  amount: number;
  placed_at: string;
}

export interface GiveawaySession {
  id: string;
  user_id: string;
  keyword: string;
  points_amount: number;
  duration_seconds: number;
  status: 'active' | 'finished' | 'cancelled';
  started_at: string;
  ended_at: string | null;
}

export interface GiveawayParticipant {
  id: string;
  user_id: string;
  session_id: string;
  username: string;
  joined_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_deposited: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  wallet_id: string;
  type: 'topup' | 'purchase' | 'refund' | 'admin_credit' | 'admin_debit';
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_credits: number;
  duration_days: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  package_id: string;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  coin: string;
  amount_fiat: number;
  amount_crypto: string | null;
  address_in: string | null;
  address_out: string;
  callback_url: string;
  txid: string | null;
  confirmations: number;
  status: 'pending' | 'confirming' | 'completed' | 'expired' | 'failed';
  credits_to_add: number;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id: string | null;
  details: Json;
  created_at: string;
}

export interface StreamerPageSettings {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  twitch_url: string | null;
  kick_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  discord_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  is_public: boolean;
  accent_color: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Database interface for Supabase client typing
// ============================================================

interface TableDef<T> {
  Row: T;
  Insert: Insert<T>;
  Update: Update<T>;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: TableDef<UserProfile>;
      dashboard_stats: TableDef<DashboardStat>;
      casinos: TableDef<Casino>;
      bonushunts: TableDef<Bonushunt>;
      bonushunt_entries: TableDef<BonushuntEntry>;
      wager_sessions: TableDef<WagerSession>;
      balance_profiles: TableDef<BalanceProfile>;
      duel_sessions: TableDef<DuelSession>;
      duel_players: TableDef<DuelPlayer>;
      slot_battles: TableDef<SlotBattle>;
      slot_battle_entries: TableDef<SlotBattleEntry>;
      tournaments: TableDef<Tournament>;
      spinner_prizes: TableDef<SpinnerPrize>;
      spinner_history: TableDef<SpinnerHistoryEntry>;
      loyalty_presets: TableDef<LoyaltyPreset>;
      giveaway_history: TableDef<GiveawayHistoryEntry>;
      points_battle_presets: TableDef<PointsBattlePreset>;
      points_battle_sessions: TableDef<PointsBattleSession>;
      quick_guess_settings: TableDef<QuickGuessSettings>;
      quick_guess_sessions: TableDef<QuickGuessSession>;
      quick_guess_entries: TableDef<QuickGuessEntry>;
      quick_guess_history: TableDef<QuickGuessHistoryEntry>;
      slot_request_settings: TableDef<SlotRequestSettings>;
      slot_requests: TableDef<SlotRequest>;
      raffle_history: TableDef<RaffleHistoryEntry>;
      hotword_settings: TableDef<HotwordSettings>;
      hotword_entries: TableDef<HotwordEntry>;
      moderators: TableDef<Moderator>;
      games: TableDef<Game>;
      personal_bests: TableDef<PersonalBest>;
      chat_messages: TableDef<ChatMessage>;
      slideshow_items: TableDef<SlideshowItem>;
      store_settings: TableDef<StoreSettings>;
      store_items: TableDef<StoreItem>;
      store_redemptions: TableDef<StoreRedemption>;
      stream_viewers: TableDef<StreamViewer>;
      points_transactions: TableDef<PointsTransaction>;
      stream_points_config: TableDef<StreamPointsConfig>;
      promotions: TableDef<Promotion>;
      theme_settings: TableDef<ThemeSettings>;
      streamer_page_settings: TableDef<StreamerPageSettings>;
      twitch_connections: TableDef<TwitchConnection>;
      points_battle_bets: TableDef<PointsBattleBet>;
      giveaway_sessions: TableDef<GiveawaySession>;
      giveaway_participants: TableDef<GiveawayParticipant>;
      wallets: TableDef<Wallet>;
      wallet_transactions: TableDef<WalletTransaction>;
      packages: TableDef<Package>;
      user_subscriptions: TableDef<UserSubscription>;
      payment_requests: TableDef<PaymentRequest>;
      admin_audit_logs: TableDef<AdminAuditLog>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
