"use client";

import { Copy, ExternalLink, Monitor, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useRouter } from "next/navigation";

interface OverlayLinkProps {
  url: string;
  /** Recommended OBS Browser Source size, e.g. "400 × 200" */
  obsSize?: string;
}

export function OverlayLink({ url, obsSize }: OverlayLinkProps) {
  const { canModify } = useFeatureGate();
  const router = useRouter();

  if (!canModify) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">
              Subscribe to unlock overlay URL
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/wallet")}
          >
            Upgrade
          </Button>
        </div>
        {obsSize && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Monitor className="h-3 w-3" />
            <span>OBS Size: <span className="font-semibold text-foreground/70">{obsSize}</span></span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
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
      {obsSize && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Monitor className="h-3 w-3" />
          <span>OBS Size: <span className="font-semibold text-foreground/70">{obsSize}</span></span>
        </div>
      )}
    </div>
  );
}
