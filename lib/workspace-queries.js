'use client'

// Supabase reads/writes for the signed-in workspace. Same tables, columns and
// filters the app already used (profiles.plan, sites, pageviews, events,
// /api/active-count); what's new is paging through rows so a busy site isn't
// cut off at PostgREST's 1,000-row default, and head-only counts for totals.
// TODO: at real scale these per-range aggregations belong in a Postgres RPC/view.

import { supabase } from './supabase'
import { SITE_COLORS, cleanDomain, monogramFor } from './analytics'

const PAGE_SIZE = 1000
const MAX_ROWS = 200000

// buildQuery MUST sort newest-first. A site busy enough to hit MAX_ROWS then loses
// its oldest rows instead of today's -- the opposite way round, the dashboard would
// quietly stop at whatever happened 200k pageviews ago and look broken. The array is
// flipped back to oldest-first at the end because every caller charts it that way.
export async function fetchAllRows(buildQuery) {
  const rows = []
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...(data || []))
    if (!data || data.length < PAGE_SIZE) break
  }
  return rows.reverse()
}

export async function countPageviews(siteIds, { since = null, until = null } = {}) {
  let query = supabase.from('pageviews').select('id', { count: 'exact', head: true })
  query = Array.isArray(siteIds) ? query.in('site_id', siteIds) : query.eq('site_id', siteIds)
  if (since) query = query.gte('created_at', since.toISOString())
  if (until) query = query.lt('created_at', until.toISOString())
  const { count, error } = await query
  if (error) throw error
  return count || 0
}

export async function loadProfilePlan(userId) {
  const { data } = await supabase.from('profiles').select('plan').eq('id', userId).maybeSingle()
  return data?.plan || 'free'
}

// Sites newest-first (as the dashboard always listed them); colours are assigned
// oldest-first so a site keeps its colour when new ones are added.
export async function loadSites(userId) {
  const { data } = await supabase.from('sites').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  const rows = data || []
  const byAge = [...rows].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
  return rows.map((row) => toSite(row, byAge.findIndex((item) => item.id === row.id)))
}

export function toSite(row, index = 0, tracking = null) {
  return {
    id: row.id,
    name: row.name,
    domain: cleanDomain(row.domain),
    monogram: monogramFor(row.name),
    color: SITE_COLORS[Math.max(0, index) % SITE_COLORS.length],
    shared: !!row.public_enabled,
    passwordEnabled: !!row.share_password,
    tracking,
    createdAt: row.created_at,
  }
}

export async function fetchSitePageviews(siteId, since) {
  return fetchAllRows(() => {
    let query = supabase.from('pageviews').select('id, page_url, referrer, device_type, created_at').eq('site_id', siteId)
    if (since) query = query.gte('created_at', since.toISOString())
    return query.order('created_at', { ascending: false }).order('id', { ascending: false })
  })
}

export async function fetchPageviewTimes(siteIds, since, until = null) {
  return fetchAllRows(() => {
    let query = supabase.from('pageviews').select('id, site_id, created_at')
    query = Array.isArray(siteIds) ? query.in('site_id', siteIds) : query.eq('site_id', siteIds)
    if (since) query = query.gte('created_at', since.toISOString())
    if (until) query = query.lt('created_at', until.toISOString())
    return query.order('created_at', { ascending: false }).order('id', { ascending: false })
  })
}

export async function fetchSiteEvents(siteId, since) {
  return fetchAllRows(() => {
    let query = supabase.from('events').select('event_name, created_at').eq('site_id', siteId)
    if (since) query = query.gte('created_at', since.toISOString())
    return query.order('created_at', { ascending: false })
  })
}

// Existing endpoint (service role, heartbeats in the last 5 minutes).
export async function fetchActiveCount(siteId) {
  try {
    const response = await fetch(`/api/active-count?site_id=${encodeURIComponent(siteId)}`)
    const body = await response.json()
    return typeof body.active === 'number' ? body.active : null
  } catch {
    return null
  }
}
