import { NextResponse } from 'next/server'

// Storage has been removed from this app.
// Conversations only live in memory during an active session.

export async function POST() {
  return NextResponse.json({ success: true, message: 'Storage disabled' })
}

export async function GET() {
  return NextResponse.json({ conversations: [] })
}

export async function DELETE() {
  return NextResponse.json({ success: true })
}
