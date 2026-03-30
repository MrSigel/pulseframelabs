import { supabase } from './supabase'

// ── Helper: get current user ID ─────────────────────────────────────────
async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

// ── Array tables (rows with id + data JSONB) ────────────────────────────

export async function getAll(table) {
  const userId = await getUserId()
  if (!userId) return []
  const { data, error } = await supabase.from(table).select('*')
    .eq('user_id', userId).order('created_at', { ascending: true })
  if (error) { console.error('getAll error:', table, error); return [] }
  return (data ?? []).map(row => ({ ...row.data, id: row.id, created_at: row.created_at }))
}

export async function getAllPublic(table, userId) {
  if (!userId) return []
  const { data, error } = await supabase.from(table).select('*')
    .eq('user_id', userId).order('created_at', { ascending: true })
  if (error) { console.error('getAllPublic error:', table, error); return [] }
  return (data ?? []).map(row => ({ ...row.data, id: row.id, created_at: row.created_at }))
}

export async function insert(table, row) {
  const userId = await getUserId()
  if (!userId) return null
  const { id, created_at, ...rest } = row
  const { data, error } = await supabase.from(table)
    .insert({ user_id: userId, data: rest }).select().single()
  if (error) { console.error('insert error:', table, error); return null }
  return { ...data.data, id: data.id, created_at: data.created_at }
}

export async function update(table, id, changes) {
  // Read current row, merge changes into data JSONB
  const { data: existing } = await supabase.from(table).select('data').eq('id', id).single()
  if (!existing) return
  const merged = { ...existing.data, ...changes }
  const { error } = await supabase.from(table).update({ data: merged }).eq('id', id)
  if (error) console.error('update error:', table, error)
}

export async function remove(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.error('remove error:', table, error)
}

export async function removeWhere(table, field, value) {
  // Need to fetch and filter since field is inside JSONB data
  const userId = await getUserId()
  if (!userId) return
  const { data } = await supabase.from(table).select('id, data').eq('user_id', userId)
  if (!data) return
  const toDelete = data.filter(row => row.data?.[field] === value)
  for (const row of toDelete) {
    await supabase.from(table).delete().eq('id', row.id)
  }
}

export async function clearTable(table) {
  const userId = await getUserId()
  if (!userId) return
  const { error } = await supabase.from(table).delete().eq('user_id', userId)
  if (error) console.error('clearTable error:', table, error)
}

// ── Singleton key-value (user_settings) ─────────────────────────────────

export async function getOne(key) {
  const userId = await getUserId()
  if (!userId) return null
  const { data, error } = await supabase.from('user_settings')
    .select('value').eq('user_id', userId).eq('key', key).single()
  if (error && error.code !== 'PGRST116') console.error('getOne error:', key, error)
  return data?.value ?? null
}

export async function getOnePublic(key, userId) {
  if (!userId) return null
  const { data } = await supabase.from('user_settings')
    .select('value').eq('user_id', userId).eq('key', key).single()
  return data?.value ?? null
}

export async function setOne(key, val) {
  const userId = await getUserId()
  if (!userId) return
  const { error } = await supabase.from('user_settings').upsert(
    { user_id: userId, key, value: val, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,key' }
  )
  if (error) console.error('setOne error:', key, error)
}

// ── Realtime subscriptions ──────────────────────────────────────────────

export function onTableChange(table, cb) {
  const channel = supabase.channel(`rt-${table}-${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => cb())
    .subscribe()
  return () => supabase.removeChannel(channel)
}
