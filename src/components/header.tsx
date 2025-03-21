import { BucketSelector } from '@/components/bucket/bucket-selector';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function Header() {
  const session = await auth();
  
  let buckets = [];
  if (session?.user) {
    buckets = await db.bucket.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
      orderBy: { updatedAt: 'desc' },
    });
  }
  
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Logo />
          <nav className="mx-6">
            {/* ... existing navigation ... */}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {session?.user && buckets.length > 0 && (
            <BucketSelector buckets={buckets} />
          )}
          
          {/* ... existing user profile or login button ... */}
        </div>
      </div>
    </header>
  );
} 