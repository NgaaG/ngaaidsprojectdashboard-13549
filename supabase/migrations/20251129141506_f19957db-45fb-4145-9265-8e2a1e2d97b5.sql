-- Add table for tracking general learning goals entries with history
CREATE TABLE IF NOT EXISTS public.general_learning_goals_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  heading TEXT NOT NULL,
  subheading TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  achievement_level INTEGER DEFAULT 0 CHECK (achievement_level >= 0 AND achievement_level <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.general_learning_goals_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own learning goal entries"
  ON public.general_learning_goals_entries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning goal entries"
  ON public.general_learning_goals_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning goal entries"
  ON public.general_learning_goals_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning goal entries"
  ON public.general_learning_goals_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_general_learning_goals_entries_updated_at
  BEFORE UPDATE ON public.general_learning_goals_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add entry_date column to reflections table for custom date selection
ALTER TABLE public.reflections
ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT CURRENT_DATE;