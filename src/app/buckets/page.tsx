import { Suspense } from 'react';
import { BucketList } from '@/components/bucket/bucket-list';
import { BucketListSkeleton } from '@/components/bucket/bucket-list-skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Manage Buckets',
  description: 'View and manage your buckets',
};

export default function BucketsPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Buckets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your buckets to organize your content
          </p>
        </div>
        <Button asChild>
          <Link href="/buckets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Bucket
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<BucketListSkeleton />}>
        <BucketList />
      </Suspense>
    </div>
  );
} 