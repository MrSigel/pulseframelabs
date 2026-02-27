"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
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

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setSubscription(data.subscription);
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

  // Listen for realtime wallet updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("wallet-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallets" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_subscriptions" },
        () => fetchData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const hasActiveSubscription = Boolean(
    subscription &&
    subscription.status === "active" &&
    new Date(subscription.expires_at) > new Date()
  );

  return (
    <SubscriptionContext.Provider value={{ wallet, subscription, hasActiveSubscription, isLoading, refetch: fetchData }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
