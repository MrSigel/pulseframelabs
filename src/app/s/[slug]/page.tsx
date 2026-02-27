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

  return <StreamerPageClient page={page} />;
}
