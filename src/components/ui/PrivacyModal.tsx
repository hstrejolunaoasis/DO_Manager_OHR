import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (isPrivate: boolean) => void
  filename: string
  remainingCount?: number
}

export function PrivacyModal({ isOpen, onClose, onSubmit, filename, remainingCount = 0 }: PrivacyModalProps) {
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Set File Privacy
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Choose the privacy setting for <span className="font-medium">{filename}</span>
                    {remainingCount > 0 && (
                      <span className="block mt-1 text-xs text-gray-400">
                        {remainingCount} more {remainingCount === 1 ? 'file' : 'files'} remaining
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => onSubmit(false)}
                  >
                    <GlobeAltIcon className="w-5 h-5 mr-2" />
                    Public
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={() => onSubmit(true)}
                  >
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Private
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 