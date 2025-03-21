'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bucket } from '@/types/bucket';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/utils';

interface BucketContextType {
  currentBucket: Bucket | null;
  setCurrentBucket: (bucket: Bucket) => void;
  isLoading: boolean;
}

const BucketContext = createContext<BucketContextType | undefined>(undefined);

export function BucketProvider({ 
  children,
  initialBucket
}: { 
  children: ReactNode;
  initialBucket?: Bucket | null;
}) {
  const [currentBucket, setCurrentBucket] = useState<Bucket | null>(initialBucket || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialBucket);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!initialBucket && !currentBucket) {
      // Fetch default bucket
      const fetchDefaultBucket = async () => {
        try {
          const response = await fetch('/api/buckets/default');
          if (response.ok) {
            const bucket = await response.json();
            setCurrentBucket(bucket);
          }
        } catch (error) {
          console.error('Failed to fetch default bucket:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDefaultBucket();
    }
  }, [initialBucket, currentBucket]);

  const handleSetCurrentBucket = (bucket: Bucket) => {
    setCurrentBucket(bucket);
    
    // Update URL to include bucket ID
    const newQueryString = createQueryString(
      searchParams.toString(),
      'bucket',
      bucket.id
    );
    
    router.push(`${pathname}?${newQueryString}`);
  };

  return (
    <BucketContext.Provider 
      value={{ 
        currentBucket, 
        setCurrentBucket: handleSetCurrentBucket, 
        isLoading 
      }}
    >
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