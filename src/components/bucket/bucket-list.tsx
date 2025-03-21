import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { BucketActions } from './bucket-actions';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { FolderIcon } from 'lucide-react';
import Link from 'next/link';

export async function BucketList() {
  const session = await auth();
  
  if (!session?.user) {
    return <div>Unauthorized</div>;
  }
  
  const buckets = await db.bucket.findMany({
    where: {
      ownerId: session.user.id
    },
    orderBy: [
      { isDefault: 'desc' },
      { updatedAt: 'desc' }
    ]
  });
  
  if (buckets.length === 0) {
    return (
      <EmptyState
        icon={FolderIcon}
        title="No buckets found"
        description="Create your first bucket to get started"
        action={
          <Link href="/buckets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Bucket
            </Button>
          </Link>
        }
      />
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buckets.map((bucket) => (
          <TableRow key={bucket.id}>
            <TableCell className="font-medium">
              {bucket.name}
              {bucket.description && (
                <p className="text-sm text-muted-foreground mt-1">{bucket.description}</p>
              )}
            </TableCell>
            <TableCell>
              {formatDistanceToNow(bucket.createdAt, { addSuffix: true })}
            </TableCell>
            <TableCell>
              {bucket.isDefault && <Badge>Default</Badge>}
            </TableCell>
            <TableCell className="text-right">
              <BucketActions bucket={bucket} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 