'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          // Variants
          variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
          variant === 'outline' && 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
          variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
          variant === 'ghost' && 'hover:bg-gray-100 hover:text-gray-900 text-gray-700',
          variant === 'link' && 'text-blue-600 hover:underline',
          // Sizes
          size === 'default' && 'h-10 py-2 px-4',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'lg' && 'h-12 px-6 text-base',
          size === 'icon' && 'h-10 w-10',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
); 