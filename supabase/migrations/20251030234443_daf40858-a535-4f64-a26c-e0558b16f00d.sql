-- Add achieved_goals column to mentor_logs table to track which key goals were achieved
ALTER TABLE public.mentor_logs 
ADD COLUMN achieved_goals text[];

COMMENT ON COLUMN public.mentor_logs.achieved_goals IS 'Array of goal text that was achieved during the session';