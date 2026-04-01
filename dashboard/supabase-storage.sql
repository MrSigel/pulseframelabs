-- ═══════════════════════════════════════════════════════════════════════
-- Pulseframelabs — Storage Bucket for Store Item Images
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- Create a public bucket for store images
insert into storage.buckets (id, name, public) values ('store-images', 'store-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Auth users upload" on storage.objects for insert
  to authenticated with check (bucket_id = 'store-images');

-- Allow authenticated users to delete their own uploads
create policy "Auth users delete" on storage.objects for delete
  to authenticated using (bucket_id = 'store-images');

-- Public read for everyone
create policy "Public read" on storage.objects for select
  using (bucket_id = 'store-images');
