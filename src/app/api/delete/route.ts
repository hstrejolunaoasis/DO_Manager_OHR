import { NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function DELETE(request: Request) {
  try {
    const { key } = await request.json()

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      )
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await spacesClient.send(command)

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
} 