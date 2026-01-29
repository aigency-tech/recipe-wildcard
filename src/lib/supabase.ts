import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
        };
      };
      recipes: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string;
          image_url: string | null;
          source: 'user_uploaded' | 'ai_generated' | 'wildcard_modified' | 'template';
          prep_time_minutes: number | null;
          cook_time_minutes: number | null;
          servings: number | null;
          cuisine: string | null;
          difficulty: 'easy' | 'medium' | 'hard' | null;
          is_public: boolean;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          description: string;
          image_url?: string | null;
          source: 'user_uploaded' | 'ai_generated' | 'wildcard_modified' | 'template';
          prep_time_minutes?: number | null;
          cook_time_minutes?: number | null;
          servings?: number | null;
          cuisine?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          is_public?: boolean;
          is_anonymous?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          image_url?: string | null;
          prep_time_minutes?: number | null;
          cook_time_minutes?: number | null;
          servings?: number | null;
          cuisine?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          is_public?: boolean;
        };
      };
      ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          name: string;
          quantity: string;
          unit: string;
          is_wildcard: boolean;
          wildcard_reason: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          name: string;
          quantity: string;
          unit: string;
          is_wildcard?: boolean;
          wildcard_reason?: string | null;
          order_index: number;
        };
        Update: {
          name?: string;
          quantity?: string;
          unit?: string;
          is_wildcard?: boolean;
          wildcard_reason?: string | null;
          order_index?: number;
        };
      };
      instructions: {
        Row: {
          id: string;
          recipe_id: string;
          step_number: number;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          step_number: number;
          content: string;
        };
        Update: {
          step_number?: number;
          content?: string;
        };
      };
      saved_recipes: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
        };
        Update: never;
      };
      wildcard_catalog: {
        Row: {
          id: string;
          name: string;
          category: string;
          flavor_profile: string[];
          pairs_with: string[];
          description: string;
          usage_tips: string;
          intensity: 'subtle' | 'medium' | 'bold';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          flavor_profile: string[];
          pairs_with: string[];
          description: string;
          usage_tips: string;
          intensity: 'subtle' | 'medium' | 'bold';
        };
        Update: {
          name?: string;
          category?: string;
          flavor_profile?: string[];
          pairs_with?: string[];
          description?: string;
          usage_tips?: string;
          intensity?: 'subtle' | 'medium' | 'bold';
        };
      };
    };
  };
};
