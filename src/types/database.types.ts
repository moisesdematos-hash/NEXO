export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FamilyRole = 'owner' | 'admin' | 'member' | 'viewer';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AIActionStatus = 'pending' | 'executed' | 'failed' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone_number: string | null;
          role?: string | null;
          is_guest: boolean;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          role?: string | null;
          is_guest?: boolean;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          role?: string | null;
          is_guest?: boolean;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      family_groups: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          invite_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          invite_code?: string;
          created_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: FamilyRole;
          permissions: Json;
          joined_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role?: FamilyRole;
          permissions?: Json;
          joined_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          user_id?: string;
          role?: FamilyRole;
          permissions?: Json;
          joined_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          family_id: string | null;
          is_private: boolean;
          title: string;
          description: string | null;
          priority: TaskPriority;
          status: TaskStatus;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          family_id?: string | null;
          is_private?: boolean;
          title: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          family_id?: string | null;
          is_private?: boolean;
          title?: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          family_id: string | null;
          is_private: boolean;
          title: string;
          description: string | null;
          location: string | null;
          start_time: string;
          end_time: string;
          is_all_day: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          family_id?: string | null;
          is_private?: boolean;
          title: string;
          description?: string | null;
          location?: string | null;
          start_time: string;
          end_time: string;
          is_all_day?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          family_id?: string | null;
          is_private?: boolean;
          title?: string;
          description?: string | null;
          location?: string | null;
          start_time?: string;
          end_time?: string;
          is_all_day?: boolean;
          created_at?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          user_id: string;
          family_id: string | null;
          is_private: boolean;
          title: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          family_id?: string | null;
          is_private?: boolean;
          title: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          family_id?: string | null;
          is_private?: boolean;
          title?: string;
          category?: string | null;
          created_at?: string;
        };
      };
      list_items: {
        Row: {
          id: string;
          list_id: string;
          content: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          content: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          content?: string;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_value: number;
          current_value: number;
          unit: string | null;
          deadline: string | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_value?: number;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_value?: number;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      learning_objectives: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          progress_percent: number;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          progress_percent?: number;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          progress_percent?: number;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      learning_plans: {
        Row: {
          id: string;
          objective_id: string;
          title: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          objective_id: string;
          title: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          objective_id?: string;
          title?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      learning_items: {
        Row: {
          id: string;
          plan_id: string;
          title: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          title: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          title?: string;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
        };
      };
      ai_actions_log: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          action_type: string;
          payload: Json;
          status: AIActionStatus;
          executed_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          action_type: string;
          payload: Json;
          status?: AIActionStatus;
          executed_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          action_type?: string;
          payload?: Json;
          status?: AIActionStatus;
          executed_at?: string;
        };
      };
    };
  };
}
