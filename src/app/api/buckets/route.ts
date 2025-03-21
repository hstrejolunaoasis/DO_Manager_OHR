import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get buckets for the current user
    const buckets = await db.bucket.findMany({
      where: {
        ownerId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(buckets);
  } catch (error) {
    console.error('Error fetching buckets:', error);
    return NextResponse.json({ error: 'Failed to fetch buckets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 });
    }
    
    // Check if user already has buckets to determine if this should be default
    const bucketCount = await db.bucket.count({
      where: { ownerId: userId }
    });
    
    const newBucket = await db.bucket.create({
      data: {
        name,
        description,
        ownerId: userId,
        isDefault: bucketCount === 0
      }
    });
    
    return NextResponse.json(newBucket, { status: 201 });
  } catch (error) {
    console.error('Error creating bucket:', error);
    return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 });
  }
} 