import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { BucketProvider } from '@/context/bucket-context'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'S3 Navigator',
  description: 'Manage your S3 Assets efficiently',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  // Get default bucket for authenticated users
  let defaultBucket = null
  if (session?.user) {
    defaultBucket = await db.bucket.findFirst({
      where: {
        ownerId: session.user.id,
        isDefault: true
      }
    })
  }
  
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Toaster position="top-right" />
        <BucketProvider initialBucket={defaultBucket}>
          <main className="h-full">
            {children}
          </main>
        </BucketProvider>
      </body>
    </html>
  )
}
