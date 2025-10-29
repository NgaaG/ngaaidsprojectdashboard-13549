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