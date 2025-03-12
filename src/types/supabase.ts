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
      categories: {
        Row: {
          age_group: string | null
          count: number | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          age_group?: string | null
          count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          age_group?: string | null
          count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          bookmarks: number | null
          created_at: string | null
          id: string
          likes: number | null
          listens: number | null
          story_id: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          bookmarks?: number | null
          created_at?: string | null
          id?: string
          likes?: number | null
          listens?: number | null
          story_id?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          bookmarks?: number | null
          created_at?: string | null
          id?: string
          likes?: number | null
          listens?: number | null
          story_id?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stats_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          audio_url: string | null
          bookmarks: number | null
          category: string | null
          category_id: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string
          is_bookmarked: boolean | null
          is_favorite: boolean | null
          likes: number | null
          listens: number | null
          read_time: number | null
          title: string
          updated_at: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          audio_url?: string | null
          bookmarks?: number | null
          category?: string | null
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_bookmarked?: boolean | null
          is_favorite?: boolean | null
          likes?: number | null
          listens?: number | null
          read_time?: number | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          audio_url?: string | null
          bookmarks?: number | null
          category?: string | null
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_bookmarked?: boolean | null
          is_favorite?: boolean | null
          likes?: number | null
          listens?: number | null
          read_time?: number | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string | null
          id: string
          key: string
          language_code: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          language_code: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          language_code?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string | null
          created_at: string | null
          id: string
          story_id: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          activity_type?: string | null
          created_at?: string | null
          id?: string
          story_id?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          activity_type?: string | null
          created_at?: string | null
          id?: string
          story_id?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stories: {
        Row: {
          created_at: string | null
          id: string
          is_bookmarked: boolean | null
          is_favorite: boolean | null
          last_read_at: string | null
          progress: number | null
          story_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_bookmarked?: boolean | null
          is_favorite?: boolean | null
          last_read_at?: string | null
          progress?: number | null
          story_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_bookmarked?: boolean | null
          is_favorite?: boolean | null
          last_read_at?: string | null
          progress?: number | null
          story_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          language: string | null
          page_visited: string | null
          referrer: string | null
          user_agent: string | null
          visit_time: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          language?: string | null
          page_visited?: string | null
          referrer?: string | null
          user_agent?: string | null
          visit_time?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          language?: string | null
          page_visited?: string | null
          referrer?: string | null
          user_agent?: string | null
          visit_time?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_story_bookmarks: {
        Args: {
          story_id: string
        }
        Returns: undefined
      }
      decrement_story_likes: {
        Args: {
          story_id: string
        }
        Returns: undefined
      }
      increment_story_bookmarks: {
        Args: {
          story_id: string
        }
        Returns: undefined
      }
      increment_story_likes: {
        Args: {
          story_id: string
        }
        Returns: undefined
      }
      increment_story_listens: {
        Args: {
          story_id: string
        }
        Returns: undefined
      }
      increment_story_views: {
        Args: {
          story_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
