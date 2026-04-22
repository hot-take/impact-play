# ImpactPlay - Performance Tracking & Charitable Giving

ImpactPlay is a full-stack, subscription-driven web application that integrates golf performance tracking, charitable giving, and a monthly prize draw system.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) & [Framer Motion](https://www.framer.com/motion/)
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL, Auth, SSR)
- **Payments**: [Stripe](https://stripe.com)
- **Icons**: [Lucide React](https://lucide.dev)

## ✨ Core Features

- **Subscription-Driven Access**: Secure user authentication with mandatory charity selection.
- **Score Management**: Log, edit, and manage golf scores with a rolling 5-score limit.
- **Charity Integration**: Search and support charities, with a portion of every subscription going to a chosen cause.
- **Draw Engine**: Monthly prize draws with automated winner identification and prize pool logic.
- **Admin Dashboard**: Comprehensive tools for managing users, charities, draws, and winner verifications.
- **Modern UI**: A sleek, emotion-driven design focusing on glassmorphism and smooth animations.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed.
- A Supabase account and project.
- A Stripe account (for API keys).

### 2. Environment Variables
Rename `.env.local.example` to `.env.local` and populate with your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Database Setup
Execute the SQL script located at `supabase/schema.sql` in your Supabase SQL Editor. This will set up:
- Tables: `profiles`, `charities`, `scores`, `draws`, `draw_entries`.
- Triggers for automatic profile creation and score history maintenance.
- Row Level Security (RLS) policies.

### 4. Installation
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application in action.

---


