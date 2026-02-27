"use client";

import { useSubscription } from "@/contexts/SubscriptionContext";

export function useFeatureGate() {
  const { hasActiveSubscription, isLoading, subscription } = useSubscription();

  return {
    /** User can view all pages (read-only) */
    canView: true,
    /** User can create/edit/delete data, use overlays */
    canModify: hasActiveSubscription,
    /** Show upgrade prompt */
    showUpgradePrompt: !hasActiveSubscription && !isLoading,
    /** Subscription info */
    subscription,
    isLoading,
  };
}
