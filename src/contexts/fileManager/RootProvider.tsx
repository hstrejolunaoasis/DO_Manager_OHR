'use client'

import { ReactNode } from 'react'
import { FileManagerProvider } from '../FileManagerContext'
import { FileOperationsProvider } from './FileOperationsContext'
import { HistoryProvider } from './HistoryContext'

interface RootProviderProps {
  children: ReactNode
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <FileManagerProvider>
      <FileOperationsProvider>
        <HistoryProvider>
          {children}
        </HistoryProvider>
      </FileOperationsProvider>
    </FileManagerProvider>
  )
}