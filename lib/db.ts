import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string
  email: string
  password_hash: string
  created_at: string
}

export async function createUser(email: string, passwordHash: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password_hash: passwordHash }])
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null
      }
      console.error("Error finding user:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error finding user:", error)
    return null
  }
}
