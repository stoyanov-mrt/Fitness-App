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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      body_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          measurements: Json | null
          photo_urls: string[]
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          measurements?: Json | null
          photo_urls?: string[]
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          measurements?: Json | null
          photo_urls?: string[]
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          equipment: string | null
          id: string
          image_urls: string[]
          instructions: string | null
          is_custom: boolean
          name: string
          primary_muscle: string | null
          secondary_muscles: string[]
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          equipment?: string | null
          id?: string
          image_urls?: string[]
          instructions?: string | null
          is_custom?: boolean
          name: string
          primary_muscle?: string | null
          secondary_muscles?: string[]
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          equipment?: string | null
          id?: string
          image_urls?: string[]
          instructions?: string | null
          is_custom?: boolean
          name?: string
          primary_muscle?: string | null
          secondary_muscles?: string[]
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          barcode: string | null
          brand: string | null
          calories: number
          carbs_g: number
          created_at: string
          created_by: string | null
          fat_g: number
          fdc_id: string | null
          id: string
          is_custom: boolean
          name: string
          protein_g: number
          serving_size: number
          serving_unit: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories: number
          carbs_g: number
          created_at?: string
          created_by?: string | null
          fat_g: number
          fdc_id?: string | null
          id?: string
          is_custom?: boolean
          name: string
          protein_g: number
          serving_size?: number
          serving_unit?: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories?: number
          carbs_g?: number
          created_at?: string
          created_by?: string | null
          fat_g?: number
          fdc_id?: string | null
          id?: string
          is_custom?: boolean
          name?: string
          protein_g?: number
          serving_size?: number
          serving_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "foods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          calories_target: number
          carbs_g_target: number
          created_at: string
          effective_date: string
          fat_g_target: number
          id: string
          protein_g_target: number
          user_id: string
        }
        Insert: {
          calories_target: number
          carbs_g_target: number
          created_at?: string
          effective_date?: string
          fat_g_target: number
          id?: string
          protein_g_target: number
          user_id: string
        }
        Update: {
          calories_target?: number
          carbs_g_target?: number
          created_at?: string
          effective_date?: string
          fat_g_target?: number
          id?: string
          protein_g_target?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_items: {
        Row: {
          food_id: string
          id: string
          logged_at: string
          meal_id: string
          quantity: number
        }
        Insert: {
          food_id: string
          id?: string
          logged_at?: string
          meal_id: string
          quantity?: number
        }
        Update: {
          food_id?: string
          id?: string
          logged_at?: string
          meal_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string
          date: string
          id: string
          meal_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          meal_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          meal_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          created_at: string
          current_weight_kg: number | null
          date_of_birth: string | null
          full_name: string | null
          goal: string | null
          height_cm: number | null
          id: string
          sex: string | null
          theme: string
          unit_system: string
          updated_at: string
        }
        Insert: {
          activity_level?: string | null
          created_at?: string
          current_weight_kg?: number | null
          date_of_birth?: string | null
          full_name?: string | null
          goal?: string | null
          height_cm?: number | null
          id: string
          sex?: string | null
          theme?: string
          unit_system?: string
          updated_at?: string
        }
        Update: {
          activity_level?: string | null
          created_at?: string
          current_weight_kg?: number | null
          date_of_birth?: string | null
          full_name?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          sex?: string | null
          theme?: string
          unit_system?: string
          updated_at?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          exercise_id: string
          id: string
          order_index: number
          routine_id: string
          target_reps: string | null
          target_sets: number | null
          target_weight: number | null
        }
        Insert: {
          exercise_id: string
          id?: string
          order_index?: number
          routine_id: string
          target_reps?: string | null
          target_sets?: number | null
          target_weight?: number | null
        }
        Update: {
          exercise_id?: string
          id?: string
          order_index?: number
          routine_id?: string
          target_reps?: string | null
          target_sets?: number | null
          target_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          completed_at: string
          id: string
          is_warmup: boolean
          reps: number
          rpe: number | null
          set_index: number
          weight: number
          workout_exercise_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          is_warmup?: boolean
          reps: number
          rpe?: number | null
          set_index?: number
          weight: number
          workout_exercise_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          is_warmup?: boolean
          reps?: number
          rpe?: number | null
          set_index?: number
          weight?: number
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          workout_id: string
        }
        Insert: {
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          workout_id: string
        }
        Update: {
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          ended_at: string | null
          id: string
          name: string
          notes: string | null
          routine_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          routine_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          routine_id?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_nutrition_summary: {
        Row: {
          date: string | null
          total_calories: number | null
          total_carbs_g: number | null
          total_fat_g: number | null
          total_protein_g: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
