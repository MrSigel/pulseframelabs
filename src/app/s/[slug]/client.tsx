"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { StreamerPageSettings, CasinoDeal, StoreItem, StoreSettings } from "@/lib/supabase/types";
import { PurchaseModal } from "./purchase-modal";

type NavTab = "deals" | "store" | "about";

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

interface Props {
  page: StreamerPageSettings;
  deals: CasinoDeal[];
  storeItems: StoreItem[];
  storeSettings: StoreSettings | null;
  streamerUserId: string;
}

export function StreamerPageClient({ page, deals, storeItems, storeSettings, streamerUserId }: Props) {
  const accent = page.accent_color || "#c9a84c";
  const initial = (page.display_name || page.slug).charAt(0).toUpperCase();
  const [activeTab, setActiveTab] = useState<NavTab>("deals");
  const [purchaseItem, setPurchaseItem] = useState<StoreItem | null>(null);

  const activeSocials = socialLinks.filter(
    (s) => page[s.key as keyof StreamerPageSettings]
  );

  const tabs: { key: NavTab; label: string; show: boolean }[] = [
    { key: "deals", label: "Casino Deals", show: true },
    { key: "store", label: storeSettings?.store_name || "Store", show: storeItems.length > 0 },
    { key: "about", label: "About", show: true },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(11, 14, 20, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center h-14">
          {/* Streamer Name / Logo */}
          <div className="flex items-center gap-2.5 mr-8 shrink-0">
            {page.avatar_url ? (
              <img
                src={page.avatar_url}
                alt={page.display_name}
                className="h-7 w-7 rounded-full object-cover border"
                style={{ borderColor: `${accent}66` }}
              />
            ) : (
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                  color: "#0b0e14",
                }}
              >
                {initial}
              </div>
            )}
            <span className="text-sm font-bold text-white tracking-tight">
              {page.display_name}
            </span>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                style={{
                  color: activeTab === tab.key ? "white" : "rgba(255,255,255,0.45)",
                  background: activeTab === tab.key ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Social icons in nav */}
          <div className="ml-auto flex items-center gap-1.5">
            {activeSocials.slice(0, 5).map((social) => {
              const url = page[social.key as keyof StreamerPageSettings] as string;
              const Icon = social.icon;
              return (
                <a
                  key={social.key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-7 w-7 rounded-md flex items-center justify-center transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = social.color; e.currentTarget.style.background = `${social.color}15`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                  title={social.label}
                >
                  <div className="scale-75"><Icon /></div>
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${accent}18 0%, transparent 40%, ${accent}08 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(${accent}33 1px, transparent 1px), linear-gradient(90deg, ${accent}33 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-5"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="absolute -inset-0.5 rounded-full opacity-50 blur-sm"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}66)` }}
              />
              {page.avatar_url ? (
                <img
                  src={page.avatar_url}
                  alt={page.display_name}
                  className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 object-cover"
                  style={{ borderColor: accent }}
                />
              ) : (
                <div
                  className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 flex items-center justify-center text-2xl sm:text-3xl font-bold"
                  style={{
                    borderColor: accent,
                    background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                    color: "#0b0e14",
                  }}
                >
                  {initial}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {page.display_name}
              </h1>
              {page.bio && (
                <p className="text-sm text-white/50 mt-1 max-w-lg leading-relaxed line-clamp-2">
                  {page.bio}
                </p>
              )}
            </div>
          </motion.div>
        </div>
        {/* Gradient fade to content */}
        <div
          className="h-8"
          style={{ background: "linear-gradient(to bottom, transparent, #0b0e14)" }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* Deals Tab */}
        {activeTab === "deals" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {deals.length === 0 ? (
              <div className="text-center py-20 text-white/30">
                <p className="text-lg font-medium">No deals available yet</p>
                <p className="text-sm mt-1">Check back soon for exclusive casino bonuses!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">
                    Casino Bonus Deals
                  </h2>
                  <span className="text-xs text-white/30">{deals.length} Deal{deals.length !== 1 ? "s" : ""}</span>
                </div>
                {deals.map((deal, i) => (
                  <DealCard key={deal.id} deal={deal} accent={accent} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Store Tab */}
        {activeTab === "store" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white">
                {storeSettings?.store_name || "Store"}
              </h2>
              {storeSettings?.store_description && (
                <p className="text-sm text-white/40 mt-1">{storeSettings.store_description}</p>
              )}
            </div>
            {storeItems.length === 0 ? (
              <div className="text-center py-20 text-white/30">
                <p className="text-lg font-medium">No items in the store</p>
                <p className="text-sm mt-1">Check back later!</p>
              </div>
            ) : (
              <>
                {/* Badges Section */}
                {storeItems.some((i) => i.item_type === "badge") && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Badges
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {storeItems
                        .filter((i) => i.item_type === "badge")
                        .map((item, i) => (
                          <BadgeCard
                            key={item.id}
                            item={item}
                            currency={storeSettings?.store_currency || "Points"}
                            accent={accent}
                            index={i}
                            onBuy={() => setPurchaseItem(item)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Regular Items Section */}
                {storeItems.some((i) => i.item_type !== "badge") && (
                  <div>
                    {storeItems.some((i) => i.item_type === "badge") && (
                      <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                        </svg>
                        Items
                      </h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {storeItems
                        .filter((i) => i.item_type !== "badge")
                        .map((item, i) => (
                          <StoreItemCard
                            key={item.id}
                            item={item}
                            currency={storeSettings?.store_currency || "Points"}
                            accent={accent}
                            index={i}
                            onBuy={() => setPurchaseItem(item)}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-lg mx-auto"
          >
            {/* Profile Card */}
            <div
              className="rounded-xl overflow-hidden border"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              {/* Banner */}
              <div className="h-32 sm:h-40 relative">
                {page.banner_url ? (
                  <img src={page.banner_url} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: `linear-gradient(135deg, ${accent}30 0%, ${accent}08 60%, transparent 100%)` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-transparent" />
              </div>

              {/* Avatar + Info */}
              <div className="px-6 pb-6 -mt-10 relative">
                <div className="relative inline-block">
                  <div
                    className="absolute -inset-0.5 rounded-full opacity-50 blur-sm"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}66)` }}
                  />
                  {page.avatar_url ? (
                    <img
                      src={page.avatar_url}
                      alt={page.display_name}
                      className="relative h-16 w-16 rounded-full border-2 object-cover"
                      style={{ borderColor: accent }}
                    />
                  ) : (
                    <div
                      className="relative h-16 w-16 rounded-full border-2 flex items-center justify-center text-xl font-bold"
                      style={{
                        borderColor: accent,
                        background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                        color: "#0b0e14",
                      }}
                    >
                      {initial}
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white mt-3">{page.display_name}</h2>
                {page.bio && (
                  <p className="text-sm text-white/50 mt-2 leading-relaxed">{page.bio}</p>
                )}

                {/* Social Links */}
                {activeSocials.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {activeSocials.map((social) => {
                      const url = page[social.key as keyof StreamerPageSettings] as string;
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 w-full rounded-lg px-4 py-3 border transition-all duration-200"
                          style={{
                            borderColor: `${social.color}20`,
                            background: `${social.color}06`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = social.hoverBg;
                            e.currentTarget.style.borderColor = `${social.color}40`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `${social.color}06`;
                            e.currentTarget.style.borderColor = `${social.color}20`;
                          }}
                        >
                          <div
                            className="flex items-center justify-center h-8 w-8 rounded-md"
                            style={{ background: `${social.color}12`, color: social.color }}
                          >
                            <Icon />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white">{social.label}</div>
                            <div className="text-xs text-white/30 truncate">{url.replace(/^https?:\/\//, "")}</div>
                          </div>
                          <svg className="h-4 w-4 text-white/15 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="border-t py-6 text-center"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/20 hover:text-white/40 transition-colors"
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
      </footer>

      {/* Purchase Modal */}
      {purchaseItem && (
        <PurchaseModal
          item={purchaseItem}
          currency={storeSettings?.store_currency || "Points"}
          accent={accent}
          streamerUserId={streamerUserId}
          onClose={() => setPurchaseItem(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// Deal Card Component
// ============================================================

function DealCard({ deal, accent, index }: { deal: CasinoDeal; accent: string; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl border overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-4 px-4 sm:px-5 py-4">
        {/* Logo */}
        {deal.casino_logo_url ? (
          <img
            src={deal.casino_logo_url}
            alt={deal.casino_name}
            className="h-12 w-12 rounded-lg object-contain bg-white/5 shrink-0"
          />
        ) : (
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
            style={{ background: `${accent}15`, color: accent }}
          >
            {deal.casino_name.charAt(0)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white truncate">{deal.casino_name}</span>
            {deal.is_new && (
              <span
                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
              >
                NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
            {deal.bonus_percentage && (
              <span className="font-semibold" style={{ color: accent }}>{deal.bonus_percentage}%</span>
            )}
            {deal.max_bonus_amount && <span>Max {deal.max_bonus_amount}</span>}
            {deal.wagering && <span>Wager {deal.wagering}</span>}
          </div>
        </div>

        {/* Rating */}
        {deal.rating > 0 && (
          <div className="flex items-center gap-1 shrink-0 mr-2">
            <StarIcon />
            <span className="text-xs font-semibold text-amber-400">{deal.rating}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.6)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            {expanded ? "Less" : "Details"}
          </button>
          <a
            href={deal.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90"
            style={{ background: accent, color: "#0b0e14" }}
          >
            Play
          </a>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="border-t px-4 sm:px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.04)" }}
        >
          {deal.bonus_text && (
            <p className="text-sm text-white/60 mb-3">{deal.bonus_text}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {deal.bonus_percentage && (
              <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-white/30 mb-0.5">Bonus</div>
                <div className="font-semibold text-white">{deal.bonus_percentage}%</div>
              </div>
            )}
            {deal.max_bonus_amount && (
              <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-white/30 mb-0.5">Max Bonus</div>
                <div className="font-semibold text-white">{deal.max_bonus_amount}</div>
              </div>
            )}
            {deal.wagering && (
              <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-white/30 mb-0.5">Wagering</div>
                <div className="font-semibold text-white">{deal.wagering}</div>
              </div>
            )}
            {deal.bonus_code && (
              <div className="rounded-lg px-3 py-2 col-span-2 sm:col-span-1" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-white/30 mb-0.5">Bonus Code</div>
                <div className="font-mono font-semibold" style={{ color: accent }}>{deal.bonus_code}</div>
              </div>
            )}
          </div>
          <a
            href={deal.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: accent, color: "#0b0e14" }}
          >
            Claim Bonus
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================
// Badge Card Component (for badge-type store items)
// ============================================================

function BadgeCard({ item, currency, accent, index, onBuy }: { item: StoreItem; currency: string; accent: string; index: number; onBuy: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl overflow-hidden flex flex-col items-center text-center"
      style={{
        background: "#2a2d37",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Badge Image - centered, prominent */}
      <div className="w-full pt-5 pb-3 px-4 flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-24 w-24 object-contain rounded-lg"
            style={{
              filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
            }}
          />
        ) : (
          <div
            className="h-24 w-24 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}12` }}
          >
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke={`${accent}60`} strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Name + Description */}
      <div className="px-4 pb-2">
        <h3 className="text-sm font-bold text-white">{item.name}</h3>
        {item.description && (
          <p className="text-[11px] text-white/40 mt-0.5 line-clamp-2">{item.description}</p>
        )}
      </div>

      {/* Price + Buy */}
      <div
        className="w-full px-4 py-3 mt-auto flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-sm font-bold" style={{ color: accent }}>
          {item.price_points} {currency}
        </span>
        {item.quantity_available === 0 ? (
          <span
            className="px-3 py-1 rounded-md text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
          >
            Sold Out
          </span>
        ) : (
          <button
            onClick={onBuy}
            className="px-3 py-1 rounded-md text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: accent, color: "#0b0e14", border: "none", cursor: "pointer" }}
          >
            Buy
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// Store Item Card Component
// ============================================================

function StoreItemCard({ item, currency, accent, index, onBuy }: { item: StoreItem; currency: string; accent: string; index: number; onBuy: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl border overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* Image */}
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-full h-36 object-cover" />
      ) : (
        <div
          className="w-full h-36 flex items-center justify-center"
          style={{ background: `${accent}08` }}
        >
          <span className="text-3xl font-bold" style={{ color: `${accent}30` }}>
            {item.name.charAt(0)}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-white">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-white/40 mt-1 line-clamp-2 flex-1">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <span className="text-sm font-bold" style={{ color: accent }}>
              {item.price_points} {currency}
            </span>
            {item.quantity_available !== -1 && item.quantity_available > 0 && (
              <span className="text-[10px] text-white/30 ml-2">
                {item.quantity_available} left
              </span>
            )}
          </div>
          {item.quantity_available === 0 ? (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
            >
              Sold Out
            </span>
          ) : (
            <button
              onClick={onBuy}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90"
              style={{ background: accent, color: "#0b0e14", border: "none", cursor: "pointer" }}
            >
              Buy
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Icon Components
// ============================================================

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

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
