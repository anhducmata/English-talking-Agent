import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface DBUser {
  id: string
  email: string
  hashedPassword: string
  createdAt: Date
}

export async function findUserByEmail(email: string): Promise<DBUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, hashed_password, created_at")
    .eq("email", email)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    email: data.email,
    hashedPassword: data.hashed_password,
    createdAt: new Date(data.created_at),
  }
}

export async function createUser(email: string, hashedPassword: string): Promise<DBUser | null> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: crypto.randomUUID(),
      email,
      hashed_password: hashedPassword,
    })
    .select("id, email, hashed_password, created_at")
    .single()

  if (error || !data) {
    console.error("Error creating user:", error)
    return null
  }

  return {
    id: data.id,
    email: data.email,
    hashedPassword: data.hashed_password,
    createdAt: new Date(data.created_at),
  }
}
