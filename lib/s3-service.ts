import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME!

export interface UploadAudioResult {
  key: string
  url: string
  signedUrl?: string
}

/**
 * Upload audio file to S3
 */
export async function uploadAudioToS3(
  audioBuffer: Buffer,
  fileName: string,
  contentType: string = 'audio/mpeg'
): Promise<UploadAudioResult> {
  const key = `audio/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: audioBuffer,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
  })

  await s3Client.send(command)

  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  
  return {
    key,
    url,
  }
}

/**
 * Get signed URL for audio playback (valid for 1 hour)
 */
export async function getAudioSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Delete audio file from S3
 */
export async function deleteAudioFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Upload conversation audio (for user recordings)
 */
export async function uploadUserAudio(audioBlob: Blob, conversationId: string, messageId: string): Promise<UploadAudioResult> {
  const buffer = Buffer.from(await audioBlob.arrayBuffer())
  const fileName = `${conversationId}-${messageId}-user.webm`
  
  return uploadAudioToS3(buffer, fileName, 'audio/webm')
}

/**
 * Upload AI-generated audio (from TTS)
 */
export async function uploadAIAudio(audioBuffer: ArrayBuffer, conversationId: string, messageId: string): Promise<UploadAudioResult> {
  const buffer = Buffer.from(audioBuffer)
  const fileName = `${conversationId}-${messageId}-ai.mp3`
  
  return uploadAudioToS3(buffer, fileName, 'audio/mpeg')
}

/**
 * Validate S3 configuration
 */
export function validateS3Config(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.S3_BUCKET_NAME
  )
}
