import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

interface GridSizeControlProps {
  value: number
  onChange: (size: number) => void
  min?: number
  max?: number
}

export function GridSizeControl({ value, onChange, min = 150, max = 300 }: GridSizeControlProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(Math.max(value - 25, min))
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(Math.min(value + 25, max))
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleDecrease}
        disabled={value <= min}
        className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Decrease grid size"
      >
        <MinusIcon className="w-5 h-5" />
      </button>
      <button
        onClick={handleIncrease}
        disabled={value >= max}
        className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Increase grid size"
      >
        <PlusIcon className="w-5 h-5" />
      </button>
    </div>
  )
} 