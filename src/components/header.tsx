"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Moon, Sun, MonitorSmartphone, User as UserIcon, Shield, ExternalLink, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useThemeContext } from "@/components/providers";
import { useTwitchBot } from "@/contexts/TwitchBotContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/supabase/types";

const themeIcons = {
  dark: Moon,
  light: Sun,
  system: MonitorSmartphone,
} as const;

const themeLabels = { dark: "Dark", light: "Light", system: "Auto" } as const;

function Avatar({ src, initial, size = "sm" }: { src?: string | null; initial: string; size?: "sm" | "md" }) {
  const px = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  if (src) {
    return (
      <img
        src={src}
        alt="Avatar"
        className={`relative ${px} rounded-full border-2 border-primary/30 object-cover`}
      />
    );
  }

  return (
    <div className={`relative ${px} rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground ${textSize} font-bold`}>
      {initial}
    </div>
  );
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { preference, cycleTheme } = useThemeContext();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .maybeSingle()
          .then(({ data: p }) => setProfile(p as UserProfile | null));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data: p }) => setProfile(p as UserProfile | null));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for profile updates (e.g. after avatar upload on settings page)
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_profiles", filter: `user_id=eq.${user.id}` },
        (payload) => setProfile(payload.new as UserProfile),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url || null;

  const ThemeIcon = themeIcons[preference];
  const { isConnected: botConnected, isConnecting: botConnecting } = useTwitchBot();
  const { wallet } = useSubscription();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      {/* Gold gradient underline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Left spacer */}
      <div />

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Credits */}
        <div
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-colors hover:bg-primary/5"
          onClick={() => router.push("/wallet")}
          title="Wallet Credits"
        >
          <span className="text-primary">{wallet?.balance ?? 0}</span>
          <span className="text-muted-foreground">Credits</span>
        </div>

        {/* Bot Status */}
        <div
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-colors hover:bg-primary/5"
          onClick={() => router.push("/bot")}
          title={botConnected ? "Bot Connected" : botConnecting ? "Bot Connecting..." : "Bot Disconnected"}
        >
          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
          <span
            className={`h-2 w-2 rounded-full ${
              botConnected
                ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                : botConnecting
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500/60"
            }`}
          />
        </div>

        {/* Theme Toggle */}
        <motion.button
          onClick={cycleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={`Theme: ${themeLabels[preference]}`}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5"
        >
          <motion.span
            key={preference}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <ThemeIcon className="h-3.5 w-3.5" />
          </motion.span>
          <span className="hidden sm:inline">{themeLabels[preference]}</span>
        </motion.button>

        {/* User dropdown */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <div
            className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2 transition-all duration-200 hover:bg-primary/5"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-primary/60 opacity-50" />
              <Avatar src={avatarUrl} initial={initial} size="sm" />
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">{displayName}</div>
              <div className="text-[11px] text-muted-foreground">{user?.email || "Loading..."}</div>
            </div>
            <motion.div
              animate={{ rotate: showDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.div>
          </div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-border bg-popover/95 shadow-2xl shadow-black/20 z-50 backdrop-blur-2xl overflow-hidden"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-primary/60 opacity-40" />
                      <Avatar src={avatarUrl} initial={initial} size="md" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{displayName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{user?.email || "Loading..."}</div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    onClick={() => { setShowDropdown(false); router.push("/settings"); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-150"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); router.push("/theme-settings"); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-150"
                  >
                    <Shield className="h-4 w-4" />
                    Theme Settings
                  </button>
                  <a
                    href="https://pulseframelabs.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-150"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                </div>

                {/* Logout */}
                <div className="border-t border-border/50 py-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
