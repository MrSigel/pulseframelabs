"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useAuthUid } from "@/hooks/useAuthUid";

const LiveChatWidget = dynamic(() => import("./LiveChatWidget"), { ssr: false });

/** Renders the chat widget only for logged-in users, not on overlay pages */
export default function LiveChatLoader() {
  const pathname = usePathname();
  const uid = useAuthUid();

  // Don't show chat on overlay pages (embedded in OBS)
  if (pathname.startsWith("/overlay")) return null;

  // Only show chat when logged in
  if (!uid) return null;

  return <LiveChatWidget userId={uid} />;
}
