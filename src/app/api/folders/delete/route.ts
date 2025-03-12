import { NextResponse } from 'next/server'
import { 
  ListObjectsV2Command, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function DELETE(request: Request) {
  try {
    const { key } = await request.json()
    
    if (!key) {
      return NextResponse.json(
        { error: 'Folder key is required' },
        { status: 400 }
      )
    }

    // Make sure the key ends with '/' to ensure it's a folder
    const folderKey = key.endsWith('/') ? key : `${key}/`
    
    // List all objects with the folder prefix
    const listedObjects = await listAllObjectsWithPrefix(folderKey)
    
    if (listedObjects.length === 0) {
      return NextResponse.json(
        { error: 'No objects found with the specified folder prefix' },
        { status: 404 }
      )
    }

    // Delete all objects in the folder
    await Promise.all(listedObjects.map(async (object) => {
      await spacesClient.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: object.Key!
        })
      )
    }))

    return NextResponse.json({ 
      message: 'Folder deleted successfully',
      objectsDeleted: listedObjects.length
    })
  } catch (error: any) {
    console.error('Folder deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder', details: error.message },
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
