"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Wallet, UserSubscription } from "@/lib/supabase/types";

interface SubscriptionContextValue {
  wallet: Wallet | null;
  subscription: (UserSubscription & { packages?: Record<string, unknown> }) | null;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  wallet: null,
  subscription: null,
  hasActiveSubscription: false,
  isLoading: true,
  refetch: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionContextValue["subscription"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setSubscription(data.subscription);
        // Extract user_id from wallet for realtime filter
        if (data.wallet?.user_id) {
          setUserId(data.wallet.user_id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for realtime wallet updates (scoped to current user)
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("wallet-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallets", filter: `user_id=eq.${userId}` },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_subscriptions", filter: `user_id=eq.${userId}` },
        () => fetchData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, userId]);

  const hasActiveSubscription = useMemo(
    () =>
      Boolean(
        subscription &&
        subscription.status === "active" &&
        new Date(subscription.expires_at) > new Date()
      ),
    [subscription]
  );

  return (
    <SubscriptionContext.Provider value={{ wallet, subscription, hasActiveSubscription, isLoading, refetch: fetchData }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
