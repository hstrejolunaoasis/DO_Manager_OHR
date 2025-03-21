import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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

export async function GET() {
  try {
    const data = await readBucketsFile();
    return NextResponse.json(data.buckets);
  } catch (error) {
    console.error('Error fetching buckets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buckets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as BucketFormData;
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const fileData = await readBucketsFile();
    
    const newBucket: Bucket = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    fileData.buckets.push(newBucket);
    await writeBucketsFile(fileData);
    
    return NextResponse.json(newBucket, { status: 201 });
  } catch (error) {
    console.error('Error creating bucket:', error);
    return NextResponse.json(
      { error: 'Failed to create bucket' },
      { status: 500 }
    );
  }
} 