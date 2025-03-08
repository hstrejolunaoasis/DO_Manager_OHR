'use client'
import { PaneProvider } from '../contexts/PaneContext'
import { FileOperationsProvider } from '../contexts/FileOperationsContext'
import { UIStateProvider } from '../contexts/UIStateContext'
import { FileNavigationProvider } from '../contexts/FileNavigationContext'
import { SplitViewContainer } from './fileManager/SplitViewContainer'
import { Modals } from './fileManager/Modals'

export default function FileManager() {
  return (
    <PaneProvider>
      <FileOperationsProvider>
        <UIStateProvider>
          <FileNavigationProvider>
            <div className="h-full flex flex-col bg-white rounded-lg shadow">
              <SplitViewContainer />
              <Modals />
            </div>
          </FileNavigationProvider>
        </UIStateProvider>
      </FileOperationsProvider>
    </PaneProvider>
  )
} 