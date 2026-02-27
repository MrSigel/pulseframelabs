"use client";

import { useState, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings2, Loader2, X, ToggleLeft, ToggleRight } from "lucide-react";
import { moderators as moderatorsDb } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import type { Moderator } from "@/lib/supabase/types";

export default function ModeratorsPage() {
  const [adding, setAdding] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const { data: dbModerators, loading, refetch } = useDbQuery<Moderator[]>(
    () => moderatorsDb.list(),
    [],
  );

  const activeMods = (dbModerators ?? []).filter(m => m.status === 'active');
  const inactiveMods = (dbModerators ?? []).filter(m => m.status === 'inactive');

  async function handleAddModerator() {
    const email = emailRef.current?.value;
    if (!email?.trim()) return;
    setAdding(true);
    try {
      await moderatorsDb.create({ moderator_email: email.trim() });
      await refetch();
      if (emailRef.current) emailRef.current.value = "";
    } catch (err) {
      console.error("Failed to add moderator:", err);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    try {
      await moderatorsDb.update(id, {
        status: currentStatus === 'active' ? 'inactive' : 'active',
      });
      await refetch();
    } catch (err) {
      console.error("Failed to update moderator:", err);
    }
  }

  async function handleRemoveModerator(id: string) {
    try {
      await moderatorsDb.remove(id);
      await refetch();
    } catch (err) {
      console.error("Failed to remove:", err);
    }
  }

  return (
    <div>
      <PageHeader title="Moderator Management" />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">Management</CardTitle>
          <Separator className="bg-border" />
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Add moderator */}
          <div>
            <p className="text-sm text-blue-400 font-semibold mb-2">
              Add or find a moderator
            </p>
            <div className="flex gap-2">
              <Input
                ref={emailRef}
                placeholder="Enter user's full email address..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddModerator();
                }}
              />
              <Button
                onClick={handleAddModerator}
                disabled={adding}
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>

          {/* Active Team */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white">Active Team</h3>
                <p className="text-sm text-blue-400">
                  These moderators can use their permissions.
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Settings2 className="h-3.5 w-3.5" />
                Presets
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              </div>
            ) : activeMods.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No active moderators.
              </div>
            ) : (
              <div className="space-y-2">
                {activeMods.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                  >
                    <span className="text-sm text-white">{mod.moderator_email}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleToggleStatus(mod.id, mod.status)}
                      >
                        <ToggleRight className="h-3.5 w-3.5" />
                        Deactivate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleRemoveModerator(mod.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inactive Team */}
          <div>
            <h3 className="font-bold text-white mb-1">Inactive Team</h3>
            <p className="text-sm text-blue-400 mb-3">
              These moderators currently have no permissions.
            </p>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              </div>
            ) : inactiveMods.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No inactive moderators.
              </div>
            ) : (
              <div className="space-y-2">
                {inactiveMods.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                  >
                    <span className="text-sm text-slate-400">{mod.moderator_email}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleToggleStatus(mod.id, mod.status)}
                      >
                        <ToggleLeft className="h-3.5 w-3.5" />
                        Activate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleRemoveModerator(mod.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
