-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can view their own learning goal entries" ON public.general_learning_goals_entries;
DROP POLICY IF EXISTS "Users can insert their own learning goal entries" ON public.general_learning_goals_entries;
DROP POLICY IF EXISTS "Users can update their own learning goal entries" ON public.general_learning_goals_entries;
DROP POLICY IF EXISTS "Users can delete their own learning goal entries" ON public.general_learning_goals_entries;

-- Create public access policies to match reflections table
CREATE POLICY "Public can view all learning goal entries"
  ON public.general_learning_goals_entries
  FOR SELECT
  USING (true);

CREATE POLICY "Public can insert learning goal entries"
  ON public.general_learning_goals_entries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update learning goal entries"
  ON public.general_learning_goals_entries
  FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete learning goal entries"
  ON public.general_learning_goals_entries
  FOR DELETE
  USING (true);