'use client';

import { useState, useEffect } from 'react';
import { useBucket } from '@/contexts/BucketContext';
import { Bucket, BucketFormData } from '@/types/bucket';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface BucketFormProps {
  bucket?: Bucket;
  onClose: () => void;
}

export function BucketForm({ bucket, onClose }: BucketFormProps) {
  const { createBucket, updateBucket } = useBucket();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BucketFormData>({
    name: '',
    description: '',
  });

  // Populate form data if editing
  useEffect(() => {
    if (bucket) {
      setFormData({
        name: bucket.name,
        description: bucket.description || '',
      });
    }
  }, [bucket]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Bucket name is required');
      }

      if (bucket) {
        // Update existing bucket
        await updateBucket(bucket.id, formData);
      } else {
        // Create new bucket
        await createBucket(formData);
      }
      
      // Reset form and close
      setFormData({ name: '', description: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="name">Bucket Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter bucket name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter bucket description"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : bucket ? 'Update Bucket' : 'Create Bucket'}
        </Button>
      </div>
    </form>
  );
} 