export interface User {
  email: string
  hashedPassword: string
}

/**
 * A **temporary in-memory store** so the project builds and runs
 * without external services. Replace with a real database (e.g.
 * Supabase or Postgres) once you’re ready for production.
 */
const users: User[] = []

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return users.find((u) => u.email === email)
}

export async function createUser(email: string, hashedPassword: string): Promise<User> {
  const user: User = { email, hashedPassword }
  users.push(user)
  return user
}
