'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bucket, BucketFormData, BucketContextType } from '@/types/bucket';

const BucketContext = createContext<BucketContextType | undefined>(undefined);

interface BucketProviderProps {
  children: ReactNode;
}

export function BucketProvider({ children }: BucketProviderProps) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [currentBucket, setCurrentBucket] = useState<Bucket | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuckets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/buckets');
      if (!response.ok) {
        throw new Error('Failed to fetch buckets');
      }
      const data = await response.json();
      setBuckets(data);
      
      // Set current bucket if none is selected and buckets exist
      if (!currentBucket && data.length > 0) {
        setCurrentBucket(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createBucket = async (data: BucketFormData): Promise<Bucket | null> => {
    setError(null);
    try {
      const response = await fetch('/api/buckets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bucket');
      }
      
      const newBucket = await response.json();
      setBuckets((prev) => [...prev, newBucket]);
      
      // Set as current bucket if it's the first one
      if (buckets.length === 0) {
        setCurrentBucket(newBucket);
      }
      
      return newBucket;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  const updateBucket = async (id: string, data: BucketFormData): Promise<Bucket | null> => {
    setError(null);
    try {
      const response = await fetch(`/api/buckets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bucket');
      }
      
      const updatedBucket = await response.json();
      setBuckets((prev) => 
        prev.map((bucket) => (bucket.id === id ? updatedBucket : bucket))
      );
      
      // Update current bucket if it's the one being edited
      if (currentBucket?.id === id) {
        setCurrentBucket(updatedBucket);
      }
      
      return updatedBucket;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  const deleteBucket = async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`/api/buckets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bucket');
      }
      
      setBuckets((prev) => prev.filter((bucket) => bucket.id !== id));
      
      // If the deleted bucket is the current one, select another
      if (currentBucket?.id === id) {
        const remainingBuckets = buckets.filter((bucket) => bucket.id !== id);
        setCurrentBucket(remainingBuckets.length > 0 ? remainingBuckets[0] : null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Fetch buckets on initial load
  useEffect(() => {
    fetchBuckets();
  }, []);

  const value: BucketContextType = {
    buckets,
    isLoading,
    error,
    currentBucket,
    fetchBuckets,
    createBucket,
    updateBucket,
    deleteBucket,
    setCurrentBucket,
  };

  return (
    <BucketContext.Provider value={value}>
      {children}
    </BucketContext.Provider>
  );
}

export function useBucket() {
  const context = useContext(BucketContext);
  if (context === undefined) {
    throw new Error('useBucket must be used within a BucketProvider');
  }
  return context;
} 