"use client";

import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useRouter } from "next/navigation";
import { Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function UpgradeBanner() {
  const { showUpgradePrompt } = useFeatureGate();
  const router = useRouter();
  const { t } = useLanguage();

  if (!showUpgradePrompt) return null;

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
          <Lock className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {t.wallet?.readOnlyMode || "Read-Only Mode"}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.wallet?.readOnlyDesc || "You are in analyze-only mode. Purchase a package to unlock all features."}
          </p>
        </div>
      </div>
      <Button onClick={() => router.push("/wallet")} className="gap-2">
        <CreditCard className="h-4 w-4" />
        {t.wallet?.getCredits || "Get Credits"}
      </Button>
    </div>
  );
}
