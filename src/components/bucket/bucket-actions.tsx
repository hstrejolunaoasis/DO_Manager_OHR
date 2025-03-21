'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bucket } from '@/types/bucket';
import { setDefaultBucket, deleteBucket } from '@/lib/actions/bucket-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Star, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BucketActionsProps {
  bucket: Bucket;
}

export function BucketActions({ bucket }: BucketActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  
  const handleSetDefault = async () => {
    try {
      await setDefaultBucket(bucket.id);
      toast({
        title: "Default bucket updated",
        description: `${bucket.name} is now your default bucket`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to set default bucket",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteBucket(bucket.id);
      toast({
        title: "Bucket deleted",
        description: `${bucket.name} has been deleted`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to delete bucket",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Bucket Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/buckets/${bucket.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {!bucket.isDefault && (
            <DropdownMenuItem onClick={handleSetDefault}>
              <Star className="mr-2 h-4 w-4" />
              Set as Default
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bucket "{bucket.name}" and all its contents.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 