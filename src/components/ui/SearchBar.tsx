import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search files and folders...' }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-text-tertiary" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-10 py-2 border border-border rounded-md leading-5 bg-card text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm dark:bg-accent"
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-secondary"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
} 