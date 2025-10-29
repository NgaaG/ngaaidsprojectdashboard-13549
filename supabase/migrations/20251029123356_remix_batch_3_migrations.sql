
-- Migration: 20251029104656
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  completion INTEGER DEFAULT 0,
  competency TEXT NOT NULL,
  visual_url TEXT,
  last_reflection_mood TEXT,
  figma_link TEXT,
  github_link TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create reflections table
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mood TEXT NOT NULL,
  emotional_dump TEXT,
  thoughts_what_i_think TEXT,
  thoughts_what_is_true TEXT,
  contingency_plan TEXT,
  todo_list JSONB DEFAULT '[]'::jsonb,
  progress INTEGER DEFAULT 0,
  sentiment INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections"
  ON public.reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections"
  ON public.reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
  ON public.reflections FOR DELETE
  USING (auth.uid() = user_id);

-- Create mentor_logs table
CREATE TABLE public.mentor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  key_goals TEXT,
  outcomes TEXT,
  competency TEXT NOT NULL,
  evidence_images JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mentor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mentor logs"
  ON public.mentor_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared mentor logs"
  ON public.mentor_logs FOR SELECT
  USING (is_public = true AND share_token IS NOT NULL);

CREATE POLICY "Users can create their own mentor logs"
  ON public.mentor_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor logs"
  ON public.mentor_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mentor logs"
  ON public.mentor_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create competency_progress table
CREATE TABLE public.competency_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  research INTEGER DEFAULT 0,
  create_score INTEGER DEFAULT 0,
  organize INTEGER DEFAULT 0,
  communicate INTEGER DEFAULT 0,
  learn INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.competency_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own competency progress"
  ON public.competency_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own competency progress"
  ON public.competency_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competency progress"
  ON public.competency_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true);

-- Storage policies for project files
CREATE POLICY "Users can upload their own project files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own project files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view project files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files');

CREATE POLICY "Users can delete their own project files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_logs_updated_at
  BEFORE UPDATE ON public.mentor_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competency_progress_updated_at
  BEFORE UPDATE ON public.competency_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251029104736
-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Migration: 20251029110025
-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

DROP POLICY IF EXISTS "Users can view their own reflections" ON public.reflections;
DROP POLICY IF EXISTS "Users can create their own reflections" ON public.reflections;
DROP POLICY IF EXISTS "Users can delete their own reflections" ON public.reflections;

DROP POLICY IF EXISTS "Users can view their own mentor logs" ON public.mentor_logs;
DROP POLICY IF EXISTS "Users can create their own mentor logs" ON public.mentor_logs;
DROP POLICY IF EXISTS "Users can update their own mentor logs" ON public.mentor_logs;
DROP POLICY IF EXISTS "Users can delete their own mentor logs" ON public.mentor_logs;
DROP POLICY IF EXISTS "Public can view shared mentor logs" ON public.mentor_logs;

DROP POLICY IF EXISTS "Users can view their own competency progress" ON public.competency_progress;
DROP POLICY IF EXISTS "Users can insert their own competency progress" ON public.competency_progress;
DROP POLICY IF EXISTS "Users can update their own competency progress" ON public.competency_progress;

-- Create public access policies
CREATE POLICY "Public can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public can view all projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public can insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Public can delete projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Public can view all reflections" ON public.reflections FOR SELECT USING (true);
CREATE POLICY "Public can insert reflections" ON public.reflections FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete reflections" ON public.reflections FOR DELETE USING (true);

CREATE POLICY "Public can view all mentor logs" ON public.mentor_logs FOR SELECT USING (true);
CREATE POLICY "Public can insert mentor logs" ON public.mentor_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update mentor logs" ON public.mentor_logs FOR UPDATE USING (true);
CREATE POLICY "Public can delete mentor logs" ON public.mentor_logs FOR DELETE USING (true);

CREATE POLICY "Public can view all competency progress" ON public.competency_progress FOR SELECT USING (true);
CREATE POLICY "Public can insert competency progress" ON public.competency_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update competency progress" ON public.competency_progress FOR UPDATE USING (true);

-- Update storage policies for public access
DROP POLICY IF EXISTS "Users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project files" ON storage.objects;

CREATE POLICY "Public can upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Public can view files" ON storage.objects FOR SELECT USING (bucket_id = 'project-files');
CREATE POLICY "Public can delete files" ON storage.objects FOR DELETE USING (bucket_id = 'project-files');

-- Make user_id nullable since we won't have authenticated users
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.projects ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.reflections ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.mentor_logs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.competency_progress ALTER COLUMN user_id DROP NOT NULL;
