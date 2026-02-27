"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { StreamerPageSettings } from "@/lib/supabase/types";

const socialLinks = [
  { key: "twitch_url", label: "Twitch", icon: TwitchIcon, color: "#9146ff", hoverBg: "rgba(145,70,255,0.15)" },
  { key: "kick_url", label: "Kick", icon: KickIcon, color: "#53fc18", hoverBg: "rgba(83,252,24,0.15)" },
  { key: "youtube_url", label: "YouTube", icon: YoutubeIcon, color: "#ff0000", hoverBg: "rgba(255,0,0,0.15)" },
  { key: "twitter_url", label: "Twitter / X", icon: TwitterIcon, color: "#1da1f2", hoverBg: "rgba(29,161,242,0.15)" },
  { key: "discord_url", label: "Discord", icon: DiscordIcon, color: "#5865f2", hoverBg: "rgba(88,101,242,0.15)" },
  { key: "instagram_url", label: "Instagram", icon: InstagramIcon, color: "#e1306c", hoverBg: "rgba(225,48,108,0.15)" },
  { key: "tiktok_url", label: "TikTok", icon: TiktokIcon, color: "#ffffff", hoverBg: "rgba(255,255,255,0.08)" },
  { key: "website_url", label: "Website", icon: WebsiteIcon, color: "#c9a84c", hoverBg: "rgba(201,168,76,0.15)" },
] as const;

export function StreamerPageClient({ page }: { page: StreamerPageSettings }) {
  const accent = page.accent_color || "#c9a84c";
  const initial = (page.display_name || page.slug).charAt(0).toUpperCase();

  const activeSocials = socialLinks.filter(
    (s) => page[s.key as keyof StreamerPageSettings]
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${accent}22, transparent),
                         radial-gradient(ellipse 60% 40% at 80% 80%, ${accent}11, transparent),
                         radial-gradient(ellipse 50% 30% at 20% 60%, ${accent}0d, transparent)`,
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${accent}33 1px, transparent 1px), linear-gradient(90deg, ${accent}33 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen">
        {/* Banner */}
        <div className="w-full h-48 sm:h-64 relative overflow-hidden">
          {page.banner_url ? (
            <img
              src={page.banner_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${accent}40 0%, ${accent}10 40%, transparent 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/50 to-transparent" />
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg px-6 -mt-20"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div
                className="absolute -inset-1 rounded-full opacity-60 blur-sm"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}66)` }}
              />
              {page.avatar_url ? (
                <img
                  src={page.avatar_url}
                  alt={page.display_name}
                  className="relative h-24 w-24 rounded-full border-2 object-cover"
                  style={{ borderColor: accent }}
                />
              ) : (
                <div
                  className="relative h-24 w-24 rounded-full border-2 flex items-center justify-center text-3xl font-bold"
                  style={{
                    borderColor: accent,
                    background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                    color: "#09090b",
                  }}
                >
                  {initial}
                </div>
              )}
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight"
            >
              {page.display_name}
            </motion.h1>

            {/* Bio */}
            {page.bio && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-3 text-center text-sm sm:text-base text-white/60 max-w-md leading-relaxed"
              >
                {page.bio}
              </motion.p>
            )}
          </div>

          {/* Social Links */}
          {activeSocials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 space-y-3"
            >
              {activeSocials.map((social, i) => {
                const url = page[social.key as keyof StreamerPageSettings] as string;
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 w-full rounded-xl px-5 py-4 border transition-all duration-200"
                    style={{
                      borderColor: `${social.color}22`,
                      background: `${social.color}08`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = social.hoverBg;
                      e.currentTarget.style.borderColor = `${social.color}44`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${social.color}08`;
                      e.currentTarget.style.borderColor = `${social.color}22`;
                    }}
                  >
                    <div
                      className="flex items-center justify-center h-10 w-10 rounded-lg"
                      style={{ background: `${social.color}15`, color: social.color }}
                    >
                      <Icon />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{social.label}</div>
                      <div className="text-xs text-white/40 truncate">{url.replace(/^https?:\/\//, "")}</div>
                    </div>
                    <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-auto py-8 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <polyline
                points="3,16 9,16 11,10 13,22 15,6 17,26 19,14 21,18 23,16 29,16"
                stroke="currentColor" strokeWidth="2.5" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            Powered by Pulseframelabs
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// Social icons as components
function TwitchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

function KickIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.43A6.22 6.22 0 0015.84 15V8.52a8.18 8.18 0 003.75.92V6.69z" />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
