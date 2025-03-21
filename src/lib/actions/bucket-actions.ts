'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { BucketFormData } from '@/types/bucket';
import { z } from 'zod';

const bucketSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export async function createBucket(data: BucketFormData) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  const validated = bucketSchema.parse(data);
  
  // Check if this is the first bucket for the user
  const bucketCount = await db.bucket.count({
    where: { ownerId: session.user.id }
  });
  
  const newBucket = await db.bucket.create({
    data: {
      ...validated,
      ownerId: session.user.id,
      isDefault: bucketCount === 0, // Make default if it's the first bucket
    }
  });
  
  revalidatePath('/buckets');
  return newBucket;
}

export async function updateBucket(
  bucketId: string, 
  data: BucketFormData
) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  const validated = bucketSchema.parse(data);
  
  const bucket = await db.bucket.findUnique({
    where: { id: bucketId }
  });
  
  if (!bucket || bucket.ownerId !== session.user.id) {
    throw new Error("Bucket not found or access denied");
  }
  
  const updatedBucket = await db.bucket.update({
    where: { id: bucketId },
    data: validated
  });
  
  revalidatePath('/buckets');
  return updatedBucket;
}

export async function setDefaultBucket(bucketId: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  const bucket = await db.bucket.findUnique({
    where: { id: bucketId }
  });
  
  if (!bucket || bucket.ownerId !== session.user.id) {
    throw new Error("Bucket not found or access denied");
  }
  
  // Reset all defaults for this user
  await db.bucket.updateMany({
    where: { 
      ownerId: session.user.id,
      isDefault: true
    },
    data: { isDefault: false }
  });
  
  // Set new default
  const updatedBucket = await db.bucket.update({
    where: { id: bucketId },
    data: { isDefault: true }
  });
  
  revalidatePath('/buckets');
  return updatedBucket;
}

export async function deleteBucket(bucketId: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  const bucket = await db.bucket.findUnique({
    where: { id: bucketId }
  });
  
  if (!bucket || bucket.ownerId !== session.user.id) {
    throw new Error("Bucket not found or access denied");
  }
  
  // Check if this is the default bucket
  if (bucket.isDefault) {
    // Find another bucket to make default
    const anotherBucket = await db.bucket.findFirst({
      where: {
        ownerId: session.user.id,
        id: { not: bucketId }
      }
    });
    
    if (anotherBucket) {
      await db.bucket.update({
        where: { id: anotherBucket.id },
        data: { isDefault: true }
      });
    }
  }
  
  // Delete the bucket
  await db.bucket.delete({
    where: { id: bucketId }
  });
  
  revalidatePath('/buckets');
} 