// api/calculate-winner.js — Vercel Serverless Function
// Runs every Sunday 9am SGT (1am UTC) via cron

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Security: only cron job can call this
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorised' })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 1. Find this week's winner (most weekly_wins)
  const { data: winner, error } = await supabase
    .from('spots')
    .select('id, name, loc, weekly_wins')
    .order('weekly_wins', { ascending: false })
    .limit(1)
    .single()

  if (error || !winner || winner.weekly_wins === 0) {
    return res.status(200).json({ message: 'No votes this week, skipping' })
  }

  // 2. Deactivate last winner
  await supabase
    .from('weekly_winners')
    .update({ active: false })
    .eq('active', true)

  // 3. Write new winner (active: false — you flip to true after confirming offer)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)

  await supabase.from('weekly_winners').insert({
    spot_id: winner.id,
    week_start: weekStart.toISOString().split('T')[0],
    week_end: now.toISOString().split('T')[0],
    total_weekly_votes: winner.weekly_wins,
    active: false,
    discount_code: '',
    discount_desc: ''
  })

  // 4. Reset all weekly_wins
  await supabase.from('spots').update({ weekly_wins: 0 }).gte('id', 0)

  // 5. Send notification email via Supabase Edge Function (optional)
  console.log(`Winner calculated: ${winner.name} (${winner.weekly_wins} votes)`)

  return res.status(200).json({
    winner: winner.name,
    votes: winner.weekly_wins
  })
}
