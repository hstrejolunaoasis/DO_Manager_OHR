import { BucketForm } from '@/components/bucket/bucket-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Create Bucket',
  description: 'Create a new bucket to organize your content',
};

export default function NewBucketPage() {
  return (
    <div className="container max-w-lg py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Bucket</CardTitle>
          <CardDescription>
            Buckets help you organize your content into separate workspaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BucketForm />
        </CardContent>
      </Card>
    </div>
  );
} 