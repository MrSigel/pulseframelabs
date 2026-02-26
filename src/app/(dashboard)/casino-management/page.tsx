"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CasinoManagementPage() {
  return (
    <div>
      <PageHeader
        title="Casino Management"
        actions={
          <Button variant="success" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Casino
          </Button>
        }
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl mb-4">&#127183;</span>
          <h2 className="text-xl font-bold text-white mb-2">Casino Management</h2>
          <p className="text-slate-500 text-center max-w-md">
            Manage your casino configurations. Add, edit, or remove casinos from your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
