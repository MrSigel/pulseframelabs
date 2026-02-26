"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings2 } from "lucide-react";

export default function ModeratorsPage() {
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
            <Input
              placeholder="Enter user's full email address..."
            />
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
            <div className="text-center py-8 text-slate-500 text-sm">
              No active moderators.
            </div>
          </div>

          {/* Inactive Team */}
          <div>
            <h3 className="font-bold text-white mb-1">Inactive Team</h3>
            <p className="text-sm text-blue-400 mb-3">
              These moderators currently have no permissions.
            </p>
            <div className="text-center py-8 text-slate-500 text-sm">
              No inactive moderators.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
