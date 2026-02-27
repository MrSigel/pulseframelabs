"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X, Loader2, Tag, Pencil } from "lucide-react";
import { useState } from "react";
import { promotions as promosDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { Promotion } from "@/lib/supabase/types";

export default function PromoManagementPage() {
  const { data: dbPromos, loading, refetch } = useDbQuery<Promotion[]>(() => promosDb.list(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCode, setNewCode] = useState("");

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      await promosDb.create({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        code: newCode.trim() || undefined,
      });
      setNewTitle("");
      setNewDescription("");
      setNewCode("");
      setShowAdd(false);
      await refetch();
    } catch (err) {
      console.error("Failed to create promotion:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await promosDb.remove(id);
      await refetch();
    } catch (err) {
      console.error("Failed to delete promotion:", err);
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      await promosDb.update(id, { is_active: !currentActive });
      await refetch();
    } catch (err) {
      console.error("Failed to toggle promotion:", err);
    }
  }

  return (
    <div>
      <PageHeader
        title="Promo Management"
        actions={
          <Button variant="success" className="gap-2" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Add Promo
          </Button>
        }
      />

      {/* Add Promo Modal */}
      {showAdd && (
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-sm">New Promotion</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-bold mb-1.5 block">Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Promotion title" />
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-bold mb-1.5 block">Description</Label>
              <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description (optional)" />
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-bold mb-1.5 block">Code</Label>
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Promo code (optional)" />
            </div>
            <Button variant="success" className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Create Promotion
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-slate-500">Loading promotions...</p>
            </div>
          ) : dbPromos && dbPromos.length > 0 ? (
            <div className="space-y-3">
              {dbPromos.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: promo.is_active ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.12)", border: promo.is_active ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(100,116,139,0.2)" }}>
                    <Tag className={`h-5 w-5 ${promo.is_active ? "text-green-500" : "text-slate-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{promo.title}</h3>
                    {promo.description && <p className="text-slate-500 text-xs truncate">{promo.description}</p>}
                  </div>
                  {promo.code && (
                    <span className="text-xs font-mono px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">{promo.code}</span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${promo.is_active ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-500"}`}>
                    {promo.is_active ? "Active" : "Inactive"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleActive(promo.id, promo.is_active)}
                      className="h-7 w-7 rounded flex items-center justify-center hover:bg-primary/10 transition-colors"
                      title={promo.is_active ? "Deactivate" : "Activate"}
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="h-7 w-7 rounded flex items-center justify-center hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-4xl mb-4">&#128227;</span>
              <h2 className="text-xl font-bold text-white mb-2">Promo Management</h2>
              <p className="text-slate-500 text-center max-w-md">
                Manage your promotional content and campaigns.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
