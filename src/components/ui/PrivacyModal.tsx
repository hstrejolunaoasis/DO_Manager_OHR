import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (isPrivate: boolean) => void
  filename: string
}

export function PrivacyModal({ isOpen, onClose, onSubmit, filename }: PrivacyModalProps) {
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
                    Choose the privacy setting for: <span className="font-medium">{filename}</span>
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      onSubmit(true)
                      onClose()
                    }}
                    className="flex flex-col items-center justify-center p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <LockClosedIcon className="w-8 h-8 text-gray-600" />
                    <span className="mt-2 font-medium text-gray-900">Private</span>
                    <span className="mt-1 text-xs text-gray-500">Only authorized users can access</span>
                  </button>

                  <button
                    onClick={() => {
                      onSubmit(false)
                      onClose()
                    }}
                    className="flex flex-col items-center justify-center p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <GlobeAltIcon className="w-8 h-8 text-gray-600" />
                    <span className="mt-2 font-medium text-gray-900">Public</span>
                    <span className="mt-1 text-xs text-gray-500">Anyone can access with the URL</span>
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