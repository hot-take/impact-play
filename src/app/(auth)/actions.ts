'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const charity_id = formData.get('charity_id') as string
  if (!charity_id) {
    redirect('/signup?error=Please select a charity to support')
  }
  const contribution_pct = parseInt(formData.get('contribution_pct') as string, 10) || 10

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      data: {
        charity_id,
        contribution_pct
      }
    }
  })

  if (error) {
    console.error('Signup Error:', error)
    redirect(`/signup?error=${encodeURIComponent(error.message || 'Could not create user')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
