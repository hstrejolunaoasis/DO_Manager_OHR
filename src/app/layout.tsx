import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { RootProvider } from '@/contexts/fileManager/RootProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'S3 Navigator',
  description: 'Manage your S3 Assets efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Toaster position="top-right" />
        <main className="h-full">
          <RootProvider>
            {children}
          </RootProvider>
        </main>
      </body>
    </html>
  )
}
