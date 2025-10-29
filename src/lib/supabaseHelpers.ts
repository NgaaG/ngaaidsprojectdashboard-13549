import { supabase } from "@/integrations/supabase/client";

// Helper to bypass TypeScript errors until types regenerate after migration
export const db = supabase as any;
