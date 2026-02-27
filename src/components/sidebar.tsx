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
  Globe,
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
  { name: "Streamer Page", href: "/streamer-page", icon: Globe },
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
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
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
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground/80 hover:translate-x-1 hover:shadow-[inset_0_0_20px_rgba(201,168,76,0.04)]"
              }`}
            >
              {/* Active gold indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-to-b from-primary to-primary/60 shadow-[0_0_8px_var(--glow-gold)]" />
              )}
              {/* Hover glow bar (non-active only) */}
              {!isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[2px] rounded-r-full bg-primary/40 opacity-0 transition-all duration-300 group-hover:h-4 group-hover:opacity-100" />
              )}
              <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary/70 group-hover:scale-110"
              }`} />
              <span className="transition-colors duration-200">{item.name}</span>
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5 group transition-all duration-300 hover:opacity-90">
        <div className="relative">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="transition-transform duration-300 group-hover:scale-110" style={{ filter: 'drop-shadow(0 0 8px var(--glow-gold))' }}>
            <rect width="32" height="32" rx="7" fill="var(--sidebar)" />
            <rect x="1" y="1" width="30" height="30" rx="6" fill="none" stroke="var(--primary)" strokeWidth="0.5" opacity="0.4"/>
            <polyline
              points="3,16 9,16 11,10 13,22 15,6 17,26 19,14 21,18 23,16 29,16"
              stroke="var(--primary)" strokeWidth="2" fill="none"
              strokeLinecap="round" strokeLinejoin="round"
              className="sidebar-pulse-line"
            />
            <line x1="3" y1="16" x2="29" y2="16" stroke="var(--primary)" strokeWidth="0.5" opacity="0.15"/>
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold text-foreground tracking-wider">PULSEFRAME</div>
          <div className="text-[13px] font-bold text-primary tracking-wider">LABS</div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        <NavSection items={overlayApps} pathname={pathname} />
        <NavSection title="Casinos" items={casinos} pathname={pathname} />
        <NavSection title="Stream" items={stream} pathname={pathname} />
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <span className="text-[11px] text-muted-foreground">2026&copy; Pulseframelabs</span>
      </div>
    </aside>
  );
}
