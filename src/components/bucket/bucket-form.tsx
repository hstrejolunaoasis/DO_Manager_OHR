'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bucket, BucketFormData } from '@/types/bucket';
import { createBucket, updateBucket } from '@/lib/actions/bucket-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const bucketFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

interface BucketFormProps {
  bucket?: Bucket;
}

export function BucketForm({ bucket }: BucketFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEditing = !!bucket;
  
  const form = useForm<z.infer<typeof bucketFormSchema>>({
    resolver: zodResolver(bucketFormSchema),
    defaultValues: {
      name: bucket?.name || '',
      description: bucket?.description || '',
    },
  });
  
  async function onSubmit(data: z.infer<typeof bucketFormSchema>) {
    setIsLoading(true);
    
    try {
      if (isEditing) {
        await updateBucket(bucket.id, data);
        toast({
          title: "Bucket updated",
          description: "Your bucket has been updated successfully",
        });
      } else {
        await createBucket(data);
        toast({
          title: "Bucket created",
          description: "Your new bucket has been created successfully",
        });
      }
      router.push('/buckets');
    } catch (error) {
      console.error('Error saving bucket:', error);
      toast({
        title: "Error",
        description: "Failed to save bucket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My Bucket" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for your bucket
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description for this bucket"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the purpose of this bucket
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/buckets')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>Saving...</>
            ) : isEditing ? (
              <>Update Bucket</>
            ) : (
              <>Create Bucket</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 