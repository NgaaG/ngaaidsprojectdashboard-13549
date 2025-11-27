-- Add UPDATE policy for reflections table
CREATE POLICY "Public can update reflections" 
ON public.reflections 
FOR UPDATE 
USING (true);