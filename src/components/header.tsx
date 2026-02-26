"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-white/[0.06] bg-[#080b12]/80 backdrop-blur-xl px-6">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="relative flex items-center gap-3">
        <div
          className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/[0.04]"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 opacity-50" />
            <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
              {initial}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-white">{displayName}</div>
            <div className="text-[11px] text-slate-500">{user?.email || "Loading..."}</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </div>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-1 w-48 rounded-lg border border-border bg-card shadow-xl py-1 z-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
