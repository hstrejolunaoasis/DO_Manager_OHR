import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Bucket, BucketFormData } from '@/types/bucket';

const dataFilePath = path.join(process.cwd(), 'data', 'buckets.json');

async function readBucketsFile() {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    // If file doesn't exist or is empty, return empty buckets array
    return { buckets: [] };
  }
}

async function writeBucketsFile(data: { buckets: Bucket[] }) {
  await fs.writeFile(dataFilePath, JSON.stringify(data), 'utf8');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await readBucketsFile();
    
    const bucket = data.buckets.find((b: Bucket) => b.id === id);
    
    if (!bucket) {
      return NextResponse.json(
        { error: 'Bucket not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(bucket);
  } catch (error) {
    console.error('Error fetching bucket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bucket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json() as BucketFormData;
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const fileData = await readBucketsFile();
    const bucketIndex = fileData.buckets.findIndex((b: Bucket) => b.id === id);
    
    if (bucketIndex === -1) {
      return NextResponse.json(
        { error: 'Bucket not found' },
        { status: 404 }
      );
    }
    
    // Update bucket with new data
    const updatedBucket: Bucket = {
      ...fileData.buckets[bucketIndex],
      name: data.name,
      description: data.description || fileData.buckets[bucketIndex].description,
      updatedAt: new Date().toISOString()
    };
    
    fileData.buckets[bucketIndex] = updatedBucket;
    await writeBucketsFile(fileData);
    
    return NextResponse.json(updatedBucket);
  } catch (error) {
    console.error('Error updating bucket:', error);
    return NextResponse.json(
      { error: 'Failed to update bucket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const fileData = await readBucketsFile();
    
    const bucketIndex = fileData.buckets.findIndex((b: Bucket) => b.id === id);
    
    if (bucketIndex === -1) {
      return NextResponse.json(
        { error: 'Bucket not found' },
        { status: 404 }
      );
    }
    
    // Remove bucket from array
    fileData.buckets.splice(bucketIndex, 1);
    await writeBucketsFile(fileData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bucket:', error);
    return NextResponse.json(
      { error: 'Failed to delete bucket' },
      { status: 500 }
    );
  }
} 