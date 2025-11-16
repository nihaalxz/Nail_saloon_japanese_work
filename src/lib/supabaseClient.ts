import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'; // 1. Import the new types
 // 1. Import the new types

// Get the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Error checking...
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in the .env file")
}

// 2. Pass the <Database> generic to createClient
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)