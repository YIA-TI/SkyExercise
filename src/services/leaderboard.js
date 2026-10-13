// src/services/leaderboard.js
// Strava data of one athlete may only be shown to that athlete, so members only ever
// get THEIR OWN standing (rank / total / value) — computed server-side by
// `my_leaderboard_standing`. Full ranked lists come from `admin_leaderboard` (admin only).
import { supabase } from '../lib/supabase.js'

// mode: 'running' (km) | 'effort' (points) | 'league' (XP). Week = Monday–Sunday (WIB).
// Returns { rank, total, value } or null when the athlete is not ranked yet.
export async function fetchMyStanding(mode, period = 'weekly') {
  const { data, error } = await supabase.rpc('my_leaderboard_standing', {
    p_mode: mode,
    p_period: period,
  })
  if (error) throw error
  const row = (data ?? [])[0]
  if (!row) return null
  return { rank: Number(row.out_rank), total: Number(row.out_total), value: Number(row.out_value) }
}

// Ranked list for members who joined the leaderboard (opt-in). The server returns nothing
// unless the caller joined, and only includes other members who joined. `rank` is the real
// position among all members (gaps = members who did not opt in).
export async function fetchMemberLeaderboard(mode, period = 'weekly') {
  const { data, error } = await supabase.rpc('member_leaderboard', {
    p_mode: mode,
    p_period: period,
  })
  if (error) throw error
  return (data ?? []).map((r) => ({
    rank: Number(r.out_rank),
    athleteId: r.out_athlete_id,
    name: r.out_name,
    avatar: r.out_photo,
    value: Number(r.out_value),
    isMe: r.out_is_me,
  }))
}

// Full ranked list for the admin dashboard (RPC is gated by is_admin()).
// Rows: { athleteId, name, avatar, value } — value is km for 'running', points for
// 'effort', XP for 'league'.
export async function fetchAdminLeaderboard(mode, period = 'weekly') {
  const { data, error } = await supabase.rpc('admin_leaderboard', {
    p_mode: mode,
    p_period: period,
  })
  if (error) throw error
  return (data ?? []).map((r) => ({
    athleteId: r.out_athlete_id,
    name: r.out_name,
    avatar: r.out_photo,
    value: Number(r.out_value),
  }))
}
