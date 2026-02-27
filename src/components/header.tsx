"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Moon, Sun, MonitorSmartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useThemeContext } from "@/components/providers";
import type { User } from "@supabase/supabase-js";

const themeIcons = {
  dark: Moon,
  light: Sun,
  system: MonitorSmartphone,
} as const;

const themeLabels = { dark: "Dark", light: "Light", system: "Auto" } as const;

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const { preference, cycleTheme } = useThemeContext();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";
  const initial = displayName.charAt(0).toUpperCase();

  const ThemeIcon = themeIcons[preference];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      {/* Gold gradient underline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Left spacer */}
      <div />

      {/* Right controls */}
      <div className="flex items-center gap-3">
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
        <div className="relative flex items-center">
          <div
            className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2 transition-all duration-200 hover:bg-primary/5"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-primary/60 opacity-50" />
              <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-bold">
                {initial}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">{displayName}</div>
              <div className="text-[11px] text-muted-foreground">{user?.email || "Loading..."}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-1 w-48 rounded-lg border border-border bg-popover shadow-xl py-1 z-50 backdrop-blur-xl"
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
