import { useFileManager } from '../../contexts/FileManagerContext'
import { NewFolderModal } from '../ui/NewFolderModal'
import { RenameModal } from '../ui/RenameModal'

export function Modals() {
  const {
    isNewFolderModalOpen,
    setIsNewFolderModalOpen,
    isRenameModalOpen,
    setIsRenameModalOpen,
    fileToRename,
    setFileToRename,
    handleCreateFolder,
    handleRename,
    activeTab
  } = useFileManager()

  return (
    <>
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
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