"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Plus } from "lucide-react";

export default function SlideshowPage() {
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
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Casino to Slideshow
            </Button>
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
          <div className="text-center py-12 text-slate-500 text-sm">
            No slideshows configured yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
