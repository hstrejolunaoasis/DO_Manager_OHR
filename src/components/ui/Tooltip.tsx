import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className={`absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity
        ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
        left-1/2 transform -translate-x-1/2`}>
        <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap">
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45
            left-1/2 -translate-x-1/2
            ${position === 'top' ? '-bottom-1' : '-top-1'}`}>
          </div>
        </div>
      </div>
    </div>
  );
} 