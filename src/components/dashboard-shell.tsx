"use client";

import { type ReactNode, useEffect } from "react";
import { DashboardProviders } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import AnimatedBackground3D from "@/components/landing/background/AnimatedBackground3D";
import LanguageWidget from "@/components/landing/ui/LanguageWidget";

function useConsoleMessage() {
  useEffect(() => {
    const gold = "#c9a84c";
    const dark = "#09090b";

    console.log(
      `%c\n  PULSEFRAME LABS  \n`,
      `background: linear-gradient(135deg, ${gold}, #e2cc7e); color: ${dark}; font-size: 24px; font-weight: 900; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);`
    );
    console.log(
      `%c  2026 Pulseframelabs — All rights reserved.  `,
      `color: ${gold}; font-size: 12px; font-weight: 600; padding: 4px 0; letter-spacing: 1px;`
    );
    console.log(
      `%c  Stream Like a High Roller  `,
      `color: #888; font-size: 11px; font-style: italic; padding: 2px 0;`
    );
    console.log(
      `%c  https://pulseframelabs.onrender.com  `,
      `color: #666; font-size: 10px; padding: 2px 0;`
    );
  }, []);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  useConsoleMessage();

  return (
    <DashboardProviders>
      <div className="flex min-h-screen bg-background">
        {/* Animated particle background (same as landing page) */}
        <AnimatedBackground3D />

        {/* Subtle noise texture overlay */}
        <div className="fixed inset-0 pointer-events-none bg-noise opacity-[0.025] z-[1]" />

        <Sidebar />

        <div className="relative z-[2] flex-1 ml-56 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6">{children}</main>
          <footer className="relative flex items-center justify-center border-t border-border px-6 py-4 text-xs">
            <span className="text-muted-foreground">
              2026&copy;{" "}
              <span className="text-foreground/70 font-medium">Pulseframelabs</span>
            </span>
          </footer>
        </div>

        {/* Language widget (bottom-right, above z-index of content) */}
        <LanguageWidget />
      </div>
    </DashboardProviders>
  );
}
