import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FolderPlusIcon } from '@heroicons/react/24/outline'

interface NewFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  currentPath: string
}

export function NewFolderModal({ isOpen, onClose, onSubmit, currentPath }: NewFolderModalProps) {
  const [folderName, setFolderName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(folderName.trim())
      setFolderName('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card dark:bg-accent p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-text-primary flex items-center"
                >
                  <FolderPlusIcon className="h-6 w-6 mr-2 text-primary" />
                  Create New Folder
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="folderName" className="block text-sm font-medium text-text-primary">
                        Folder Name
                      </label>
                      <input
                        type="text"
                        id="folderName"
                        name="folderName"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-border bg-card dark:bg-accent/50 shadow-sm text-text-primary placeholder-text-tertiary focus:border-primary focus:ring-primary sm:text-sm transition-colors"
                        placeholder="Enter folder name"
                        autoComplete="off"
                        required
                      />
                    </div>
                    <div className="text-sm text-text-tertiary">
                      Location: {currentPath || 'Root'}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-border bg-card dark:bg-accent px-4 py-2 text-sm font-medium text-text-primary hover:bg-card-hover dark:hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !folderName.trim()}
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-accent disabled:bg-primary/70"
                    >
                      {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 