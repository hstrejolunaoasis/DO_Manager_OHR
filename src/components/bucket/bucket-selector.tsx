'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBucket } from '@/context/bucket-context';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface BucketSelectorProps {
  buckets: Array<{ id: string; name: string }>;
}

export function BucketSelector({ buckets }: BucketSelectorProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { currentBucket, setCurrentBucket, isLoading } = useBucket();

  if (isLoading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentBucket ? currentBucket.name : "Select bucket..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search bucket..." />
          <CommandList>
            <CommandEmpty>No bucket found.</CommandEmpty>
            <CommandGroup>
              {buckets.map((bucket) => (
                <CommandItem
                  key={bucket.id}
                  value={bucket.id}
                  onSelect={() => {
                    // Find the full bucket to set
                    const selectedBucket = buckets.find(b => b.id === bucket.id);
                    if (selectedBucket) {
                      setCurrentBucket(selectedBucket as any);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentBucket?.id === bucket.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {bucket.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  router.push('/buckets/new');
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Bucket
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 