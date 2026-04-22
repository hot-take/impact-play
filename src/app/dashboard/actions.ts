'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addScore(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
  if (profile?.subscription_status !== 'active') {
    return { error: 'Active subscription required' }
  }

  const score = parseInt(formData.get('score') as string, 10)
  const play_date = formData.get('play_date') as string

  if (score < 1 || score > 45) {
    return { error: 'Score must be between 1 and 45' }
  }

  // Attempt to insert the score. 
  // The database schema has a UNIQUE constraint on (user_id, play_date)
  // so if a score for that date exists, it will throw an error.
  const { error } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      score,
      play_date
    })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'A score for this date already exists. You can only edit or delete it.' }
    }
    return { error: 'Failed to add score: ' + error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteScore(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Failed to delete score' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function editScore(id: string, score: number) {
  const supabase = await createClient()

  if (score < 1 || score > 45) {
    return { error: 'Score must be between 1 and 45' }
  }

  const { error } = await supabase
    .from('scores')
    .update({ score })
    .eq('id', id)

  if (error) {
    return { error: 'Failed to update score' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function submitProof(entryId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('draw_entries')
    .update({ 
      proof_image_url: 'https://placeholder.com/mock-proof.png',
      status: 'verified'
    })
    .eq('id', entryId)

  if (error) {
    return { error: 'Failed to submit proof' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
