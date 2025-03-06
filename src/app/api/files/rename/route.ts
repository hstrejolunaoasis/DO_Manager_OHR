import { NextResponse } from 'next/server'
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function POST(request: Request) {
  try {
    const { oldKey, newKey } = await request.json()

    if (!oldKey || !newKey) {
      return NextResponse.json({ error: 'Both oldKey and newKey are required' }, { status: 400 })
    }

    // Copy the object with the new key
    await spacesClient.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${oldKey}`,
        Key: newKey,
      })
    )

    // Delete the old object
    await spacesClient.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: oldKey,
      })
    )

    return NextResponse.json({ message: 'File renamed successfully' })
  } catch (error: any) {
    console.error('Rename error:', error)
    return NextResponse.json(
      { error: 'Failed to rename file', details: error.message },
      { status: 500 }
    )
  }
} 