import { useFileManager } from '../../contexts/FileManagerContext'
import { NewFolderModal } from '../ui/NewFolderModal'
import { RenameModal } from '../ui/RenameModal'
import { PrivacyModal } from '../ui/PrivacyModal'
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal'

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
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
    fileToSetPrivacy,
    setFileToSetPrivacy,
    handleSetPrivacy,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    itemToDelete,
    setItemToDelete,
    handleDeleteConfirm
  } = useFileManager()

  return (
    <>
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false)
          setFileToRename(null)
        }}
        onSubmit={handleRename}
        currentName={fileToRename?.Key.split('/').pop() || ''}
        isDirectory={fileToRename?.Key.endsWith('/')}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => {
          setIsPrivacyModalOpen(false)
          setFileToSetPrivacy(null)
        }}
        onSubmit={handleSetPrivacy}
        filename={fileToSetPrivacy?.file.name || ''}
        remainingCount={fileToSetPrivacy?.remainingFiles?.length || 0}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.key.split('/').pop() || ''}
        isDirectory={itemToDelete?.isDirectory || false}
        itemCount={itemToDelete?.itemCount || 0}
      />
    </>
  )
}