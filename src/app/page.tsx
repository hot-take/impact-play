import { createClient } from '@/utils/supabase/server'
import HomeClient from './HomeClient'

export default async function Home() {
  const supabase = await createClient()

  // Fetch featured charities for the spotlight section
  const { data: featuredCharities } = await supabase
    .from('charities')
    .select('id, name, description, image_url')
    .eq('featured', true)
    .limit(3)

  return <HomeClient featuredCharities={featuredCharities || []} />
}
