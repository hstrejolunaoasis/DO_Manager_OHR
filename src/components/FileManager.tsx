'use client'
import { FileManagerProvider } from '../contexts/FileManagerContext'
import { SplitViewContainer } from './fileManager/SplitViewContainer'
import { Modals } from './fileManager/Modals'
import { useBucket } from '@/contexts/BucketContext'

export default function FileManager() {
  const { currentBucket } = useBucket();
  
  if (!currentBucket) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow">
        <p className="text-gray-500">Please select a bucket to view files</p>
      </div>
    );
  }
  
  return (
    <FileManagerProvider>
      <div className="h-full flex flex-col bg-white rounded-lg shadow">
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800">
            Bucket: <span className="font-bold">{currentBucket.name}</span>
          </h2>
        </div>
        <SplitViewContainer />
        <Modals />
      </div>
    </FileManagerProvider>
  )
} 