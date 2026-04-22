import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await req.json()

    // Note: In a real app, we'd verify the priceId matches our active plans.
    // We'd also check if the user already has an active subscription.

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/subscribe?canceled=true`,
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
