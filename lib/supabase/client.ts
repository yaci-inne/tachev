import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  if (typeof window === "undefined") {
    // During build time, return null to prevent errors
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables")
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
