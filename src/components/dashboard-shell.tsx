"use client";

import { useState, useEffect, type ReactNode } from "react";
import { DashboardProviders } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { TwitchBotProvider } from "@/contexts/TwitchBotContext";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import AnimatedBackground3D from "@/components/landing/background/AnimatedBackground3D";

const ANIM_KEY = "pfl-bg-animation";

function DashboardInner({ children }: { children: ReactNode }) {
  const [animEnabled, setAnimEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ANIM_KEY);
    if (stored === "true") setAnimEnabled(true);
  }, []);

  function toggleAnimation() {
    const next = !animEnabled;
    setAnimEnabled(next);
    localStorage.setItem(ANIM_KEY, String(next));
  }

  return (
    <TwitchBotProvider>
      <div className="flex min-h-screen bg-background">
        {/* Animated particle background — only if user enabled */}
        {animEnabled && <AnimatedBackground3D />}

        {/* Subtle noise texture overlay */}
        <div className="fixed inset-0 pointer-events-none bg-noise opacity-[0.025] z-[1]" />

        <Sidebar />

        <div className="relative z-[2] flex-1 ml-56 flex flex-col min-h-screen">
          <Header animEnabled={animEnabled} onToggleAnimation={toggleAnimation} />
          <main className="flex-1 p-6">
            <UpgradeBanner />
            {children}
          </main>
          <footer className="relative flex items-center justify-center border-t border-border px-6 py-4 text-xs">
            <span className="text-muted-foreground">
              2026&copy;{" "}
              <span className="text-foreground/70 font-medium">Pulseframelabs</span>
            </span>
          </footer>
        </div>

        {/* First-login onboarding wizard */}
        <OnboardingWizard />
      </div>
    </TwitchBotProvider>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardInner>{children}</DashboardInner>
    </DashboardProviders>
  );
}
