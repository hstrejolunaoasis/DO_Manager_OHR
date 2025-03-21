'use client';

import { BucketList } from './bucket-list';
import { BucketProvider } from '@/contexts/BucketContext';

export function BucketManager() {
  return (
    <BucketProvider>
      <div className="p-4 border rounded-md">
        <BucketList />
      </div>
    </BucketProvider>
  );
} 