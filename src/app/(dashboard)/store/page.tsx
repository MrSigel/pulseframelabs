"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink,
  Plus,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  MoreHorizontal,
  Download,
  Check,
  RotateCcw,
  Copy,
  ImageIcon,
  Save,
  ChevronDown,
  Inbox,
  Headphones,
  Loader2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { store as storeDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { StoreItem, StoreSettings, StoreRedemption } from "@/lib/supabase/types";

export default function StorePage() {
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [storeSettingsOpen, setStoreSettingsOpen] = useState(false);

  // Add Item form state
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [emailRequired, setEmailRequired] = useState(false);
  const [visible, setVisible] = useState(true);
  const [redemptionLimit, setRedemptionLimit] = useState("-1");
  const [excludedUsers, setExcludedUsers] = useState("");

  // Store Settings state
  const [storeName, setStoreName] = useState("Streamer Store");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeCurrency, setStoreCurrency] = useState("Points");
  const [moreStoreOptions, setMoreStoreOptions] = useState(false);
  const [themeSettings, setThemeSettings] = useState(false);
  const [overlaySettings, setOverlaySettings] = useState(false);

  // DB queries
  const [creating, setCreating] = useState(false);
  const { data: dbItems, loading: itemsLoading, refetch: refetchItems } = useDbQuery<StoreItem[]>(
    () => storeDb.items.list(),
    [],
  );
  const { data: dbSettings, refetch: refetchSettings } = useDbQuery<StoreSettings | null>(
    () => storeDb.settings.get(),
    [],
  );
  const { data: dbRedemptions } = useDbQuery<StoreRedemption[]>(
    () => storeDb.redemptions.list(),
    [],
  );

  useEffect(() => {
    if (dbSettings) {
      setStoreName(dbSettings.store_name || "My Store");
      setStoreDescription(dbSettings.store_description || "");
      setStoreCurrency(dbSettings.store_currency || "Points");
    }
  }, [dbSettings]);

  const storeUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/streamer-name`;
  }, []);

  const resetAddItem = () => {
    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemQuantity("");
    setEmailRequired(false);
    setVisible(true);
    setRedemptionLimit("-1");
    setExcludedUsers("");
  };

  async function handleCreateItem() {
    if (!itemName.trim()) return;
    setCreating(true);
    try {
      await storeDb.items.create({
        name: itemName.trim(),
        description: itemDescription.trim(),
        price_points: parseInt(itemPrice) || 0,
        quantity_available: parseInt(itemQuantity) || -1,
      });
      setAddItemOpen(false);
      setItemName(""); setItemDescription(""); setItemPrice(""); setItemQuantity("");
      await refetchItems();
    } catch (err) {
      console.error("Failed to create item:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteItem(id: string) {
    try {
      await storeDb.items.remove(id);
      await refetchItems();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  }

  async function handleSaveSettings() {
    try {
      await storeDb.settings.update({
        store_name: storeName,
        store_description: storeDescription,
        store_currency: storeCurrency,
      });
      await refetchSettings();
      setStoreSettingsOpen(false);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }

  return (
    <div>
      <PageHeader
        title="Stream Store"
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={() => window.open(storeUrl, "_blank")}>
              <ExternalLink className="h-4 w-4" />
              Open Store Page
            </Button>
            <Button variant="success" className="gap-2" onClick={() => setAddItemOpen(true)}>
              <Plus className="h-4 w-4" />
              Add new Item
            </Button>
            <Button variant="destructive" className="gap-2" onClick={() => setStoreSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
              Store Settings
            </Button>
          </>
        }
      />

      {/* Store Link */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-semibold text-slate-400 shrink-0">Your Store Link:</Label>
            <div className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-400 truncate font-mono">
              {storeUrl}
            </div>
            <Button
              size="icon"
              onClick={() => navigator.clipboard.writeText(storeUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => window.open(storeUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            This is your personal store page. Share this link with your viewers so they can redeem items with their points.
          </p>
        </CardContent>
      </Card>

      {/* Last Redemptions */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">Last Redemptions</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input placeholder="Search for Viewer or Item" className="w-64 pr-8" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
            <Button variant="success" className="gap-2" onClick={() => setMoreOptionsOpen(true)}>
              <MoreHorizontal className="h-4 w-4" />
              More Options
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div
            className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
            style={{
              gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 1fr 0.8fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span>Viewer</span>
            <span>Item</span>
            <span>Price</span>
            <span>Redeemed at</span>
            <span>Status</span>
            <span>Manage</span>
          </div>

          {/* Redemptions list */}
          {!dbRedemptions || dbRedemptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Inbox className="h-10 w-10 mb-3 text-slate-600" />
              <p className="text-sm">No data available in table</p>
            </div>
          ) : (
            dbRedemptions.map((r) => {
              const matchedItem = dbItems?.find((i) => i.id === r.item_id);
              return (
                <div
                  key={r.id}
                  className="grid gap-4 px-4 py-3 items-center text-sm text-slate-300 hover:bg-white/[0.02] transition-colors"
                  style={{
                    gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 1fr 0.8fr",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span className="text-white font-medium truncate">{r.viewer_username}</span>
                  <span className="truncate">{matchedItem?.name ?? "Unknown Item"}</span>
                  <span>{matchedItem?.price_points ?? "—"} {storeCurrency}</span>
                  <span className="text-xs">{new Date(r.redeemed_at).toLocaleString()}</span>
                  <span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : r.status === "refunded"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon-sm" title="Complete">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon-sm" title="Refund">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-600">
                {dbRedemptions ? `Showing ${dbRedemptions.length} record${dbRedemptions.length !== 1 ? "s" : ""}` : "Showing no records"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon-sm" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">Items</CardTitle>
          <div className="relative">
            <Input placeholder="Search for an Item" className="w-64 pr-8" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div
            className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
            style={{
              gridTemplateColumns: "0.5fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span>Image</span>
            <span>Item</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Visible</span>
            <span>Manage</span>
          </div>

          {/* Items list */}
          {itemsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 mb-3 text-slate-600 animate-spin" />
              <p className="text-sm">Loading items...</p>
            </div>
          ) : !dbItems || dbItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Inbox className="h-10 w-10 mb-3 text-slate-600" />
              <p className="text-sm">No data available in table</p>
            </div>
          ) : (
            dbItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 px-4 py-3 items-center text-sm text-slate-300 hover:bg-white/[0.02] transition-colors"
                style={{
                  gridTemplateColumns: "0.5fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-slate-600" />
                  )}
                </div>
                <span className="text-white font-medium truncate">{item.name}</span>
                <span>{item.price_points} {storeCurrency}</span>
                <span>{item.quantity_available === -1 ? "Unlimited" : item.quantity_available}</span>
                <span>{item.visible ? <Check className="h-4 w-4 text-green-400" /> : <X className="h-4 w-4 text-red-400" />}</span>
                <div className="flex items-center gap-1">
                  <Button variant="destructive" size="icon-sm" onClick={() => handleDeleteItem(item.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-600">
                {dbItems ? `Showing ${dbItems.length} record${dbItems.length !== 1 ? "s" : ""}` : "Showing no records"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon-sm" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====== More Options Modal ====== */}
      {moreOptionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setMoreOptionsOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">More Options</h2>
              <button
                onClick={() => setMoreOptionsOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <Label className="text-sm font-semibold text-slate-400 block">Select an Option:</Label>

              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: "#3b82f6" }}
                onClick={() => setMoreOptionsOpen(false)}
              >
                <Download className="h-5 w-5" />
                <span className="flex-1 text-center">Export Redemptions</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: "#22c55e" }}
                onClick={() => setMoreOptionsOpen(false)}
              >
                <Check className="h-5 w-5" />
                <span className="flex-1 text-center">Complete All Pending Redemptions</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: "#ef4444" }}
                onClick={() => setMoreOptionsOpen(false)}
              >
                <RotateCcw className="h-5 w-5" />
                <span className="flex-1 text-center">Refund All Pending Redemptions</span>
              </button>

              <div className="flex items-start gap-2.5 pt-2">
                <Headphones className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-500">
                  Need help?{" "}
                  <span className="text-blue-400 hover:underline cursor-pointer">Visit our Help Center</span>{" "}
                  or{" "}
                  <span className="text-blue-400 hover:underline cursor-pointer">Contact Support</span>{" "}
                  for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== Add New Item Modal ====== */}
      {addItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setAddItemOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-2xl rounded-xl border border-white/[0.08] shadow-2xl max-h-[90vh] flex flex-col"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Add New Item</h2>
              <button
                onClick={() => setAddItemOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Item Image */}
              <div className="text-center">
                <Label className="text-sm font-semibold text-white block mb-3">Item Image</Label>
                <div
                  className="h-20 w-20 mx-auto rounded-lg flex items-center justify-center mb-3"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <ImageIcon className="h-8 w-8 text-slate-600" />
                </div>
                <Button size="sm" className="gap-1">
                  Upload Image
                </Button>
                <p className="text-[11px] text-slate-500 mt-2">
                  Upload a clear image representing the item (PNG, JPG) with dimensions 250x100px.
                </p>
              </div>

              {/* Item Name */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Item Name</Label>
                <Input
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">Enter a descriptive and concise name for the item.</p>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Description</Label>
                <textarea
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y min-h-[80px]"
                  placeholder="Enter item description"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">Provide a short, clear description of the item.</p>
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Price (Points)</Label>
                  <Input
                    placeholder="Enter price"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">Set the price in points required to redeem this item.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Quantity Available</Label>
                  <Input
                    placeholder="Enter quantity"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">Specify how many of this item are available for redemption.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-white block">Email Required</Label>
                      <p className="text-[11px] text-slate-500 mt-0.5">Toggle whether users must provide an email address to redeem this item.</p>
                    </div>
                    <Switch checked={emailRequired} onCheckedChange={setEmailRequired} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-white block">Visible</Label>
                      <p className="text-[11px] text-slate-500 mt-0.5">Toggle whether this item is visible in the store.</p>
                    </div>
                    <Switch checked={visible} onCheckedChange={setVisible} />
                  </div>
                </div>
              </div>

              {/* Redemption Limit & Excluded Users */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Redemption Limit per User</Label>
                  <Input
                    value={redemptionLimit}
                    onChange={(e) => setRedemptionLimit(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">Set how many times a single user can redeem this item. Use -1 for unlimited redemptions.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Excluded Users (comma-separated)</Label>
                  <Input
                    placeholder="Enter usernames to exclude (comma-separated)"
                    value={excludedUsers}
                    onChange={(e) => setExcludedUsers(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">List usernames that are not allowed to redeem this item, separated by commas.</p>
                </div>
              </div>

              {/* Submit */}
              <Button
                className="w-full gap-2 py-5 text-sm font-semibold"
                onClick={handleCreateItem}
                disabled={creating || !itemName.trim()}
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {creating ? "Adding..." : "+ Add Item"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Store Settings Modal ====== */}
      {storeSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setStoreSettingsOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-xl border border-white/[0.08] shadow-2xl max-h-[90vh] flex flex-col"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Store Settings</h2>
              <button
                onClick={() => setStoreSettingsOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Store Image */}
              <div>
                <Label className="text-sm font-semibold text-white block mb-3">Store Image</Label>
                <div className="flex flex-col items-center">
                  <div
                    className="h-20 w-20 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <ImageIcon className="h-8 w-8 text-slate-600" />
                  </div>
                  <Button size="sm" className="gap-1">
                    Upload Image
                  </Button>
                  <p className="text-[11px] text-slate-500 mt-2">Upload a clear image representing your store (PNG, JPG).</p>
                </div>
              </div>

              {/* Store Name */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Store Name</Label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">Enter a descriptive name for your store.</p>
              </div>

              {/* Store Description */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Store Description</Label>
                <textarea
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y min-h-[80px]"
                  placeholder="Description"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">Provide a short, clear description of your store.</p>
              </div>

              {/* Store Currency */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Store Currency</Label>
                <Input
                  value={storeCurrency}
                  onChange={(e) => setStoreCurrency(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">Enter the currency name for your store.</p>
              </div>

              {/* Collapsible Sections */}
              <div className="space-y-2">
                {/* More Store Options */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white font-semibold text-sm transition-all"
                  style={{ background: "#3b82f6" }}
                  onClick={() => setMoreStoreOptions(!moreStoreOptions)}
                >
                  <span>More Store Options</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${moreStoreOptions ? "rotate-180" : ""}`} />
                </button>
                {moreStoreOptions && (
                  <div className="px-4 py-3 rounded-lg space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm text-white font-semibold block">Allow Redemptions</Label>
                        <p className="text-[11px] text-slate-500">Enable or disable item redemptions.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm text-white font-semibold block">Show Prices</Label>
                        <p className="text-[11px] text-slate-500">Toggle price visibility in the store.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                )}

                {/* Theme Settings */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white font-semibold text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onClick={() => setThemeSettings(!themeSettings)}
                >
                  <span>Theme Settings</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${themeSettings ? "rotate-180" : ""}`} />
                </button>
                {themeSettings && (
                  <div className="px-4 py-3 rounded-lg space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <Label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Primary Color</Label>
                      <Input type="color" defaultValue="#3b82f6" className="h-10 w-12 cursor-pointer" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Background Color</Label>
                      <Input type="color" defaultValue="#0f1521" className="h-10 w-12 cursor-pointer" />
                    </div>
                  </div>
                )}

                {/* Overlay Settings */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white font-semibold text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onClick={() => setOverlaySettings(!overlaySettings)}
                >
                  <span>Overlay Settings</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${overlaySettings ? "rotate-180" : ""}`} />
                </button>
                {overlaySettings && (
                  <div className="px-4 py-3 rounded-lg space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm text-white font-semibold block">Show Overlay</Label>
                        <p className="text-[11px] text-slate-500">Display store overlay on stream.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                )}
              </div>

              {/* Save */}
              <Button
                className="w-full gap-2 py-5 text-sm font-semibold"
                onClick={handleSaveSettings}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
