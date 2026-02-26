"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  X,
  ArrowDownUp,
  Trophy,
  Play,
  Zap,
  Flame,
  Monitor,
  Dice5,
  Gift,
  Swords,
  Sword,
  Heart,
  MessageSquare,
  MessageCircle,
  Paintbrush,
  Building2,
  Megaphone,
  Images,
  Store,
  Star,
  Target,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const overlayApps: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Wager Bar", href: "/wager", icon: X },
  { name: "Deposit/Withdrawals", href: "/deposit-withdrawals", icon: ArrowDownUp },
  { name: "Personal Bests", href: "/personal-bests", icon: Trophy },
  { name: "Now Playing", href: "/now-playing", icon: Play },
  { name: "Stream Points", href: "/stream-points", icon: Zap },
  { name: "Hotwords", href: "/hotwords", icon: Flame },
  { name: "Slot Requests", href: "/slot-requests", icon: Monitor },
  { name: "Spinner", href: "/spinner", icon: Dice5 },
  { name: "Bonushunts", href: "/bonushunts", icon: Gift },
  { name: "Tournaments", href: "/tournaments", icon: Swords },
  { name: "Slot Battles", href: "/slot-battles", icon: Sword },
  { name: "Duel", href: "/duel", icon: Heart },
  { name: "Quick Guesses", href: "/quick-guesses", icon: MessageSquare },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Theme Settings", href: "/theme-settings", icon: Paintbrush },
];

const casinos: NavItem[] = [
  { name: "Casino Management", href: "/casino-management", icon: Building2 },
  { name: "Promo Management", href: "/promo-management", icon: Megaphone },
  { name: "Slideshow", href: "/slideshow", icon: Images },
];

const stream: NavItem[] = [
  { name: "Store", href: "/store", icon: Store },
  { name: "Loyalty", href: "/loyalty", icon: Star },
  { name: "Points Battle", href: "/points-battle", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
];

function NavSection({ title, items, pathname }: { title?: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="mb-2">
      {title && (
        <div className="px-3 pt-5 pb-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            {title}
          </h3>
        </div>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/15 to-cyan-500/5 text-white"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
              <Icon className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"
              }`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-white/[0.06] bg-[#060910]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">
          <path d="M6 8l6 8-6 8" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 8l6 8-6 8" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        </svg>
        <div className="leading-tight">
          <div className="text-[13px] font-bold text-white tracking-wider">PULSEFRAME</div>
          <div className="text-[13px] font-bold text-white tracking-wider">LABS</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        <NavSection items={overlayApps} pathname={pathname} />
        <NavSection title="Casinos" items={casinos} pathname={pathname} />
        <NavSection title="Stream" items={stream} pathname={pathname} />
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <span className="text-[11px] text-slate-600">2026&copy; Pulseframelabs</span>
      </div>
    </aside>
  );
}
