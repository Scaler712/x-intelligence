-- Initial database schema for X Intelligence SaaS
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
-- Note: Supabase Auth automatically creates auth.users table
-- This table stores additional user profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scrapes table
CREATE TABLE IF NOT EXISTS public.scrapes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  stats JSONB DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  cloud_storage_path TEXT,
  csv_filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tweets table
CREATE TABLE IF NOT EXISTS public.tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrape_id UUID NOT NULL REFERENCES public.scrapes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights table (cached AI analysis results)
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrape_id UUID NOT NULL REFERENCES public.scrapes(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai' or 'anthropic'
  insights JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scrape_id, provider)
);

-- User API Keys table (encrypted storage)
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai' or 'anthropic'
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Exports table (export history)
CREATE TABLE IF NOT EXISTS public.exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scrape_id UUID REFERENCES public.scrapes(id) ON DELETE SET NULL,
  format TEXT NOT NULL, -- 'pdf' or 'excel'
  cloud_path TEXT,
  file_size INTEGER,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scrapes_user_id ON public.scrapes(user_id);
CREATE INDEX IF NOT EXISTS idx_scrapes_created_at ON public.scrapes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tweets_scrape_id ON public.tweets(scrape_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_scrape_id ON public.ai_insights(scrape_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON public.user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_user_id ON public.exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_created_at ON public.exports(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Scrapes policies
CREATE POLICY "Users can view own scrapes"
  ON public.scrapes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scrapes"
  ON public.scrapes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scrapes"
  ON public.scrapes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scrapes"
  ON public.scrapes FOR DELETE
  USING (auth.uid() = user_id);

-- Tweets policies (inherited via scrape ownership)
CREATE POLICY "Users can view tweets from own scrapes"
  ON public.tweets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scrapes
      WHERE scrapes.id = tweets.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tweets to own scrapes"
  ON public.tweets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scrapes
      WHERE scrapes.id = tweets.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tweets from own scrapes"
  ON public.tweets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.scrapes
      WHERE scrapes.id = tweets.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- AI Insights policies
CREATE POLICY "Users can view insights from own scrapes"
  ON public.ai_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert insights to own scrapes"
  ON public.ai_insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update insights in own scrapes"
  ON public.ai_insights FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- User API Keys policies
CREATE POLICY "Users can view own API keys"
  ON public.user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON public.user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON public.user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON public.user_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Exports policies
CREATE POLICY "Users can view own exports"
  ON public.exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports"
  ON public.exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exports"
  ON public.exports FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

