"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Plus, Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

interface DataTablePageProps {
  title: string;
  overlayLabel?: string;
  createLabel?: string;
  searchPlaceholder?: string;
  columns?: string[];
}

export function DataTablePage({
  title,
  overlayLabel = `${title} Overlay`,
  createLabel = `Create ${title.replace(/s$/, "")}`,
  searchPlaceholder = `Search for ${title.replace(/s$/, "")}`,
  columns = [title.replace(/s$/, "")],
}: DataTablePageProps) {
  return (
    <div>
      <PageHeader
        title={title}
        actions={
          <>
            <Button variant="success" className="gap-2">
              <Monitor className="h-4 w-4" />
              {overlayLabel}
            </Button>
            <Button variant="warning" className="gap-2">
              <Plus className="h-4 w-4" />
              {createLabel}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">{title}</CardTitle>
          <div className="relative">
            <Input
              placeholder={searchPlaceholder}
              className="w-64 pr-8"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Column tabs */}
          <div className="flex gap-2 mb-6">
            {columns.map((col) => (
              <div
                key={col}
                className="px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-slate-400"
              >
                {col}
              </div>
            ))}
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Inbox className="h-10 w-10 mb-3 text-slate-600" />
            <p className="text-sm">No data available in table</p>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-600">Showing no records</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon-sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
