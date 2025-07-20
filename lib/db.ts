import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string
  email: string
  password: string
  created_at: string
}

export async function createUser(email: string, hashedPassword: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword }])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return data
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null
    }
    throw new Error(`Failed to find user: ${error.message}`)
  }

  return data
}

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null
    }
    throw new Error(`Failed to find user: ${error.message}`)
  }

  return data
}
