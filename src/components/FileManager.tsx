'use client'
import { FileManagerProvider } from '../contexts/FileManagerContext'
import { TopBar } from './fileManager/TopBar'
import { FileContent } from './fileManager/FileContent'
import { Modals } from './fileManager/Modals'

export default function FileManager() {
  return (
    <FileManagerProvider>
      <div className="h-full flex flex-col bg-white rounded-lg shadow">
        <TopBar />
        <FileContent />
        <Modals />
      </div>
    </FileManagerProvider>
  )
} 