import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function POST(request: Request) {
  try {
    const { path, name } = await request.json()
    
    // Construct the full path for the new folder
    const folderPath = `${path}${name}/`.replace(/\/+/g, '/') // Normalize slashes

    // Create an empty object with a trailing slash to represent a folder
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: folderPath,
      Body: '',
      ContentLength: 0,
    })

    await spacesClient.send(command)

    return NextResponse.json({ message: 'Folder created successfully' })
  } catch (error: any) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder', details: error.message },
      { status: 500 }
    )
  }
} 