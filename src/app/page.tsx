import FileManager from '@/components/FileManager'
import { BucketManager } from '@/components/bucket/bucket-manager'

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            S3 Navigator
          </h1>
          <div className="flex items-center space-x-4">
            <a 
              href="https://cloud.digitalocean.com/spaces" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Spaces Dashboard
            </a>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="md:col-span-1">
          <BucketManager />
        </div>
        <div className="md:col-span-3">
          <FileManager />
        </div>
      </div>
    </div>
  )
}
