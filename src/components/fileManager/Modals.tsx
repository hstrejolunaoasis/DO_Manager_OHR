import { usePane } from '../../contexts/PaneContext'
import { useFileOperations } from '../../contexts/FileOperationsContext'
import { NewFolderModal } from '../ui/NewFolderModal'
import { RenameModal } from '../ui/RenameModal'

export function Modals() {
  const { getActivePane } = usePane()
  const {
    isNewFolderModalOpen,
    setIsNewFolderModalOpen,
    isRenameModalOpen,
    setIsRenameModalOpen,
    fileToRename,
    setFileToRename,
    handleCreateFolder,
    handleRename,
  } = useFileOperations()

  const activePane = getActivePane()
  const activeTab = activePane.tabs.find(t => t.id === activePane.activeTabId)

  return (
    <>
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onSubmit={(name) => handleCreateFolder(name, activeTab?.path || '')}
        currentPath={activeTab?.path || ''}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false)
          setFileToRename(null)
        }}
        onSubmit={handleRename}
        currentName={fileToRename?.Key.split('/').pop() || ''}
      />
    </>
  )
} 