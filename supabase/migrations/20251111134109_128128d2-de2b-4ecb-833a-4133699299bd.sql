-- Enable realtime for mentor_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_logs;

-- Add a table to track when student last viewed each mentor log
CREATE TABLE public.mentor_log_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_log_id uuid REFERENCES public.mentor_logs(id) ON DELETE CASCADE,
  last_viewed_at timestamp with time zone DEFAULT now(),
  UNIQUE(mentor_log_id)
);

ALTER TABLE public.mentor_log_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all mentor log views"
  ON public.mentor_log_views FOR SELECT
  USING (true);

CREATE POLICY "Public can insert mentor log views"
  ON public.mentor_log_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update mentor log views"
  ON public.mentor_log_views FOR UPDATE
  USING (true);