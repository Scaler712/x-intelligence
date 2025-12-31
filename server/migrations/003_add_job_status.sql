-- Add status and error tracking to scrapes table for background jobs
ALTER TABLE public.scrapes 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Index for querying pending/running jobs
CREATE INDEX IF NOT EXISTS idx_scrapes_status ON public.scrapes(status) WHERE status IN ('pending', 'running');
CREATE INDEX IF NOT EXISTS idx_scrapes_user_status ON public.scrapes(user_id, status) WHERE status IN ('pending', 'running');

-- Update existing scrapes to have 'completed' status
UPDATE public.scrapes SET status = 'completed' WHERE status IS NULL;

