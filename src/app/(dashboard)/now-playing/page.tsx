"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OverlayLink } from "@/components/overlay-link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Plus, Search, X, Play, Pause, Pencil, Save, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { games as gamesDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { useAuthUid } from "@/hooks/useAuthUid";
import type { Game } from "@/lib/supabase/types";

interface GameInfo {
  name: string;
  provider: string;
  image: string | null;
}

const providers = [
  { name: "Pragmatic Play", slug: "pragmatic", color: "#1a73e8" },
  { name: "NetEnt", slug: "netent", color: "#00a651" },
  { name: "Play'n GO", slug: "playngo", color: "#6b21a8" },
  { name: "Push Gaming", slug: "push", color: "#e11d48" },
  { name: "Hacksaw Gaming", slug: "hacksaw", color: "#ea580c" },
  { name: "Nolimit City", slug: "nolimit", color: "#dc2626" },
  { name: "Red Tiger", slug: "redtiger", color: "#b91c1c" },
  { name: "Big Time Gaming", slug: "btg", color: "#7c3aed" },
  { name: "ELK Studios", slug: "elk", color: "#0891b2" },
  { name: "Relax Gaming", slug: "relax", color: "#059669" },
  { name: "Yggdrasil", slug: "yggdrasil", color: "#4f46e5" },
  { name: "Microgaming", slug: "microgaming", color: "#0d9488" },
  { name: "Evolution", slug: "evolution", color: "#c2410c" },
  { name: "Quickspin", slug: "quickspin", color: "#ec4899" },
  { name: "Thunderkick", slug: "thunderkick", color: "#f59e0b" },
  { name: "iSoftBet", slug: "isoftbet", color: "#2563eb" },
  { name: "Wazdan", slug: "wazdan", color: "#9333ea" },
  { name: "Betsoft", slug: "betsoft", color: "#16a34a" },
  { name: "BGaming", slug: "bgaming", color: "#0ea5e9" },
  { name: "Playson", slug: "playson", color: "#f97316" },
  { name: "Habanero", slug: "habanero", color: "#ef4444" },
  { name: "Spribe", slug: "spribe", color: "#6366f1" },
  { name: "Evoplay", slug: "evoplay", color: "#8b5cf6" },
  { name: "Stakelogic", slug: "stakelogic", color: "#d97706" },
  { name: "Spinomenal", slug: "spinomenal", color: "#be185d" },
  { name: "Kalamba Games", slug: "kalamba", color: "#7c2d12" },
  { name: "Peter & Sons", slug: "petersons", color: "#4338ca" },
  { name: "Fantasma Games", slug: "fantasma", color: "#475569" },
  { name: "AvatarUX", slug: "avatarux", color: "#0f766e" },
  { name: "Booming Games", slug: "booming", color: "#b45309" },
];

const games: Record<string, GameInfo[]> = {
  pragmatic: [
    { name: "Sweet Bonanza", provider: "Pragmatic Play", image: "/games/sweet-bonanza.png" },
    { name: "Gates of Olympus", provider: "Pragmatic Play", image: "/games/gates-of-olympus.png" },
    { name: "Big Bass Bonanza", provider: "Pragmatic Play", image: "/games/big-bass-bonanza.png" },
    { name: "The Dog House", provider: "Pragmatic Play", image: "/games/the-dog-house.png" },
    { name: "Sugar Rush", provider: "Pragmatic Play", image: "/games/sugar-rush.png" },
    { name: "Fruit Party", provider: "Pragmatic Play", image: "/games/fruit-party.png" },
    { name: "Starlight Princess", provider: "Pragmatic Play", image: "/games/starlight-princess.png" },
    { name: "Wild West Gold", provider: "Pragmatic Play", image: "/games/wild-west-gold.png" },
    { name: "Zeus vs Hades", provider: "Pragmatic Play", image: "/games/zeus-vs-hades.png" },
    { name: "Madame Destiny Megaways", provider: "Pragmatic Play", image: "/games/madame-destiny-megaways.png" },
    { name: "Floating Dragon", provider: "Pragmatic Play", image: "/games/floating-dragon.png" },
    { name: "Sweet Bonanza 1000", provider: "Pragmatic Play", image: "/games/sweet-bonanza-1000.png" },
  ],
  netent: [
    { name: "Starburst", provider: "NetEnt", image: "/games/starburst.png" },
    { name: "Gonzo's Quest", provider: "NetEnt", image: "/games/gonzos-quest.png" },
    { name: "Dead or Alive 2", provider: "NetEnt", image: "/games/dead-or-alive-2.png" },
    { name: "Divine Fortune", provider: "NetEnt", image: null },
    { name: "Twin Spin", provider: "NetEnt", image: null },
    { name: "Jack and the Beanstalk", provider: "NetEnt", image: null },
    { name: "Blood Suckers II", provider: "NetEnt", image: null },
  ],
  playngo: [
    { name: "Book of Dead", provider: "Play'n GO", image: null },
    { name: "Reactoonz", provider: "Play'n GO", image: null },
    { name: "Reactoonz 2", provider: "Play'n GO", image: null },
    { name: "Fire Joker", provider: "Play'n GO", image: null },
    { name: "Moon Princess", provider: "Play'n GO", image: null },
    { name: "Rise of Olympus", provider: "Play'n GO", image: null },
    { name: "Rich Wilde and the Tome of Madness", provider: "Play'n GO", image: null },
    { name: "Hugo", provider: "Play'n GO", image: null },
  ],
  push: [
    { name: "Jammin' Jars", provider: "Push Gaming", image: null },
    { name: "Jammin' Jars 2", provider: "Push Gaming", image: null },
    { name: "Razor Shark", provider: "Push Gaming", image: null },
    { name: "Fat Rabbit", provider: "Push Gaming", image: null },
    { name: "Wild Swarm", provider: "Push Gaming", image: null },
  ],
  hacksaw: [
    { name: "Wanted Dead or a Wild", provider: "Hacksaw Gaming", image: null },
    { name: "Chaos Crew", provider: "Hacksaw Gaming", image: null },
    { name: "Chaos Crew 2", provider: "Hacksaw Gaming", image: null },
    { name: "Hand of Anubis", provider: "Hacksaw Gaming", image: null },
    { name: "Stick 'Em", provider: "Hacksaw Gaming", image: null },
    { name: "IteroConnect", provider: "Hacksaw Gaming", image: null },
  ],
  nolimit: [
    { name: "Fire in the Hole", provider: "Nolimit City", image: "/games/fire-in-the-hole.png" },
    { name: "Mental", provider: "Nolimit City", image: null },
    { name: "San Quentin xWays", provider: "Nolimit City", image: null },
    { name: "Tombstone RIP", provider: "Nolimit City", image: null },
    { name: "Punk Rocker", provider: "Nolimit City", image: null },
    { name: "Das xBoot", provider: "Nolimit City", image: null },
  ],
  redtiger: [
    { name: "Gonzo's Quest Megaways", provider: "Red Tiger", image: null },
    { name: "Piggy Riches Megaways", provider: "Red Tiger", image: null },
    { name: "Dragon's Fire", provider: "Red Tiger", image: null },
    { name: "Mystery Reels", provider: "Red Tiger", image: null },
  ],
  btg: [
    { name: "Bonanza Megaways", provider: "Big Time Gaming", image: null },
    { name: "Extra Chilli", provider: "Big Time Gaming", image: null },
    { name: "White Rabbit", provider: "Big Time Gaming", image: null },
    { name: "Lil Devil", provider: "Big Time Gaming", image: null },
    { name: "Opal Fruits", provider: "Big Time Gaming", image: null },
  ],
  elk: [
    { name: "Kaiju", provider: "ELK Studios", image: null },
    { name: "Ecuador Gold", provider: "ELK Studios", image: null },
    { name: "Cygnus", provider: "ELK Studios", image: null },
    { name: "Valkyrie", provider: "ELK Studios", image: null },
  ],
  relax: [
    { name: "Money Train 2", provider: "Relax Gaming", image: null },
    { name: "Money Train 3", provider: "Relax Gaming", image: null },
    { name: "Money Train 4", provider: "Relax Gaming", image: null },
    { name: "Temple Tumble", provider: "Relax Gaming", image: null },
    { name: "Dream Drop Jackpots", provider: "Relax Gaming", image: null },
  ],
  yggdrasil: [
    { name: "Valley of the Gods", provider: "Yggdrasil", image: null },
    { name: "Vikings Go Berzerk", provider: "Yggdrasil", image: null },
    { name: "Raptor DoubleMax", provider: "Yggdrasil", image: null },
    { name: "Hades Gigablox", provider: "Yggdrasil", image: null },
  ],
  microgaming: [
    { name: "Immortal Romance", provider: "Microgaming", image: null },
    { name: "Mega Moolah", provider: "Microgaming", image: null },
    { name: "Thunderstruck II", provider: "Microgaming", image: null },
    { name: "Avalon II", provider: "Microgaming", image: null },
    { name: "Break da Bank Again", provider: "Microgaming", image: null },
  ],
  evolution: [
    { name: "Crazy Time", provider: "Evolution", image: null },
    { name: "Lightning Roulette", provider: "Evolution", image: null },
    { name: "Monopoly Live", provider: "Evolution", image: null },
    { name: "Dream Catcher", provider: "Evolution", image: null },
    { name: "Mega Ball", provider: "Evolution", image: null },
    { name: "Funky Time", provider: "Evolution", image: null },
  ],
  quickspin: [
    { name: "Big Bad Wolf", provider: "Quickspin", image: null },
    { name: "Dwarfs Gone Wild", provider: "Quickspin", image: null },
    { name: "Sticky Bandits", provider: "Quickspin", image: null },
    { name: "Phoenix Sun", provider: "Quickspin", image: null },
  ],
  thunderkick: [
    { name: "Barber Shop Uncut", provider: "Thunderkick", image: null },
    { name: "Esqueleto Explosivo", provider: "Thunderkick", image: null },
    { name: "Pink Elephants 2", provider: "Thunderkick", image: null },
    { name: "Beat the Beast", provider: "Thunderkick", image: null },
  ],
  isoftbet: [
    { name: "Gold Digger", provider: "iSoftBet", image: null },
    { name: "Moriarty Megaways", provider: "iSoftBet", image: null },
    { name: "Hot Spin", provider: "iSoftBet", image: null },
  ],
  wazdan: [
    { name: "Power of Gods: Hades", provider: "Wazdan", image: null },
    { name: "9 Lions", provider: "Wazdan", image: null },
    { name: "Larry the Leprechaun", provider: "Wazdan", image: null },
  ],
  betsoft: [
    { name: "A Night in Paris", provider: "Betsoft", image: null },
    { name: "Good Girl Bad Girl", provider: "Betsoft", image: null },
    { name: "The Slotfather", provider: "Betsoft", image: null },
  ],
  bgaming: [
    { name: "Elvis Frog in Vegas", provider: "BGaming", image: null },
    { name: "Dig Dig Digger", provider: "BGaming", image: null },
    { name: "Aloha King Elvis", provider: "BGaming", image: null },
    { name: "Plinko", provider: "BGaming", image: null },
  ],
  playson: [
    { name: "Legend of Cleopatra", provider: "Playson", image: null },
    { name: "Solar Queen", provider: "Playson", image: null },
    { name: "Book of Gold", provider: "Playson", image: null },
  ],
  habanero: [
    { name: "Hot Hot Fruit", provider: "Habanero", image: null },
    { name: "Fa Cai Shen", provider: "Habanero", image: null },
    { name: "Koi Gate", provider: "Habanero", image: null },
  ],
  spribe: [
    { name: "Aviator", provider: "Spribe", image: null },
    { name: "Mines", provider: "Spribe", image: null },
    { name: "Plinko", provider: "Spribe", image: null },
    { name: "Goal", provider: "Spribe", image: null },
  ],
  evoplay: [
    { name: "Fruit Super Nova", provider: "Evoplay", image: null },
    { name: "Dungeon Immortal Evil", provider: "Evoplay", image: null },
    { name: "Star Guardians", provider: "Evoplay", image: null },
  ],
  stakelogic: [
    { name: "Book of Adventure", provider: "Stakelogic", image: null },
    { name: "Runner Runner Megaways", provider: "Stakelogic", image: null },
    { name: "The Expendables Megaways", provider: "Stakelogic", image: null },
  ],
  spinomenal: [
    { name: "Book of Demi Gods II", provider: "Spinomenal", image: null },
    { name: "Majestic King", provider: "Spinomenal", image: null },
    { name: "Wolf Fang", provider: "Spinomenal", image: null },
  ],
  kalamba: [
    { name: "Joker MAX", provider: "Kalamba Games", image: null },
    { name: "Blazing Bull", provider: "Kalamba Games", image: null },
    { name: "Ducks Till Dawn", provider: "Kalamba Games", image: null },
  ],
  petersons: [
    { name: "Hammer of Gods", provider: "Peter & Sons", image: null },
    { name: "Disco Beats", provider: "Peter & Sons", image: null },
    { name: "Mayan Stackways", provider: "Peter & Sons", image: null },
  ],
  fantasma: [
    { name: "Heroes Hunt Megaways", provider: "Fantasma Games", image: null },
    { name: "Flower Fortunes Megaways", provider: "Fantasma Games", image: null },
  ],
  avatarux: [
    { name: "PopRocks", provider: "AvatarUX", image: null },
    { name: "LilliPop", provider: "AvatarUX", image: null },
    { name: "PapayaPop", provider: "AvatarUX", image: null },
  ],
  booming: [
    { name: "Booming Bananas", provider: "Booming Games", image: null },
    { name: "Gold Vein", provider: "Booming Games", image: null },
    { name: "Burning Classics", provider: "Booming Games", image: null },
  ],
};

const allGames = Object.values(games).flat();

// Worldwide online casinos
const worldwideCasinos = [
  "Stake", "Roobet", "Duelbits", "Rollbit", "BC.Game", "Metaspins", "500 Casino",
  "Gamdom", "Rain.gg", "Shuffle", "1GO", "1Red", "1xBit", "1xSlots",
  "BitStarz", "mBit Casino", "7Bit Casino", "Bets.io", "Betplay",
  "Cloudbet", "FortuneJack", "Fairspin", "TrustDice", "Wild.io",
  "Jackbit", "Sportsbet.io", "Winz.io", "CoinPlay", "Vave",
  "BetFury", "JustBit", "Celsius Casino", "Bitsler", "Lucky Block",
  "Mega Dice", "WSM Casino", "Flush Casino", "Betpanda", "Cryptorino",
  "Mirax Casino", "Katsubet", "Ivibet", "Winna", "Joker Casino",
  "Casinoly", "21.com", "Betway", "888casino", "LeoVegas",
  "Casumo", "Mr Green", "Unibet", "PokerStars Casino", "bet365 Casino",
  "William Hill", "Betfair Casino", "Paddy Power", "Coral Casino", "Ladbrokes",
  "Grosvenor Casino", "Bet Victor", "Mansion Casino", "PlayOJO", "Rizk Casino",
  "Wildz", "Caxino", "SpinAway", "Duelz", "ComeOn Casino",
  "Bwin Casino", "GGBet Casino", "Pin-Up Casino", "Vulkan Vegas", "N1 Casino",
  "National Casino", "20Bet", "22Bet", "Melbet Casino", "Parimatch Casino",
  "Mostbet Casino", "1win Casino", "Vbet Casino", "BetAndreas", "Sol Casino",
  "JetCasino", "Fresh Casino", "Izzi Casino", "Legzo Casino", "Drip Casino",
  "Starda Casino", "R7 Casino", "Glory Casino", "Brillx Casino", "SpinBetter",
  "GG.bet", "Stake.us", "Chumba Casino", "LuckyLand Slots", "Pulsz Casino",
  "WOW Vegas", "High 5 Casino", "BetRivers.net", "Fortune Coins", "Funrize",
  "NoLimitCoins", "Zula Casino", "Modo.us", "Spree Casino", "Ding Ding Ding",
  "Crown Coins Casino", "McLuck Casino", "Global Poker", "Jackpota",
  "DraftKings Casino", "FanDuel Casino", "BetMGM Casino", "Caesars Casino",
  "Hard Rock Bet", "PointsBet Casino", "Tipico Casino", "Borgata Casino",
  "Golden Nugget", "Resorts Casino", "SugarHouse Casino", "Ocean Casino",
  "Virgin Casino", "TwinSpires Casino", "Stardust Casino",
  "Wunderino", "DruckGluck", "Hyperino", "Sunmaker", "Platincasino",
  "Casiola", "Slottica", "Spinaway", "Rabona Casino", "Zet Casino",
  "Loki Casino", "Tsars Casino", "Nomini Casino", "MrBit Casino",
  "Verde Casino", "Nine Casino", "Neospin", "Bizzo Casino", "Joo Casino",
  "Dazard Casino", "Casinia", "Yoju Casino", "BitKingz", "Oshi Casino",
  "BetChain", "King Billy Casino", "Hotline Casino", "Boho Casino",
];

function GameImage({ src, name, providerColor }: { src: string | null; name: string; providerColor: string }) {
  if (!src) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${providerColor}33, ${providerColor}11)` }}
      >
        <span className="text-xs font-bold text-white/60 text-center leading-tight px-1">
          {name.length > 12 ? name.substring(0, 10) + "..." : name}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="h-full w-full object-cover"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.style.display = "flex";
          parent.style.alignItems = "center";
          parent.style.justifyContent = "center";
          parent.style.background = `linear-gradient(135deg, ${providerColor}33, ${providerColor}11)`;
          const span = document.createElement("span");
          span.className = "text-xs font-bold text-center leading-tight px-1";
          span.style.color = "rgba(255,255,255,0.6)";
          span.textContent = name.length > 12 ? name.substring(0, 10) + "..." : name;
          parent.appendChild(span);
        }
      }}
    />
  );
}

export default function NowPlayingPage() {
  const uid = useAuthUid();
  const [selectedProvider, setSelectedProvider] = useState("pragmatic");
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayTab, setOverlayTab] = useState("normal");
  const [casinosOpen, setCasinosOpen] = useState(false);
  const [casinoSearch, setCasinoSearch] = useState("");
  const [casinoTab, setCasinoTab] = useState("search");
  const [editingCasino, setEditingCasino] = useState<string | null>(null);
  const [casinoCommands, setCasinoCommands] = useState<Record<string, string>>({});
  const [editName, setEditName] = useState("");
  const [editCommand, setEditCommand] = useState("");
  const [activeCasinos, setActiveCasinos] = useState<Set<string>>(new Set());

  const { data: dbGames, refetch } = useDbQuery<Game[]>(() => gamesDb.list(), []);

  async function handleCreateGame(name: string, provider: string, image: string | null) {
    try {
      await gamesDb.create({ name, provider, image_url: image ?? undefined });
      await refetch();
    } catch (err) {
      console.error("Failed to create game:", err);
    }
  }

  async function handleDeleteGame(id: string) {
    try {
      await gamesDb.remove(id);
      await refetch();
    } catch (err) {
      console.error("Failed to delete game:", err);
    }
  }

  async function handleSetPlaying(id: string) {
    try {
      await gamesDb.setPlaying(id);
      await refetch();
    } catch (err) {
      console.error("Failed to set playing:", err);
    }
  }

  const providerGames = games[selectedProvider] || [];
  const currentGame = providerGames[selectedGameIndex] || providerGames[0];
  const currentProvider = providers.find((p) => p.slug === selectedProvider);
  const providerColor = currentProvider?.color || "#3b82f6";

  const filteredGames = searchQuery.trim()
    ? allGames.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredCasinos = casinoSearch.trim()
    ? worldwideCasinos.filter((c) => c.toLowerCase().includes(casinoSearch.toLowerCase()))
    : worldwideCasinos;

  const overlayBaseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const overlayUrls: Record<string, string> = {
    normal: `${overlayBaseUrl}/overlay/now_playing_normal?uid=${uid || ""}&game=${encodeURIComponent(currentGame?.name || "")}&provider=${encodeURIComponent(currentGame?.provider || "")}&image=${encodeURIComponent(currentGame?.image || "")}`,
    small: `${overlayBaseUrl}/overlay/now_playing_small?uid=${uid || ""}&game=${encodeURIComponent(currentGame?.name || "")}&provider=${encodeURIComponent(currentGame?.provider || "")}`,
    playing_on: `${overlayBaseUrl}/overlay/now_playing_small?uid=${uid || ""}&game=${encodeURIComponent(currentGame?.name || "")}&provider=${encodeURIComponent(currentGame?.provider || "")}`,
    playing_on_image: `${overlayBaseUrl}/overlay/now_playing_normal?uid=${uid || ""}&game=${encodeURIComponent(currentGame?.name || "")}&provider=${encodeURIComponent(currentGame?.provider || "")}&image=${encodeURIComponent(currentGame?.image || "")}`,
  };

  const overlayTabs = [
    { key: "normal", label: "Overlay Normal" },
    { key: "small", label: "Overlay Small" },
    { key: "playing_on", label: "Playing On" },
    { key: "playing_on_image", label: "Playing On Image" },
  ];

  return (
    <div>
      <PageHeader
        title="Now Playing"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setCasinosOpen(true)}>
              <Search className="h-4 w-4" />
              Manage Casinos
            </Button>
            <Button variant="success" className="gap-2" onClick={() => setOverlayOpen(true)}>
              <Monitor className="h-4 w-4" />
              Now Playing Overlay
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Current Casino */}
          <Card>
            <CardHeader>
              <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Current Casino</p>
            </CardHeader>
            <CardContent>
              <Select value={selectedProvider} onValueChange={(v) => { setSelectedProvider(v); setSelectedGameIndex(0); }}>
                <SelectTrigger className="w-full mb-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <h2 className="text-2xl font-bold text-white">{currentProvider?.name}</h2>
              <p className="text-sm text-slate-500">Command: !{currentProvider?.slug}</p>
            </CardContent>
          </Card>

          {/* Current Playing */}
          <Card>
            <CardHeader>
              <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Current Playing</p>
            </CardHeader>
            <CardContent>
              {currentGame && (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    <GameImage src={currentGame.image} name={currentGame.name} providerColor={providerColor} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentGame.name}</h3>
                    <p className="text-sm text-slate-500">{currentGame.provider}</p>
                  </div>
                </div>
              )}

              {/* Game selector grid */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {providerGames.map((game, i) => (
                  <button
                    key={game.name}
                    onClick={() => setSelectedGameIndex(i)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedGameIndex
                        ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        : "border-transparent hover:border-white/10"
                    }`}
                  >
                    <div className="h-12 w-full bg-slate-800 overflow-hidden">
                      <GameImage src={game.image} name={game.name} providerColor={providerColor} />
                    </div>
                    <div className="bg-slate-900 px-1 py-0.5">
                      <p className="text-[9px] text-slate-400 truncate">{game.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Slot Change */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-white">Slot Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search Slot..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="success"
                    className="font-bold"
                    onClick={() => {
                      if (currentGame) {
                        handleCreateGame(currentGame.name, currentGame.provider, currentGame.image);
                      }
                    }}
                  >Set</Button>
                </div>

                {searchQuery.trim() && filteredGames.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto"
                    style={{
                      background: "#111827",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    }}
                  >
                    {filteredGames.slice(0, 10).map((game) => {
                      const gProvider = providers.find((p) => p.name === game.provider);
                      return (
                        <button
                          key={`${game.provider}-${game.name}`}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/[0.04] transition-colors text-left"
                          onClick={() => {
                            if (gProvider) {
                              setSelectedProvider(gProvider.slug);
                              const idx = (games[gProvider.slug] || []).findIndex((g) => g.name === game.name);
                              setSelectedGameIndex(idx >= 0 ? idx : 0);
                            }
                            setSearchQuery("");
                          }}
                        >
                          <div className="h-8 w-8 rounded bg-slate-800 overflow-hidden shrink-0">
                            <GameImage src={game.image} name={game.name} providerColor={gProvider?.color || "#3b82f6"} />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{game.name}</p>
                            <p className="text-[10px] text-slate-500">{game.provider}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">
              Records for <span className="text-green-400">{currentGame?.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Input type="date" defaultValue="2026-02-26" className="w-40" />
              <Select defaultValue="usd">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">$ -</SelectItem>
                  <SelectItem value="eur">&euro; -</SelectItem>
                  <SelectItem value="gbp">&pound; -</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="" className="w-16" />
              <Input placeholder="" className="w-16" />
              <span className="text-sm text-slate-500">N/Ax</span>
              <Button size="icon" variant="success" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-slate-500 grid grid-cols-6 gap-2 border-b border-white/[0.06] pb-2 mb-2">
              <span>DATE</span>
              <span>GAME</span>
              <span>PROVIDER</span>
              <span>PLAYING</span>
              <span>CREATED</span>
              <span>ACTIONS</span>
            </div>
            {dbGames && dbGames.length > 0 ? (
              <div className="space-y-1">
                {dbGames.map((game) => (
                  <div key={game.id} className="text-xs grid grid-cols-6 gap-2 items-center py-2 border-b border-white/[0.03]">
                    <span className="text-slate-400">{new Date(game.created_at).toLocaleDateString()}</span>
                    <span className="text-white font-medium truncate">{game.name}</span>
                    <span className="text-slate-400 truncate">{game.provider}</span>
                    <span>{game.is_playing ? <span className="text-green-400 font-semibold">Active</span> : <span className="text-slate-600">-</span>}</span>
                    <span className="text-slate-500">{new Date(game.created_at).toLocaleTimeString()}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSetPlaying(game.id)}
                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-green-500/10 transition-colors"
                        title="Set as playing"
                      >
                        <Play className="h-3 w-3 text-green-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                No records yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ====== Now Playing Overlay Modal ====== */}
      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlayOpen(false)} />
          <div
            className="relative z-10 w-full max-w-2xl rounded-xl border border-white/[0.08] shadow-2xl"
            style={{ background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Now Playing Overlays</h2>
              <button onClick={() => setOverlayOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex gap-4 border-b border-white/[0.06]">
              {overlayTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setOverlayTab(tab.key)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    overlayTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  {overlayTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Overlay Link */}
              <OverlayLink url={overlayUrls[overlayTab] || ""} />

              {/* Overlay Preview */}
              <div>
                <Label className="text-sm font-semibold text-slate-400 mb-2 block">Preview</Label>
                <div
                  className="rounded-lg p-5 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #080c14 0%, #0f1521 50%, #080c14 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: "100px",
                  }}
                >
                  {/* Normal / Playing On Image preview */}
                  {(overlayTab === "normal" || overlayTab === "playing_on_image") && (
                    <div className="inline-block animate-fade-in-up">
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                          minWidth: "480px",
                        }}
                      >
                        <div className="flex items-stretch">
                          {/* Game Image */}
                          <div className="w-[110px] shrink-0 relative overflow-hidden">
                            {currentGame?.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={currentGame.image} alt={currentGame.name} className="h-full w-full object-cover" />
                            ) : (
                              <div
                                className="h-full w-full flex items-center justify-center min-h-[90px]"
                                style={{ background: `linear-gradient(135deg, ${providerColor}33, ${providerColor}11)` }}
                              >
                                <span className="text-[10px] font-bold text-white/50 text-center px-2">{currentGame?.name}</span>
                              </div>
                            )}
                            <div className="absolute inset-y-0 right-0 w-5" style={{ background: "linear-gradient(to right, transparent, #0c1018)" }} />
                          </div>

                          <div className="flex-1 flex items-stretch divide-x divide-white/[0.06]">
                            {/* Current Game */}
                            <div className="flex-1 px-3.5 py-3 flex flex-col justify-center">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[9px]" style={{ color: "#ef4444" }}>&#9654;</span>
                                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#94a3b8" }}>CURRENT GAME</span>
                              </div>
                              <p className="text-white font-bold text-xs leading-tight">{currentGame?.name}</p>
                              <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>{currentGame?.provider.toUpperCase()}</p>
                            </div>

                            {/* Info */}
                            <div className="flex-1 px-3.5 py-3 flex flex-col justify-center">
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className="h-3 w-3 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: "rgba(59,130,246,0.2)", color: "#3b82f6" }}>i</div>
                                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#3b82f6" }}>INFO</span>
                              </div>
                              <div className="space-y-0.5 text-[10px]">
                                <div className="flex justify-between"><span style={{ color: "#64748b" }}>POTENTIAL</span><span className="text-white font-bold">21100X</span></div>
                                <div className="flex justify-between"><span style={{ color: "#64748b" }}>RTP</span><span className="text-white font-bold">96.5%</span></div>
                                <div className="flex justify-between"><span style={{ color: "#64748b" }}>VOLATILITY</span><span className="text-white font-bold">MEDIUM</span></div>
                              </div>
                            </div>

                            {/* Personal Record */}
                            <div className="flex-1 px-3.5 py-3 flex flex-col justify-center">
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className="h-3 w-3 rounded-full flex items-center justify-center text-[7px]" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>&#9679;</div>
                                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#ef4444" }}>PERSONAL RECORD</span>
                              </div>
                              <div className="space-y-0.5 text-[10px]">
                                <div className="flex justify-between"><span style={{ color: "#64748b" }}>WIN</span><span className="text-white font-bold">0$</span></div>
                                <div className="flex justify-between"><span style={{ color: "#64748b" }}>X</span><span className="text-white font-bold">0X</span></div>
                                <div className="flex justify-between"><span style={{ color: "#64748b" }}>AVG-WIN</span><span className="text-white font-bold">0</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Small / Playing On preview */}
                  {(overlayTab === "small" || overlayTab === "playing_on") && (
                    <div className="inline-block animate-fade-in-up">
                      <div
                        className="rounded-lg overflow-hidden flex items-center"
                        style={{
                          background: "linear-gradient(135deg, #0c1018 0%, #111827 50%, #0c1018 100%)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
                        }}
                      >
                        <div className="w-[56px] h-[56px] shrink-0 relative overflow-hidden">
                          {currentGame?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={currentGame.image} alt={currentGame.name} className="h-full w-full object-cover" />
                          ) : (
                            <div
                              className="h-full w-full flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${providerColor}33, ${providerColor}11)` }}
                            >
                              <span className="text-[7px] font-bold text-white/50 text-center px-1">{currentGame?.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px]" style={{ color: "#ef4444" }}>&#9654;</span>
                            <span className="text-white font-bold text-xs">{currentGame?.name}</span>
                          </div>
                          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>{currentGame?.provider.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button variant="outline" onClick={() => setOverlayOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Manage Casinos Modal ====== */}
      {casinosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => { setCasinosOpen(false); setEditingCasino(null); }}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-xl border border-white/[0.08] shadow-2xl flex flex-col"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              maxHeight: "80vh",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
              <h2 className="text-white font-bold text-lg">Manage Casinos</h2>
              <button
                onClick={() => { setCasinosOpen(false); setEditingCasino(null); }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-3 flex gap-4 border-b border-white/[0.06] shrink-0">
              {[
                { key: "search", label: "Search" },
                { key: "requests", label: "My Requests" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCasinoTab(tab.key)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    casinoTab === tab.key ? "text-primary" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  {casinoTab === tab.key && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                      style={{ animation: "tabSlide 0.2s ease-out" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {casinoTab === "search" && (
                <>
                  {/* Search */}
                  <div className="px-5 py-3 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search your casinos..."
                        className="pl-9"
                        value={casinoSearch}
                        onChange={(e) => setCasinoSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Casino List */}
                  <div
                    className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}
                  >
                    {filteredCasinos.map((casino, idx) => {
                      const cmd = casinoCommands[casino] || `!${casino.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
                      const isEditing = editingCasino === casino;
                      const isActive = activeCasinos.has(casino);

                      return (
                        <div
                          key={casino}
                          className="rounded-lg overflow-hidden transition-all duration-200"
                          style={{
                            background: isEditing
                              ? "rgba(59, 130, 246, 0.06)"
                              : isActive
                                ? "rgba(16, 185, 129, 0.04)"
                                : "rgba(255,255,255,0.02)",
                            border: isEditing
                              ? "1px solid rgba(59, 130, 246, 0.15)"
                              : isActive
                                ? "1px solid rgba(16, 185, 129, 0.12)"
                                : "1px solid rgba(255,255,255,0.04)",
                            animationDelay: `${idx * 15}ms`,
                            animation: "casinoItemIn 0.3s ease-out both",
                          }}
                        >
                          {/* Main row */}
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 transition-all duration-200"
                              style={{
                                background: isActive
                                  ? "linear-gradient(135deg, #059669, #10b981)"
                                  : "linear-gradient(135deg, #334155, #475569)",
                                boxShadow: isActive ? "0 0 12px rgba(16, 185, 129, 0.3)" : "none",
                              }}
                            >
                              {casino.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-white font-medium text-sm block truncate">{casino}</span>
                              {isActive && (
                                <span className="text-[10px] text-green-400/70 font-mono">{cmd}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  const next = new Set(activeCasinos);
                                  if (next.has(casino)) {
                                    next.delete(casino);
                                  } else {
                                    next.add(casino);
                                  }
                                  setActiveCasinos(next);
                                }}
                                className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                style={{
                                  background: isActive
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgba(16, 185, 129, 0.1)",
                                  boxShadow: isActive ? "0 0 10px rgba(239, 68, 68, 0.2)" : "none",
                                }}
                              >
                                {isActive
                                  ? <Pause className="h-3.5 w-3.5 text-red-400 fill-red-400 transition-colors" />
                                  : <Play className="h-3.5 w-3.5 text-green-400 fill-green-400 transition-colors" />
                                }
                              </button>
                              <button
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingCasino(null);
                                  } else {
                                    setEditingCasino(casino);
                                    setEditName(casino);
                                    setEditCommand(cmd);
                                  }
                                }}
                                className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                style={{
                                  background: isEditing
                                    ? "rgba(59, 130, 246, 0.2)"
                                    : "rgba(100, 116, 139, 0.1)",
                                }}
                              >
                                <Pencil className={`h-3.5 w-3.5 transition-colors ${isEditing ? "text-primary" : "text-slate-400"}`} />
                              </button>
                            </div>
                          </div>

                          {/* Edit panel (expandable) */}
                          <div
                            className="overflow-hidden transition-all duration-300 ease-in-out"
                            style={{
                              maxHeight: isEditing ? "140px" : "0px",
                              opacity: isEditing ? 1 : 0,
                            }}
                          >
                            <div className="px-3 pb-3 pt-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 flex flex-col gap-1.5">
                                  <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-8 text-xs"
                                    placeholder="Casino name"
                                  />
                                  <Input
                                    value={editCommand}
                                    onChange={(e) => setEditCommand(e.target.value)}
                                    className="h-8 text-xs font-mono"
                                    placeholder="!command"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <button
                                    onClick={() => {
                                      setCasinoCommands((prev) => ({ ...prev, [casino]: editCommand }));
                                      setEditingCasino(null);
                                    }}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                                    style={{ background: "rgba(59, 130, 246, 0.2)" }}
                                  >
                                    <Save className="h-3.5 w-3.5 text-primary" />
                                  </button>
                                  <button
                                    onClick={() => setEditingCasino(null)}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                                    style={{ background: "rgba(239, 68, 68, 0.1)" }}
                                  >
                                    <X className="h-3.5 w-3.5 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredCasinos.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm">No casinos found</div>
                    )}
                  </div>
                </>
              )}

              {casinoTab === "requests" && (
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                  <p className="text-slate-500 text-sm">No pending requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
