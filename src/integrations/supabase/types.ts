export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      competency_progress: {
        Row: {
          communicate: number | null
          create_score: number | null
          id: string
          learn: number | null
          organize: number | null
          research: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          communicate?: number | null
          create_score?: number | null
          id?: string
          learn?: number | null
          organize?: number | null
          research?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          communicate?: number | null
          create_score?: number | null
          id?: string
          learn?: number | null
          organize?: number | null
          research?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mentor_log_views: {
        Row: {
          id: string
          last_viewed_at: string | null
          mentor_log_id: string | null
        }
        Insert: {
          id?: string
          last_viewed_at?: string | null
          mentor_log_id?: string | null
        }
        Update: {
          id?: string
          last_viewed_at?: string | null
          mentor_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_log_views_mentor_log_id_fkey"
            columns: ["mentor_log_id"]
            isOneToOne: true
            referencedRelation: "mentor_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_logs: {
        Row: {
          achieved_goals: string[] | null
          competencies: string[] | null
          created_at: string | null
          date: string
          evidence_images: Json | null
          id: string
          is_public: boolean | null
          key_goals: Json | null
          lecturer: string | null
          mentor_comments: string | null
          mode: string | null
          not_covered_goals: Json | null
          outcomes: Json | null
          project_ids: string[] | null
          resource_links: string | null
          selected_task_ids: string[] | null
          share_token: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achieved_goals?: string[] | null
          competencies?: string[] | null
          created_at?: string | null
          date: string
          evidence_images?: Json | null
          id?: string
          is_public?: boolean | null
          key_goals?: Json | null
          lecturer?: string | null
          mentor_comments?: string | null
          mode?: string | null
          not_covered_goals?: Json | null
          outcomes?: Json | null
          project_ids?: string[] | null
          resource_links?: string | null
          selected_task_ids?: string[] | null
          share_token?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achieved_goals?: string[] | null
          competencies?: string[] | null
          created_at?: string | null
          date?: string
          evidence_images?: Json | null
          id?: string
          is_public?: boolean | null
          key_goals?: Json | null
          lecturer?: string | null
          mentor_comments?: string | null
          mode?: string | null
          not_covered_goals?: Json | null
          outcomes?: Json | null
          project_ids?: string[] | null
          resource_links?: string | null
          selected_task_ids?: string[] | null
          share_token?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          competencies: string[] | null
          completion: number | null
          created_at: string | null
          description: string | null
          figma_link: string | null
          github_link: string | null
          id: string
          key_tasks: Json | null
          last_reflection_mood: string | null
          learning_goals: Json | null
          learning_goals_achievements: Json | null
          mode: string | null
          name: string
          updated_at: string | null
          user_id: string | null
          visual_url: string | null
        }
        Insert: {
          competencies?: string[] | null
          completion?: number | null
          created_at?: string | null
          description?: string | null
          figma_link?: string | null
          github_link?: string | null
          id?: string
          key_tasks?: Json | null
          last_reflection_mood?: string | null
          learning_goals?: Json | null
          learning_goals_achievements?: Json | null
          mode?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
          visual_url?: string | null
        }
        Update: {
          competencies?: string[] | null
          completion?: number | null
          created_at?: string | null
          description?: string | null
          figma_link?: string | null
          github_link?: string | null
          id?: string
          key_tasks?: Json | null
          last_reflection_mood?: string | null
          learning_goals?: Json | null
          learning_goals_achievements?: Json | null
          mode?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          visual_url?: string | null
        }
        Relationships: []
      }
      reflections: {
        Row: {
          category: string | null
          contingency_plan: string | null
          created_at: string | null
          emotional_dump: string | null
          id: string
          mode: string | null
          mood: string
          progress: number | null
          project_id: string | null
          sentiment: number | null
          thoughts_what_i_think: string | null
          thoughts_what_is_true: string | null
          todo_list: Json | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          emotional_dump?: string | null
          id?: string
          mode?: string | null
          mood: string
          progress?: number | null
          project_id?: string | null
          sentiment?: number | null
          thoughts_what_i_think?: string | null
          thoughts_what_is_true?: string | null
          todo_list?: Json | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          emotional_dump?: string | null
          id?: string
          mode?: string | null
          mood?: string
          progress?: number | null
          project_id?: string | null
          sentiment?: number | null
          thoughts_what_i_think?: string | null
          thoughts_what_is_true?: string | null
          todo_list?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
