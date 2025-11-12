-- Add not_covered_goals column to mentor_logs table
ALTER TABLE public.mentor_logs 
ADD COLUMN not_covered_goals JSONB DEFAULT NULL;