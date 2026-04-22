import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    if (!sig || !webhookSecret) return new Response('Webhook secret not found', { status: 400 })
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook Error: ${errorMsg}`)
    return new Response(`Webhook Error: ${errorMsg}`, { status: 400 })
  }

  // Use the admin service role to bypass RLS when updating the subscription status
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Note: User needs to add this to .env.local
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId)
        }
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'inactive',
          })
          .eq('stripe_customer_id', customerId)
        break
      }
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (err) {
    console.error('Error processing webhook', err)
    return new Response('Webhook handler failed', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
