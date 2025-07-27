import { NextRequest, NextResponse } from 'next/server'
import { migrateToCloudStorage, verifyCloudConfig, testCloudStorage } from '@/lib/migration-utils'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'verify':
        const config = verifyCloudConfig()
        return NextResponse.json(config)

      case 'test':
        const testResult = await testCloudStorage()
        return NextResponse.json(testResult)

      case 'migrate':
        const migrationResult = await migrateToCloudStorage()
        return NextResponse.json(migrationResult)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Migration API error:', error)
    return NextResponse.json(
      { error: 'Migration operation failed' }, 
      { status: 500 }
    )
  }
}
