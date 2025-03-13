'use client'

import { PaneProvider } from '../contexts/fileManager/PaneContext'
import { UIStateProvider } from '../contexts/fileManager/UIStateContext'
import { FileOperationsProvider } from '../contexts/fileManager/FileOperationsContext'
import { HistoryProvider } from '../contexts/fileManager/HistoryContext'
import { SplitViewContainer } from './fileManager/SplitViewContainer'
import { Modals } from './fileManager/Modals'

export default function FileManager() {
  return (
    <UIStateProvider>
      <FileOperationsProvider>
        <PaneProvider>
          <HistoryProvider>
            <div className="h-full flex flex-col bg-white rounded-lg shadow">
              <SplitViewContainer />
              <Modals />
            </div>
          </HistoryProvider>
        </PaneProvider>
      </FileOperationsProvider>
    </UIStateProvider>
  )
}