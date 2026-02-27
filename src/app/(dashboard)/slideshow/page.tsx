"use client";

import { useState, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Monitor, Plus, Loader2, Trash2 } from "lucide-react";
import { slideshow as slideshowDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { SlideshowItem } from "@/lib/supabase/types";

export default function SlideshowPage() {
  const [adding, setAdding] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const { data: dbItems, loading, refetch } = useDbQuery<SlideshowItem[]>(() => slideshowDb.list(), []);

  async function handleAddSlide() {
    const name = nameRef.current?.value?.trim();
    if (!name) return;
    setAdding(true);
    try {
      await slideshowDb.create({ casino_name: name, position: (dbItems?.length ?? 0) });
      if (nameRef.current) nameRef.current.value = "";
      await refetch();
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  }

  async function handleDeleteSlide(id: string) {
    try { await slideshowDb.remove(id); await refetch(); }
    catch (err) { console.error(err); }
  }

  return (
    <div>
      <PageHeader
        title="SlideShow Management"
        actions={
          <>
            <Button variant="success" className="gap-2">
              <Monitor className="h-4 w-4" />
              Slideshow Overlay
            </Button>
            <div className="flex items-center gap-2">
              <Input
                ref={nameRef}
                placeholder="Casino name..."
                className="w-48"
                onKeyDown={(e) => e.key === "Enter" && handleAddSlide()}
              />
              <Button
                className="gap-2"
                onClick={handleAddSlide}
                disabled={adding}
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Casino to Slideshow
              </Button>
            </div>
          </>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-5 gap-4 text-xs text-slate-500 font-semibold uppercase border-b border-border pb-3 mb-3">
            <span className="flex items-center gap-1">&#8597; Position.</span>
            <span className="flex items-center gap-1">&#127183; Name</span>
            <span className="flex items-center gap-1">&#128197; Created</span>
            <span className="flex items-center gap-1">&#128197; Updated</span>
            <span className="flex items-center gap-1">&#9881; Action</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : !dbItems || dbItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No slideshows configured yet
            </div>
          ) : (
            <div className="space-y-1">
              {dbItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-5 gap-4 items-center rounded-lg border border-border px-4 py-3 text-sm"
                >
                  <span className="text-white font-mono">{item.position}</span>
                  <span className="text-white font-semibold">{item.casino_name}</span>
                  <span className="text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="text-slate-400">{new Date(item.updated_at).toLocaleDateString()}</span>
                  <div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleDeleteSlide(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
