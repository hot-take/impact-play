'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendWinnerAlertEmail, sendDrawResultsEmail } from '@/utils/notifications'

// Note: In a real app, you should protect these routes by checking `profile.role === 'admin'`
// We are skipping that here for the sample assignment unless implemented in middleware.

export async function simulateDraw() {
  const supabase = await createAdminClient()

  // For this assignment, we use random generation (1 to 45, 5 numbers)
  const winningNumbers: number[] = []
  while (winningNumbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!winningNumbers.includes(num)) {
      winningNumbers.push(num)
    }
  }

  // Create a simulated draw
  const { error } = await supabase
    .from('draws')
    .insert({
      draw_month: new Date().toISOString().split('T')[0], // e.g., '2026-04-01'
      winning_numbers: winningNumbers,
      status: 'simulated'
    })

  if (error) {
    return { error: 'Failed to simulate draw: ' + error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function publishDraw(drawId: string) {
  const supabase = await createAdminClient()

  // 1. Fetch the draw details
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (drawError || !draw) return { error: 'Draw not found' }

  // 2. Fetch all active subscribers
  const { data: activeUsers, error: userError } = await supabase
    .from('profiles')
    .select('id, subscription_status')
    .eq('subscription_status', 'active')

  if (userError || !activeUsers) return { error: 'Failed to fetch active users' }

  // 3. Calculate Prize Pool
  // Assumption: $15 sub, $6 goes to pool (40%).
  // We also add any jackpot rollover from previous months.
  const poolPerUser = 6.00
  const totalPool = (activeUsers.length * poolPerUser) + Number(draw.jackpot_rollover || 0)

  const shares = {
    tier1: totalPool * 0.40, // 5 matches (Jackpot)
    tier2: totalPool * 0.35, // 4 matches
    tier3: totalPool * 0.25  // 3 matches
  }

  // 4. Identify Winners
  const winners = { tier1: [] as string[], tier2: [] as string[], tier3: [] as string[] }
  const winningSet = new Set(draw.winning_numbers)

  for (const user of activeUsers) {
    // Get latest 5 scores for this user
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', user.id)
      .order('play_date', { ascending: false })
      .limit(5)

    if (!scores || scores.length < 5) continue // Must have 5 scores to qualify

    const userScores = scores.map(s => s.score)
    const matches = userScores.filter(s => winningSet.has(s)).length

    if (matches === 5) winners.tier1.push(user.id)
    else if (matches === 4) winners.tier2.push(user.id)
    else if (matches === 3) winners.tier3.push(user.id)
  }

  // 5. Create Draw Entries & Distribute Prizes
  interface DrawEntry {
    draw_id: string
    user_id: string
    match_count: number
    prize_amount: number
    status: string
  }
  const entriesToInsert: DrawEntry[] = []

  // Tier 1 (Jackpot)
  if (winners.tier1.length > 0) {
    const prize = shares.tier1 / winners.tier1.length
    winners.tier1.forEach(uid => {
      entriesToInsert.push({ draw_id: drawId, user_id: uid, match_count: 5, prize_amount: prize, status: 'pending_proof' })
    })
  }

  // Tier 2
  if (winners.tier2.length > 0) {
    const prize = shares.tier2 / winners.tier2.length
    winners.tier2.forEach(uid => {
      entriesToInsert.push({ draw_id: drawId, user_id: uid, match_count: 4, prize_amount: prize, status: 'pending_proof' })
    })
  }

  // Tier 3
  if (winners.tier3.length > 0) {
    const prize = shares.tier3 / winners.tier3.length
    winners.tier3.forEach(uid => {
      entriesToInsert.push({ draw_id: drawId, user_id: uid, match_count: 3, prize_amount: prize, status: 'pending_proof' })
    })
  }

  if (entriesToInsert.length > 0) {
    const { data: insertedEntries } = await supabase
      .from('draw_entries')
      .insert(entriesToInsert)
      .select('user_id, prize_amount')

    // 5b. Send winner alert emails
    if (insertedEntries) {
      for (const entry of insertedEntries) {
        // In production, look up the email from auth.users.
        // Here we use the user_id as a stand-in since we don't have a service-role client.
        await sendWinnerAlertEmail(`user+${entry.user_id.substring(0, 8)}@impactplay.app`, entry.prize_amount)
      }
    }
  }

  // 6. Handle Rollover & Finalize
  let nextJackpot = 0
  if (winners.tier1.length === 0) {
    nextJackpot = shares.tier1 // Rollover Tier 1 share
  }

  // Mark current draw as published
  await supabase
    .from('draws')
    .update({
      status: 'published',
      jackpot_rollover: 0 // Consumed for this draw
    })
    .eq('id', drawId)

  // 7. Persist rollover to next month's draw (or update if it already exists)
  if (nextJackpot > 0) {
    const nextMonth = new Date(draw.draw_month)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const nextMonthStr = nextMonth.toISOString().split('T')[0]

    // Check if a draw for next month already exists (e.g., a simulation was already run)
    const { data: existingNextDraw } = await supabase
      .from('draws')
      .select('id, jackpot_rollover')
      .eq('draw_month', nextMonthStr)
      .single()

    if (existingNextDraw) {
      // Add to any existing rollover
      await supabase
        .from('draws')
        .update({ jackpot_rollover: Number(existingNextDraw.jackpot_rollover || 0) + nextJackpot })
        .eq('id', existingNextDraw.id)
    } else {
      // Create a placeholder draw record with the rollover
      await supabase.from('draws').insert({
        draw_month: nextMonthStr,
        winning_numbers: [],
        jackpot_rollover: nextJackpot,
        status: 'simulated'
      })
    }
  }

  // 8. Send draw result emails to all active subscribers
  const drawMonthLabel = new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  for (const u of activeUsers) {
    await sendDrawResultsEmail(`user+${u.id.substring(0, 8)}@impactplay.app`, drawMonthLabel)
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true, winnerCount: entriesToInsert.length, nextJackpot }
}

export async function verifyWinnerProof(entryId: string, action: 'approve' | 'reject') {
  const supabase = await createAdminClient()

  const status = action === 'approve' ? 'verified' : 'rejected'

  const { error } = await supabase
    .from('draw_entries')
    .update({ status })
    .eq('id', entryId)

  if (error) {
    return { error: 'Failed to update entry' }
  }

  revalidatePath('/admin')
  return { success: true }
}
