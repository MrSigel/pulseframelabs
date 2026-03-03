"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Save, Loader2, ExternalLink, Copy, Eye, EyeOff,
  Globe, Twitch, Youtube, Twitter, MessageCircle,
  CheckCircle2, AlertCircle, Plus, X, Star, Pencil,
  Inbox, GripVertical, Tag,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { streamerPage, casinoDeals as dealsDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { StreamerPageSettings, CasinoDeal } from "@/lib/supabase/types";

export default function StreamerPageSettingsPage() {
  const { canModify } = useFeatureGate();
  const { data: settings, refetch } = useDbQuery<StreamerPageSettings | null>(
    () => streamerPage.get(),
    [],
  );
  const { data: deals, refetch: refetchDeals } = useDbQuery<CasinoDeal[]>(
    () => dealsDb.list(),
    [],
  );

  const [addDealOpen, setAddDealOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<CasinoDeal | null>(null);
  const [dealForm, setDealForm] = useState({
    casino_name: "", casino_logo_url: "", bonus_text: "",
    bonus_percentage: "", max_bonus_amount: "", wagering: "",
    bonus_code: "", affiliate_url: "", rating: "4.5", is_new: false,
  });
  const [dealSaving, setDealSaving] = useState(false);

  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [twitchUrl, setTwitchUrl] = useState("");
  const [kickUrl, setKickUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [accentColor, setAccentColor] = useState("#c9a84c");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (settings) {
      setSlug(settings.slug || "");
      setDisplayName(settings.display_name || "");
      setBio(settings.bio || "");
      setAvatarUrl(settings.avatar_url || "");
      setBannerUrl(settings.banner_url || "");
      setTwitchUrl(settings.twitch_url || "");
      setKickUrl(settings.kick_url || "");
      setYoutubeUrl(settings.youtube_url || "");
      setTwitterUrl(settings.twitter_url || "");
      setDiscordUrl(settings.discord_url || "");
      setInstagramUrl(settings.instagram_url || "");
      setTiktokUrl(settings.tiktok_url || "");
      setWebsiteUrl(settings.website_url || "");
      setIsPublic(settings.is_public ?? true);
      setAccentColor(settings.accent_color || "#c9a84c");
      if (settings.slug) setSlugManuallyEdited(true);
    }
  }, [settings]);

  function handleDisplayNameChange(value: string) {
    setDisplayName(value);
    if (!slugManuallyEdited) {
      const autoSlug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
      setSlug(autoSlug);
    }
  }

  function handleSlugChange(value: string) {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    setSlug(sanitized);
    setSlugManuallyEdited(true);
  }

  const baseUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }, []);

  const pageUrl = slug ? `${baseUrl}/s/${slug}` : "";

  async function handleSave() {
    if (!slug.trim()) {
      setSaveStatus("error");
      setSaveError("URL Slug is required");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }
    setSaving(true);
    setSaveStatus("idle");
    try {
      await streamerPage.update({
        slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
        display_name: displayName,
        bio,
        avatar_url: avatarUrl || null,
        banner_url: bannerUrl || null,
        twitch_url: twitchUrl || null,
        kick_url: kickUrl || null,
        youtube_url: youtubeUrl || null,
        twitter_url: twitterUrl || null,
        discord_url: discordUrl || null,
        instagram_url: instagramUrl || null,
        tiktok_url: tiktokUrl || null,
        website_url: websiteUrl || null,
        is_public: isPublic,
        accent_color: accentColor,
      });
      await refetch();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: unknown) {
      console.error("Failed to save streamer page:", err);
      const msg = err instanceof Error ? err.message : "Failed to save";
      setSaveStatus("error");
      setSaveError(msg.includes("unique") ? "This URL slug is already taken" : msg);
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setSaving(false);
    }
  }

  function handleCopyUrl() {
    if (pageUrl) {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function resetDealForm() {
    setDealForm({
      casino_name: "", casino_logo_url: "", bonus_text: "",
      bonus_percentage: "", max_bonus_amount: "", wagering: "",
      bonus_code: "", affiliate_url: "", rating: "4.5", is_new: false,
    });
    setEditingDeal(null);
  }

  function openEditDeal(deal: CasinoDeal) {
    setDealForm({
      casino_name: deal.casino_name,
      casino_logo_url: deal.casino_logo_url || "",
      bonus_text: deal.bonus_text,
      bonus_percentage: deal.bonus_percentage?.toString() || "",
      max_bonus_amount: deal.max_bonus_amount || "",
      wagering: deal.wagering || "",
      bonus_code: deal.bonus_code || "",
      affiliate_url: deal.affiliate_url,
      rating: deal.rating?.toString() || "4.5",
      is_new: deal.is_new,
    });
    setEditingDeal(deal);
    setAddDealOpen(true);
  }

  async function handleSaveDeal() {
    if (!dealForm.casino_name.trim() || !dealForm.affiliate_url.trim()) return;
    setDealSaving(true);
    try {
      const payload = {
        casino_name: dealForm.casino_name.trim(),
        casino_logo_url: dealForm.casino_logo_url.trim() || null,
        bonus_text: dealForm.bonus_text.trim(),
        bonus_percentage: dealForm.bonus_percentage ? parseInt(dealForm.bonus_percentage) : null,
        max_bonus_amount: dealForm.max_bonus_amount.trim() || null,
        wagering: dealForm.wagering.trim() || null,
        bonus_code: dealForm.bonus_code.trim() || null,
        affiliate_url: dealForm.affiliate_url.trim(),
        rating: parseFloat(dealForm.rating) || 0,
        is_new: dealForm.is_new,
        enabled: true,
        sort_order: editingDeal ? editingDeal.sort_order : (deals?.length || 0),
        details: {},
      };
      if (editingDeal) {
        await dealsDb.update(editingDeal.id, payload);
      } else {
        await dealsDb.create(payload);
      }
      await refetchDeals();
      setAddDealOpen(false);
      resetDealForm();
    } catch (err) {
      console.error("Failed to save deal:", err);
    } finally {
      setDealSaving(false);
    }
  }

  async function handleDeleteDeal(id: string) {
    try {
      await dealsDb.remove(id);
      await refetchDeals();
    } catch (err) {
      console.error("Failed to delete deal:", err);
    }
  }

  async function handleToggleDeal(deal: CasinoDeal) {
    try {
      await dealsDb.update(deal.id, { enabled: !deal.enabled });
      await refetchDeals();
    } catch (err) {
      console.error("Failed to toggle deal:", err);
    }
  }

  return (
    <div>
      <PageHeader
        title="Streamer Page"
        actions={
          <div className="flex items-center gap-2">
            {pageUrl && (
              <a href={`/s/${slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Button>
              </a>
            )}
            {saveStatus === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Saved!
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-red-400 font-medium">
                <AlertCircle className="h-4 w-4" /> {saveError}
              </span>
            )}
            <Button className="gap-2" onClick={handleSave} disabled={saving || !canModify}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* URL & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Page URL & Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">URL Slug</Label>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-lg bg-background/40 border border-border px-3 text-sm text-muted-foreground shrink-0">
                    {baseUrl}/s/
                  </div>
                  <Input
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="your-name"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, hyphens and underscores</p>
              </div>

              {pageUrl && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3">
                  <span className="text-sm text-foreground truncate flex-1">{pageUrl}</span>
                  <Button size="sm" variant="ghost" className="shrink-0 gap-1.5" onClick={handleCopyUrl}>
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-background/40 border border-border px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    {isPublic ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium text-foreground">
                      {isPublic ? "Page is Public" : "Page is Hidden"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPublic ? "Anyone with the link can view your page" : "Your page is not visible to others"}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Display Name</Label>
                <Input value={displayName} onChange={(e) => handleDisplayNameChange(e.target.value)} placeholder="Your display name" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Bio</Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your viewers about yourself..."
                  rows={4}
                  className="flex w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-primary/15 transition-all duration-200 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Avatar URL</Label>
                  <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Banner URL</Label>
                  <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Accent Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-14 rounded-lg border border-border bg-transparent cursor-pointer"
                  />
                  <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-32" placeholder="#c9a84c" />
                  <span className="text-xs text-muted-foreground">Used for buttons and highlights on your page</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white">Social Links</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Add your social media links to display on your page</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2"><Twitch className="h-4 w-4 text-purple-400" /> Twitch</Label>
                  <Input value={twitchUrl} onChange={(e) => setTwitchUrl(e.target.value)} placeholder="https://twitch.tv/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5v-7l6 3.5-6 3.5z"/></svg>
                    Kick
                  </Label>
                  <Input value={kickUrl} onChange={(e) => setKickUrl(e.target.value)} placeholder="https://kick.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2"><Youtube className="h-4 w-4 text-red-400" /> YouTube</Label>
                  <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400" /> Twitter / X</Label>
                  <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2"><MessageCircle className="h-4 w-4 text-indigo-400" /> Discord</Label>
                  <Input value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="https://discord.gg/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <svg className="h-4 w-4 text-pink-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    Instagram
                  </Label>
                  <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.43A6.22 6.22 0 0015.84 15V8.52a8.18 8.18 0 003.75.92V6.69z"/></svg>
                    TikTok
                  </Label>
                  <Input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Website</Label>
                  <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Casino Deals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Casino Deals
              </CardTitle>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => { resetDealForm(); setAddDealOpen(true); }}
                disabled={!canModify}
              >
                <Plus className="h-3.5 w-3.5" /> Add Deal
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Manage casino deals displayed on your landing page. Viewers see these as bonus offers.
              </p>

              {!deals || deals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Inbox className="h-8 w-8 mb-2 text-muted-foreground/60" />
                  <p className="text-sm">No deals yet. Add your first casino deal.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                        deal.enabled
                          ? "border-border bg-background/40"
                          : "border-border/50 bg-background/20 opacity-60"
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab" />
                      {deal.casino_logo_url ? (
                        <img src={deal.casino_logo_url} alt={deal.casino_name} className="h-8 w-8 rounded object-contain bg-white/5" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {deal.casino_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{deal.casino_name}</span>
                          {deal.is_new && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">NEW</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {deal.bonus_percentage && <span>{deal.bonus_percentage}%</span>}
                          {deal.max_bonus_amount && <span>Max {deal.max_bonus_amount}</span>}
                          {deal.wagering && <span>Wager {deal.wagering}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center gap-0.5 text-xs text-amber-400 mr-1">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {deal.rating}
                        </div>
                        <Switch
                          checked={deal.enabled}
                          onCheckedChange={() => handleToggleDeal(deal)}
                        />
                        <button
                          onClick={() => openEditDeal(deal)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border border-border bg-background/60">
                {/* Mini banner */}
                <div
                  className="h-20 w-full"
                  style={{
                    background: bannerUrl
                      ? `url(${bannerUrl}) center/cover`
                      : `linear-gradient(135deg, ${accentColor}33 0%, transparent 100%)`,
                  }}
                />
                {/* Avatar & Info */}
                <div className="px-4 pb-4 -mt-6">
                  <div
                    className="h-12 w-12 rounded-full border-2 flex items-center justify-center text-lg font-bold"
                    style={{
                      borderColor: accentColor,
                      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                      color: "#09090b",
                    }}
                  >
                    {(displayName || slug || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-bold text-foreground">{displayName || "Your Name"}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{bio || "Your bio will appear here..."}</div>
                  </div>
                  {/* Social icons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {twitchUrl && <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center"><Twitch className="h-3.5 w-3.5 text-purple-400" /></div>}
                    {kickUrl && <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">K</div>}
                    {youtubeUrl && <div className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center"><Youtube className="h-3.5 w-3.5 text-red-400" /></div>}
                    {twitterUrl && <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center"><Twitter className="h-3.5 w-3.5 text-sky-400" /></div>}
                    {discordUrl && <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center"><MessageCircle className="h-3.5 w-3.5 text-indigo-400" /></div>}
                    {!twitchUrl && !kickUrl && !youtubeUrl && !twitterUrl && !discordUrl && (
                      <span className="text-xs text-muted-foreground">Add social links to see them here</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Your streamer page is a public landing page for your viewers and fans.</p>
              <ul className="space-y-2 list-disc pl-4">
                <li>Set a unique URL slug for your page</li>
                <li>Add your profile info and social links</li>
                <li>Share the link with your community</li>
                <li>Toggle visibility on/off anytime</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Deal Modal */}
      {addDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => { setAddDealOpen(false); resetDealForm(); }}
          />
          <div
            className="relative z-10 w-full max-w-lg rounded-xl border border-white/[0.08] shadow-2xl max-h-[90vh] flex flex-col"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">
                {editingDeal ? "Edit Deal" : "Add Casino Deal"}
              </h2>
              <button
                onClick={() => { setAddDealOpen(false); resetDealForm(); }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-sm font-semibold text-white mb-2 block">Casino Name *</Label>
                  <Input
                    value={dealForm.casino_name}
                    onChange={(e) => setDealForm({ ...dealForm, casino_name: e.target.value })}
                    placeholder="e.g. Stake Casino"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold text-white mb-2 block">Casino Logo URL</Label>
                  <Input
                    value={dealForm.casino_logo_url}
                    onChange={(e) => setDealForm({ ...dealForm, casino_logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Bonus %</Label>
                  <Input
                    value={dealForm.bonus_percentage}
                    onChange={(e) => setDealForm({ ...dealForm, bonus_percentage: e.target.value })}
                    placeholder="e.g. 200"
                    type="number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Max Bonus Amount</Label>
                  <Input
                    value={dealForm.max_bonus_amount}
                    onChange={(e) => setDealForm({ ...dealForm, max_bonus_amount: e.target.value })}
                    placeholder="e.g. 500 EUR"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold text-white mb-2 block">Bonus Description</Label>
                  <Input
                    value={dealForm.bonus_text}
                    onChange={(e) => setDealForm({ ...dealForm, bonus_text: e.target.value })}
                    placeholder="e.g. 200% up to 500 EUR Welcome Bonus"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Wagering</Label>
                  <Input
                    value={dealForm.wagering}
                    onChange={(e) => setDealForm({ ...dealForm, wagering: e.target.value })}
                    placeholder="e.g. 40x"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Bonus Code</Label>
                  <Input
                    value={dealForm.bonus_code}
                    onChange={(e) => setDealForm({ ...dealForm, bonus_code: e.target.value })}
                    placeholder="e.g. STREAMER100"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold text-white mb-2 block">Affiliate URL *</Label>
                  <Input
                    value={dealForm.affiliate_url}
                    onChange={(e) => setDealForm({ ...dealForm, affiliate_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Rating (0-5)</Label>
                  <Input
                    value={dealForm.rating}
                    onChange={(e) => setDealForm({ ...dealForm, rating: e.target.value })}
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={dealForm.is_new}
                      onCheckedChange={(v) => setDealForm({ ...dealForm, is_new: v })}
                    />
                    <Label className="text-sm text-white">Mark as NEW</Label>
                  </div>
                </div>
              </div>

              <Button
                className="w-full gap-2 py-5 text-sm font-semibold mt-2"
                onClick={handleSaveDeal}
                disabled={dealSaving || !dealForm.casino_name.trim() || !dealForm.affiliate_url.trim() || !canModify}
              >
                {dealSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {dealSaving ? "Saving..." : editingDeal ? "Update Deal" : "Add Deal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
