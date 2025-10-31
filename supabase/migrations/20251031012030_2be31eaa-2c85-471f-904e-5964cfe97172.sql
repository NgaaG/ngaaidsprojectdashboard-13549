-- Change project_id to project_ids array to support multiple projects per mentor log
ALTER TABLE public.mentor_logs 
  DROP COLUMN IF EXISTS project_id;

ALTER TABLE public.mentor_logs 
  ADD COLUMN project_ids uuid[] DEFAULT NULL;