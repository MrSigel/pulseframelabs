"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const LiveChatWidget = dynamic(() => import("./LiveChatWidget"), { ssr: false });

/** Renders the chat widget on all pages except /overlay/* routes */
export default function LiveChatLoader() {
  const pathname = usePathname();

  // Don't show chat on overlay pages (embedded in OBS)
  if (pathname.startsWith("/overlay")) return null;

  return <LiveChatWidget />;
}
