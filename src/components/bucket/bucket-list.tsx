'use client';

import { useState } from 'react';
import { useBucket } from '@/contexts/BucketContext';
import { Bucket } from '@/types/bucket';
import { BucketForm } from './bucket-form';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function BucketList() {
  const { buckets, currentBucket, setCurrentBucket, deleteBucket, isLoading, error } = useBucket();
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectBucket = (bucket: Bucket) => {
    setCurrentBucket(bucket);
  };

  const handleEdit = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bucket?')) {
      await deleteBucket(id);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingBucket(null);
  };

  const handleFormClose = () => {
    setIsCreating(false);
    setEditingBucket(null);
  };

  if (isLoading) {
    return <div>Loading buckets...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Buckets</h2>
        <Button onClick={handleCreateNew} size="sm" className="flex items-center gap-1">
          <PlusIcon className="h-4 w-4" />
          New Bucket
        </Button>
      </div>

      {isCreating && (
        <div className="border rounded-md p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Create New Bucket</h3>
          <BucketForm onClose={handleFormClose} />
        </div>
      )}

      {editingBucket && (
        <div className="border rounded-md p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Edit Bucket</h3>
          <BucketForm bucket={editingBucket} onClose={handleFormClose} />
        </div>
      )}

      {buckets.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No buckets found. Create your first bucket to get started.
        </div>
      ) : (
        <ul className="space-y-2">
          {buckets.map((bucket) => (
            <li
              key={bucket.id}
              className={`border rounded-md p-3 flex justify-between items-center cursor-pointer ${
                currentBucket?.id === bucket.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => handleSelectBucket(bucket)}
            >
              <div>
                <h3 className="font-medium">{bucket.name}</h3>
                {bucket.description && (
                  <p className="text-sm text-gray-600">{bucket.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(bucket);
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(bucket.id);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 