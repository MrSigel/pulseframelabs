"use client";

import { useEffect } from "react";

export function ConsoleBranding() {
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

  return null;
}
