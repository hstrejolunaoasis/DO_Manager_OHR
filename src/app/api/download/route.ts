import { NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      )
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    // Generate a pre-signed URL that expires in 5 minutes
    const signedUrl = await getSignedUrl(spacesClient, command, {
      expiresIn: 300,
    })

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error('Error generating download URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
} 