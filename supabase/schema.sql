-- Digital Heroes - Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Charities Table
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles Table (extends Supabase Auth Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    selected_charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    charity_contribution_pct INTEGER DEFAULT 10 CHECK (charity_contribution_pct >= 10),
    subscription_status TEXT DEFAULT 'inactive',
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Scores Table
-- Requirements: max 5 per user, 1 per date, range 1-45 (Stableford)
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    play_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, play_date) -- Only one score per date per user
);

-- Function and Trigger to keep only the latest 5 scores per user
CREATE OR REPLACE FUNCTION maintain_five_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the oldest scores if the user now has more than 5
    DELETE FROM public.scores
    WHERE id IN (
        SELECT id FROM public.scores
        WHERE user_id = NEW.user_id
        ORDER BY play_date DESC, created_at DESC
        OFFSET 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maintain_five_scores
AFTER INSERT OR UPDATE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION maintain_five_scores();

-- 4. Draws Table
CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_month DATE NOT NULL,
    winning_numbers INTEGER[] DEFAULT '{}',
    jackpot_rollover DECIMAL DEFAULT 0,
    status TEXT CHECK (status IN ('simulated', 'published')) DEFAULT 'simulated',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Draw Entries / Winners Table
CREATE TABLE public.draw_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_count INTEGER CHECK (match_count IN (3, 4, 5)),
    prize_amount DECIMAL NOT NULL,
    status TEXT CHECK (status IN ('pending_proof', 'verified', 'paid', 'rejected')) DEFAULT 'pending_proof',
    proof_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Profiles: Users can view and update their own profile. Admins can do all.
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Scores: Users can manage their own scores.
CREATE POLICY "Users can manage their own scores." ON public.scores FOR ALL USING (auth.uid() = user_id);

-- Charities: Anyone can view.
CREATE POLICY "Anyone can view charities." ON public.charities FOR SELECT USING (true);

-- Draws: Anyone can view published draws.
CREATE POLICY "Anyone can view published draws." ON public.draws FOR SELECT USING (status = 'published');

-- Draw Entries: Users can view their own, and update proof_image_url
CREATE POLICY "Users can view their own draw entries." ON public.draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own proof image." ON public.draw_entries FOR UPDATE USING (auth.uid() = user_id);

-- NOTE: Full Admin policies would be added here to allow admins full CRUD access on all tables.

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, selected_charity_id, charity_contribution_pct)
  VALUES (
    new.id,
    (new.raw_user_meta_data->>'charity_id')::uuid,
    COALESCE((new.raw_user_meta_data->>'contribution_pct')::int, 10)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
