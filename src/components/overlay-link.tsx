"use client";

import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverlayLinkProps {
  url: string;
}

export function OverlayLink({ url }: OverlayLinkProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-500 truncate font-mono">
        {url}
      </div>
      <Button
        size="icon"
        onClick={() => navigator.clipboard.writeText(url)}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() => window.open(url, "_blank")}
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
}
