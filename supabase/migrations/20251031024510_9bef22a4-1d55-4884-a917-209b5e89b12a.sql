-- Add lecturer field to mentor_logs table
ALTER TABLE public.mentor_logs 
ADD COLUMN IF NOT EXISTS lecturer TEXT;

-- Add a comment to describe the field
COMMENT ON COLUMN public.mentor_logs.lecturer IS 'The lecturer/mentor for this consult log session';