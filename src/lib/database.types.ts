export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      classes: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          grade: string
          id: string
          name: string
          school_name: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          grade: string
          id?: string
          name: string
          school_name?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          grade?: string
          id?: string
          name?: string
          school_name?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mission_achievements: {
        Row: {
          class_id: string
          id: string
          mission_id: string
          student_id: string
          timestamp: string | null
        }
        Insert: {
          class_id: string
          id?: string
          mission_id: string
          student_id: string
          timestamp?: string | null
        }
        Update: {
          class_id?: string
          id?: string
          mission_id?: string
          student_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_achievements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_achievements_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          class_id: string
          condition: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          condition: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          condition?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      point_shop_items: {
        Row: {
          class_id: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_shop_items_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      praise_cards: {
        Row: {
          class_id: string
          content: string
          created_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "praise_cards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "praise_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_history: {
        Row: {
          class_id: string
          id: string
          item_id: string
          purchase_date: string | null
          student_id: string
          used: boolean | null
          used_date: string | null
        }
        Insert: {
          class_id: string
          id?: string
          item_id: string
          purchase_date?: string | null
          student_id: string
          used?: boolean | null
          used_date?: string | null
        }
        Update: {
          class_id?: string
          id?: string
          item_id?: string
          purchase_date?: string | null
          student_id?: string
          used?: boolean | null
          used_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_history_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "point_shop_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_step_achievements: {
        Row: {
          class_id: string
          id: string
          step_id: string
          student_id: string
          timestamp: string | null
        }
        Insert: {
          class_id: string
          id?: string
          step_id: string
          student_id: string
          timestamp?: string | null
        }
        Update: {
          class_id?: string
          id?: string
          step_id?: string
          student_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_step_achievements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_step_achievements_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "roadmap_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_step_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_steps: {
        Row: {
          created_at: string | null
          goal: string
          id: string
          order_index: number
          roadmap_id: string
        }
        Insert: {
          created_at?: string | null
          goal: string
          id?: string
          order_index: number
          roadmap_id: string
        }
        Update: {
          created_at?: string | null
          goal?: string
          id?: string
          order_index?: number
          roadmap_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_steps_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          class_id: string
          created_at: string | null
          icon: string | null
          id: string
          name: string
          reward_title: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          reward_title: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          reward_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          class_id: string
          created_at: string | null
          exp: number | null
          honorific: string | null
          icon_type: string | null
          id: string
          level: number | null
          name: string
          number: number
          points: number | null
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          exp?: number | null
          honorific?: string | null
          icon_type?: string | null
          id?: string
          level?: number | null
          name: string
          number: number
          points?: number | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          exp?: number | null
          honorific?: string | null
          icon_type?: string | null
          id?: string
          level?: number | null
          name?: string
          number?: number
          points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
