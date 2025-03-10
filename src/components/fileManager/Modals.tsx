import { useFileManager } from '../../contexts/FileManagerContext'
import { NewFolderModal } from '../ui/NewFolderModal'
import { RenameModal } from '../ui/RenameModal'
import { PrivacyModal } from '../ui/PrivacyModal'

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
    handleSetPrivacy
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
    </>
  )
}