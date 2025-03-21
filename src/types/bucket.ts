export interface Bucket {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  isDefault?: boolean;
}

export type BucketFormData = Pick<Bucket, 'name' | 'description'>; 