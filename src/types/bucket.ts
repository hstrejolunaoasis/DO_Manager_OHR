export interface Bucket {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BucketFormData {
  name: string;
  description?: string;
}

export interface BucketContextType {
  buckets: Bucket[];
  isLoading: boolean;
  error: string | null;
  currentBucket: Bucket | null;
  fetchBuckets: () => Promise<void>;
  createBucket: (data: BucketFormData) => Promise<Bucket | null>;
  updateBucket: (id: string, data: BucketFormData) => Promise<Bucket | null>;
  deleteBucket: (id: string) => Promise<boolean>;
  setCurrentBucket: (bucket: Bucket | null) => void;
} 