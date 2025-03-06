import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')
    const path = formData.get('path') || ''
    
    const uploadPromises = files.map(async (file: any) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const key = path + file.name

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read',
      })

      return spacesClient.send(command)
    })

    await Promise.all(uploadPromises)

    return NextResponse.json({ message: 'Files uploaded successfully' })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
} 