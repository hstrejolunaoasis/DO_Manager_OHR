'use client'
import { FileManagerProvider } from '../contexts/FileManagerContext'
import { SplitViewContainer } from './fileManager/SplitViewContainer'
import { Modals } from './fileManager/Modals'

export default function FileManager() {
  return (
    <FileManagerProvider>
      <div className="h-full flex flex-col bg-white rounded-lg shadow">
        <SplitViewContainer />
        <Modals />
      </div>
    </FileManagerProvider>
  )
} 