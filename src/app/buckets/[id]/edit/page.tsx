import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { BucketForm } from '@/components/bucket/bucket-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EditBucketPageProps {
  params: { id: string };
}

export default async function EditBucketPage({ params }: EditBucketPageProps) {
  const session = await auth();
  
  if (!session?.user) {
    return <div>Unauthorized</div>;
  }
  
  const bucket = await db.bucket.findUnique({
    where: {
      id: params.id,
      ownerId: session.user.id
    },
  });
  
  if (!bucket) {
    notFound();
  }
  
  return (
    <div className="container max-w-lg py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Bucket</CardTitle>
          <CardDescription>
            Update your bucket details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BucketForm bucket={bucket} />
        </CardContent>
      </Card>
    </div>
  );
} 