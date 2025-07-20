// Mock in-memory database - Replace with real database in production
interface User {
  id: string
  email: string
  hashedPassword: string
  createdAt: Date
}

// In-memory storage (replace with real database)
const users: User[] = []

export async function findUserByEmail(email: string): Promise<User | null> {
  return users.find((user) => user.email === email) || null
}

export async function createUser(email: string, hashedPassword: string): Promise<User> {
  const user: User = {
    id: Math.random().toString(36).substring(2, 15),
    email,
    hashedPassword,
    createdAt: new Date(),
  }
  users.push(user)
  return user
}

export async function getAllUsers(): Promise<User[]> {
  return users
}
