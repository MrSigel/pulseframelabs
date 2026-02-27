"use client";

import { useState, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { casinos as casinosDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { Casino } from "@/lib/supabase/types";

export default function CasinoManagementPage() {
  const [adding, setAdding] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const { data: dbCasinos, loading, refetch } = useDbQuery<Casino[]>(() => casinosDb.list(), []);

  async function handleAddCasino() {
    const name = nameRef.current?.value?.trim();
    if (!name) return;
    setAdding(true);
    try {
      await casinosDb.create({ name });
      if (nameRef.current) nameRef.current.value = "";
      await refetch();
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  }

  async function handleDeleteCasino(id: string) {
    try { await casinosDb.remove(id); await refetch(); }
    catch (err) { console.error(err); }
  }

  return (
    <div>
      <PageHeader
        title="Casino Management"
        actions={
          <div className="flex items-center gap-2">
            <Input
              ref={nameRef}
              placeholder="Casino name..."
              className="w-48"
              onKeyDown={(e) => e.key === "Enter" && handleAddCasino()}
            />
            <Button
              variant="success"
              className="gap-2"
              onClick={handleAddCasino}
              disabled={adding}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Casino
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              <p className="text-slate-500 text-sm">Loading casinos...</p>
            </div>
          ) : !dbCasinos || dbCasinos.length === 0 ? (
            <>
              <span className="text-4xl mb-4">&#127183;</span>
              <h2 className="text-xl font-bold text-white mb-2">Casino Management</h2>
              <p className="text-slate-500 text-center max-w-md">
                Manage your casino configurations. Add, edit, or remove casinos from your dashboard.
              </p>
            </>
          ) : (
            <div className="w-full space-y-2">
              {dbCasinos.map((casino) => (
                <div
                  key={casino.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <span className="font-semibold text-white">{casino.name}</span>
                    {casino.description && (
                      <p className="text-sm text-slate-500">{casino.description}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleDeleteCasino(casino.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
