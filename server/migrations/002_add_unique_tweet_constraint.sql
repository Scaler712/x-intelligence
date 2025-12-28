-- Add unique constraint to prevent duplicate tweets per scrape
-- This ensures that the same tweet (content + date) can't be inserted twice for the same scrape

-- First, remove any existing duplicates (keep the one with highest engagement)
WITH ranked_tweets AS (
  SELECT 
    id,
    scrape_id,
    content,
    date,
    (likes + retweets + comments) as engagement,
    ROW_NUMBER() OVER (
      PARTITION BY scrape_id, content, date 
      ORDER BY (likes + retweets + comments) DESC, created_at DESC
    ) as rn
  FROM public.tweets
)
DELETE FROM public.tweets
WHERE id IN (
  SELECT id FROM ranked_tweets WHERE rn > 1
);

-- Add unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS unique_tweet_per_scrape 
ON public.tweets(scrape_id, content, date);

