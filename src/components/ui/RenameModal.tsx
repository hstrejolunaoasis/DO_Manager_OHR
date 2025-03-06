import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PencilIcon } from '@heroicons/react/24/outline'

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (newName: string) => Promise<void>
  currentName: string
}

export function RenameModal({ isOpen, onClose, onSubmit, currentName }: RenameModalProps) {
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName)
    }
  }, [isOpen, currentName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || newName.trim() === currentName) return

    setIsSubmitting(true)
    try {
      await onSubmit(newName.trim())
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
                  <PencilIcon className="h-6 w-6 mr-2 text-primary" />
                  Rename File
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newName" className="block text-sm font-medium text-text-primary">
                        New Name
                      </label>
                      <input
                        type="text"
                        id="newName"
                        name="newName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-border bg-card dark:bg-accent/50 shadow-sm text-text-primary placeholder-text-tertiary focus:border-primary focus:ring-primary sm:text-sm transition-colors"
                        placeholder="Enter new name"
                        autoComplete="off"
                        required
                      />
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
                      disabled={isSubmitting || !newName.trim() || newName.trim() === currentName}
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-accent disabled:bg-primary/70"
                    >
                      {isSubmitting ? 'Renaming...' : 'Rename'}
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