import { NextResponse } from 'next/server'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { spacesClient, BUCKET_NAME } from '@/utils/spaces-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('prefix') || ''
    const search = searchParams.get('search')?.toLowerCase() || ''
    const viewMode = searchParams.get('viewMode')

    // Don't use delimiter for search or tree view to get all nested contents
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: (search || viewMode === 'tree') ? undefined : '/',
    })

    const response = await spacesClient.send(command)
    
    // Process the response to create a proper directory structure
    const processItems = () => {
      const items = []
      const seenPrefixes = new Set()

      // Add explicit directories from CommonPrefixes
      if (response.CommonPrefixes) {
        for (const prefix of response.CommonPrefixes) {
          if (prefix.Prefix) {
            seenPrefixes.add(prefix.Prefix)
            items.push({
              Key: prefix.Prefix,
              LastModified: new Date(),
              Size: 0,
              Type: 'folder'
            })
          }
        }
      }

      // Process Contents to extract implicit directories and files
      if (response.Contents) {
        for (const item of response.Contents) {
          if (!item.Key || item.Key === prefix) continue

          // For tree view or search mode, extract all parent directories
          if (viewMode === 'tree' || search) {
            const parts = item.Key.split('/')
            parts.pop() // Remove the file name
            let currentPath = ''
            
            // Add all parent directories
            for (const part of parts) {
              currentPath += part + '/'
              if (!seenPrefixes.has(currentPath) && currentPath !== prefix) {
                seenPrefixes.add(currentPath)
                items.push({
                  Key: currentPath,
                  LastModified: new Date(),
                  Size: 0,
                  Type: 'folder'
                })
              }
            }
          }

          // Add the file itself
          items.push({
            Key: item.Key,
            LastModified: item.LastModified || new Date(),
            Size: item.Size || 0,
            Type: 'file'
          })
        }
      }

      return items
    }

    const items = processItems()

    // If searching, filter items based on the search term
    const filteredItems = search
      ? items.filter(item => {
          const name = item.Key.split('/').pop() || ''
          const cleanName = name.endsWith('/') ? name.slice(0, -1) : name
          return cleanName.toLowerCase().includes(search)
        })
      : items

    return NextResponse.json(filteredItems)
  } catch (error: any) {
    console.error('API Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to list files',
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    )
  }
} 