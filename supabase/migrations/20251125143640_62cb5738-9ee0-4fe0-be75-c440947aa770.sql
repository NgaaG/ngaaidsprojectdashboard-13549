-- Add audio_url column to reflections table
ALTER TABLE public.reflections
ADD COLUMN audio_url text;

-- Create storage bucket for audio reflections
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-reflections', 'audio-reflections', false);

-- RLS policies for audio-reflections bucket
CREATE POLICY "Public can upload audio reflections"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audio-reflections');

CREATE POLICY "Public can view own audio reflections"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-reflections');

CREATE POLICY "Public can delete own audio reflections"
ON storage.objects
FOR DELETE
USING (bucket_id = 'audio-reflections');