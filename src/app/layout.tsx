import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Digital Ocean Assets Manager',
  description: 'Manage your Digital Ocean Space assets efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full dark:bg-background dark:text-foreground`}>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            },
          }}
        />
        <main className="h-full">
          {children}
        </main>
      </body>
    </html>
  )
}
