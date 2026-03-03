import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StreamerPageClient } from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("streamer_page_settings")
    .select("display_name, bio")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!data) return { title: "Not Found" };

  return {
    title: `${data.display_name} — Pulseframelabs`,
    description: data.bio || `${data.display_name}'s streamer page on Pulseframelabs`,
  };
}

export default async function StreamerPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("streamer_page_settings")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!page) notFound();

  // Fetch casino deals for this streamer
  const { data: deals } = await supabase
    .from("casino_deals")
    .select("*")
    .eq("user_id", page.user_id)
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  // Fetch store items for this streamer
  const { data: storeItems } = await supabase
    .from("store_items")
    .select("*")
    .eq("user_id", page.user_id)
    .eq("visible", true)
    .order("created_at", { ascending: false });

  // Fetch store settings
  const { data: storeSettings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("user_id", page.user_id)
    .maybeSingle();

  return (
    <StreamerPageClient
      page={page}
      deals={deals ?? []}
      storeItems={storeItems ?? []}
      storeSettings={storeSettings}
    />
  );
}
