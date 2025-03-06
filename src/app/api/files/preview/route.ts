import { NextResponse } from 'next/server'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(spacesClient, command, { expiresIn: 3600 })

    // Return the signed URL instead of redirecting
    return NextResponse.json({ url: signedUrl })
  } catch (error: any) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview URL', details: error.message },
      { status: 500 }
    )
  }
} 