"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Search, Link, ChevronLeft, ChevronRight, X, ArrowLeft, Plus, Minus, Info, Coins, Loader2, Camera, Trash2, Save } from "lucide-react";
import { useState, useMemo, useRef, useCallback } from "react";
import { streamViewers as viewersDb, userProfiles } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { StreamViewer, UserProfile } from "@/lib/supabase/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export default function SettingsPage() {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [moreOptionsView, setMoreOptionsView] = useState<"main" | "manage-points">("main");
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [viewerSearch, setViewerSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [viewerPage, setViewerPage] = useState(0);

  // Avatar states
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: dbViewers, loading, refetch } = useDbQuery<StreamViewer[]>(() => viewersDb.list(), []);
  const { data: profile, refetch: refetchProfile } = useDbQuery<UserProfile | null>(() => userProfiles.get(), []);

  // Initialize form from profile
  if (profile && !profileInitialized) {
    setDisplayNameInput(profile.display_name || "");
    setAvatarPreview(profile.avatar_url || null);
    setProfileInitialized(true);
  }

  const filteredViewers = useMemo(() => {
    if (!dbViewers) return [];
    if (!viewerSearch.trim()) return dbViewers;
    return dbViewers.filter((v) => v.username.toLowerCase().includes(viewerSearch.toLowerCase()));
  }, [dbViewers, viewerSearch]);

  const totalViewerPages = Math.max(1, Math.ceil(filteredViewers.length / perPage));
  const pagedViewers = filteredViewers.slice(viewerPage * perPage, (viewerPage + 1) * perPage);

  const handleAvatarSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("Only JPG, PNG, GIF, and WebP files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError("File is too large. Maximum size is 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const filePath = `${user.id}/avatar.${ext}`;

      // Upload to Supabase Storage (bucket: avatars)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Save to user profile
      await userProfiles.update({ avatar_url: publicUrl });
      setAvatarPreview(publicUrl);
      await refetchProfile();
    } catch (err: unknown) {
      console.error("Upload failed:", err);
      setAvatarError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [refetchProfile]);

  async function handleRemoveAvatar() {
    try {
      await userProfiles.update({ avatar_url: null });
      setAvatarPreview(null);
      await refetchProfile();
    } catch (err) {
      console.error("Failed to remove avatar:", err);
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await userProfiles.update({ display_name: displayNameInput || null });
      await refetchProfile();
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddPoints() {
    if (!pointsAmount) return;
    try {
      await viewersDb.transactions.create({
        amount: Number(pointsAmount),
        reason: pointsReason || "Manual add",
        type: "add",
      });
      setPointsAmount("");
      setPointsReason("");
      await refetch();
    } catch (err) {
      console.error("Failed to add points:", err);
    }
  }

  async function handleRemovePoints() {
    if (!pointsAmount) return;
    try {
      await viewersDb.transactions.create({
        amount: Number(pointsAmount),
        reason: pointsReason || "Manual remove",
        type: "remove",
      });
      setPointsAmount("");
      setPointsReason("");
      await refetch();
    } catch (err) {
      console.error("Failed to remove points:", err);
    }
  }

  function closeMoreOptions() {
    setShowMoreOptions(false);
    setMoreOptionsView("main");
    setPointsAmount("");
    setPointsReason("");
  }

  const currentAvatarUrl = avatarPreview || profile?.avatar_url;
  const currentInitial = (displayNameInput || profile?.display_name || "U").charAt(0).toUpperCase();

  return (
    <div>
      <PageHeader title="Stream Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile + Viewers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-start gap-6">
                <div className="relative group shrink-0">
                  {/* Avatar display */}
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-primary/40 opacity-50" />
                    {currentAvatarUrl ? (
                      <img
                        src={currentAvatarUrl}
                        alt="Avatar"
                        className="relative h-20 w-20 rounded-full border-2 border-primary/30 object-cover"
                      />
                    ) : (
                      <div className="relative h-20 w-20 rounded-full border-2 border-primary/30 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                        {currentInitial}
                      </div>
                    )}
                    {/* Upload overlay */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      {uploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Profile Picture</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a profile picture. Supported formats: JPG, PNG, GIF, WebP.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max. size: <span className="text-foreground/70 font-medium">2 MB</span> — Recommended: <span className="text-foreground/70 font-medium">256 x 256 px</span> (square)
                    </p>
                  </div>

                  {avatarError && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {avatarError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                      {uploading ? "Uploading..." : "Upload Image"}
                    </Button>
                    {currentAvatarUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/5"
                        onClick={handleRemoveAvatar}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Label className="text-white">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="Your display name"
                    className="flex-1"
                  />
                  <Button className="gap-1.5" onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Shown in the header and profile dropdown</p>
              </div>
            </CardContent>
          </Card>

          {/* Stream Viewers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                Stream Viewers
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    placeholder="Search for a Viewer"
                    className="w-56 pr-8"
                    value={viewerSearch}
                    onChange={(e) => { setViewerSearch(e.target.value); setViewerPage(0); }}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
                <Button variant="success" className="gap-2" onClick={() => { setMoreOptionsView("main"); setShowMoreOptions(true); }}>
                  <Settings2 className="h-4 w-4" />
                  More Options
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm text-slate-500 bg-secondary rounded px-3 py-2 mb-4">
                <span>User</span>
                <span>Points</span>
                <span>Watch Time</span>
                <span>Last Seen</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                </div>
              ) : pagedViewers.length > 0 ? (
                <div className="space-y-1">
                  {pagedViewers.map((viewer) => (
                    <div key={viewer.id} className="grid grid-cols-4 gap-4 text-sm px-3 py-2 rounded hover:bg-white/[0.02] transition-colors">
                      <span className="text-white font-medium">{viewer.username}</span>
                      <span className="text-slate-400">{viewer.total_points.toLocaleString()}</span>
                      <span className="text-slate-400">{Math.round(viewer.watch_time_minutes / 60)}h {viewer.watch_time_minutes % 60}m</span>
                      <span className="text-slate-500">{new Date(viewer.last_seen).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No data available in table
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setViewerPage(0); }}>
                    <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-slate-500">
                    {filteredViewers.length > 0
                      ? `Showing ${viewerPage * perPage + 1}-${Math.min((viewerPage + 1) * perPage, filteredViewers.length)} of ${filteredViewers.length}`
                      : "Showing no records"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={viewerPage === 0} onClick={() => setViewerPage((p) => Math.max(0, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={viewerPage >= totalViewerPages - 1} onClick={() => setViewerPage((p) => Math.min(totalViewerPages - 1, p + 1))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Linked Accounts */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Link className="h-5 w-5" />
              Linked Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Link className="h-4 w-4" />
              Link More Accounts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* More Options Modal */}
      {showMoreOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMoreOptions} />
          <div
            className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl"
            style={{ animation: "modalSlideIn 0.25s ease-out" }}
          >
            {/* Main View */}
            {moreOptionsView === "main" && (
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-white font-bold text-base">More Options</h3>
                  <button onClick={closeMoreOptions} className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-slate-400 text-sm mb-1">Select an Option:</p>
                  <Button
                    className="w-full gap-2 py-5 text-sm font-semibold"
                    onClick={() => setMoreOptionsView("manage-points")}
                  >
                    <Coins className="h-4 w-4" />
                    Manage Points for All Users
                  </Button>
                </div>
              </div>
            )}

            {/* Manage Points View */}
            {moreOptionsView === "manage-points" && (
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMoreOptionsView("main")}
                      className="text-primary hover:text-primary transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  </div>
                  <button onClick={closeMoreOptions} className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <Label className="text-white font-semibold text-sm block">Points Management:</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={pointsAmount}
                        onChange={(e) => setPointsAmount(e.target.value)}
                        placeholder="Enter Points Amount"
                        type="number"
                        className="pr-8"
                      />
                      <Coins className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div className="relative flex-1">
                      <Input
                        value={pointsReason}
                        onChange={(e) => setPointsReason(e.target.value)}
                        placeholder="Provide a Reason"
                        className="pr-8"
                      />
                      <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                  <Button
                    variant="success"
                    className="w-full gap-2 py-4 text-sm font-semibold"
                    onClick={handleAddPoints}
                  >
                    <Plus className="h-4 w-4" />
                    Add Points
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full gap-2 py-4 text-sm font-semibold"
                    onClick={handleRemovePoints}
                  >
                    <Minus className="h-4 w-4" />
                    Remove Points
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
