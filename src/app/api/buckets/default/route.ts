import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get default bucket for the user
    const defaultBucket = await db.bucket.findFirst({
      where: {
        ownerId: userId,
        isDefault: true
      }
    });
    
    // If no default bucket is found, get the most recently updated one
    if (!defaultBucket) {
      const firstBucket = await db.bucket.findFirst({
        where: {
          ownerId: userId
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      if (firstBucket) {
        return NextResponse.json(firstBucket);
      }
      
      // No buckets found
      return NextResponse.json(null);
    }
    
    return NextResponse.json(defaultBucket);
  } catch (error) {
    console.error('Error fetching default bucket:', error);
    return NextResponse.json({ error: 'Failed to fetch default bucket' }, { status: 500 });
  }
} 