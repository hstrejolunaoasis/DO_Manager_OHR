import { NextResponse } from 'next/server'
import { 
  ListObjectsV2Command, 
  CopyObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function POST(request: Request) {
  try {
    const { oldKey, newKey } = await request.json()
    
    if (!oldKey || !newKey) {
      return NextResponse.json(
        { error: 'Both oldKey and newKey are required' }, 
        { status: 400 }
      )
    }

    if (!oldKey.endsWith('/') || !newKey.endsWith('/')) {
      return NextResponse.json(
        { error: 'Keys must end with / for directory operations' }, 
        { status: 400 }
      )
    }

    // List all objects within the directory
    const listedObjects = await listAllObjectsWithPrefix(oldKey)
    
    if (listedObjects.length === 0) {
      return NextResponse.json(
        { error: 'No objects found with the specified prefix' }, 
        { status: 404 }
      )
    }

    // Process each object - copy to new location then delete old
    await Promise.all(listedObjects.map(async (object) => {
      // Create the new key by replacing the old prefix with the new one
      const newObjectKey = object.Key!.replace(oldKey, newKey)
      
      // Copy the object to its new location
      await spacesClient.send(
        new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${object.Key}`,
          Key: newObjectKey
        })
      )
      
      // Delete the object from its old location
      await spacesClient.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: object.Key!
        })
      )
    }))

    return NextResponse.json({
      message: 'Directory renamed successfully',
      oldKey,
      newKey,
      objectsProcessed: listedObjects.length
    })
  } catch (error: any) {
    console.error('Directory rename error:', error)
    return NextResponse.json(
      { error: 'Failed to rename directory', details: error.message },
      { status: 500 }
    )
  }
}

// Helper function to list all objects with a given prefix
async function listAllObjectsWithPrefix(prefix: string) {
  let allObjects: any[] = []
  let continuationToken: string | undefined = undefined
  
  do {
    const response = await spacesClient.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken
      })
    )
    
    if (response.Contents) {
      allObjects = [...allObjects, ...response.Contents]
    }
    
    continuationToken = response.NextContinuationToken
  } while (continuationToken)
  
  return allObjects
}
