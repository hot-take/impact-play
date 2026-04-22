import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function run() {
  // Create regular test user
  await createAccount('test@example.com', 'password123', 'user', 'active')
  // Create admin test user
  await createAccount('admin@example.com', 'admin123', 'admin', 'active')
}

async function createAccount(email, password, role, subscription_status) {
  console.log(`Creating account: ${email} (${role})...`)

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      charity_id: '886f9c7f-771b-4199-8dcb-568d5a6a4636', 
      contribution_pct: 10
    }
  })

  let userId = authData?.user?.id

  if (authError) {
    if (authError.message.includes('already registered')) {
      const { data: users } = await supabase.auth.admin.listUsers()
      userId = users.users.find(u => u.email === email)?.id
    } else {
      console.error(`Error creating ${email}:`, authError.message)
    }
  }

  if (userId) {
    await updateProfile(userId, email, password, role, subscription_status)
  }
}

async function updateProfile(userId, email, password, role, subscription_status) {
  console.log(`Updating profile for ${email}...`)
  
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      subscription_status,
      role,
      selected_charity_id: '886f9c7f-771b-4199-8dcb-568d5a6a4636',
      charity_contribution_pct: 10
    })

  if (profileError) {
    console.error(`Error updating profile for ${email}:`, profileError.message)
  } else {
    console.log(`Successfully created/updated ${role} account!`)
    console.log('--- Credentials ---')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('---')
  }
}

run()
