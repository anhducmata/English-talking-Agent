import { NextRequest, NextResponse } from 'next/server'
import { CloudStorageService } from '@/lib/cloud-storage-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const s3Key = searchParams.get('key')

    if (!s3Key) {
      return NextResponse.json({ error: 'S3 key is required' }, { status: 400 })
    }

    const signedUrl = await CloudStorageService.getAudioUrl(s3Key)
    
    if (!signedUrl) {
      return NextResponse.json({ error: 'Failed to generate audio URL' }, { status: 500 })
    }

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error('Error generating audio URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio URL' }, 
      { status: 500 }
    )
  }
}
