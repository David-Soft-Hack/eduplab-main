import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TopAppBarProps {
  title: string;
  leading?: ReactNode;
  actions?: ReactNode;
  variant?: 'small' | 'center' | 'medium' | 'large';
  className?: string;
}

export function TopAppBar({ title, leading, actions, variant = 'small', className }: TopAppBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-surface-container bg-opacity-90 backdrop-blur-md',
        variant === 'small' && 'h-16',
        variant === 'center' && 'h-16',
        variant === 'medium' && 'h-28',
        variant === 'large' && 'h-40',
        className,
      )}
    >
      <div className="flex items-center h-full px-4 gap-2">
        {leading && <div className="flex items-center">{leading}</div>}
        <div className={cn('flex-1 min-w-0', variant === 'center' && 'text-center')}>
          <h1 className={cn(
            'text-on-surface font-display tracking-tight',
            variant === 'small' && 'text-title-large',
            variant === 'center' && 'text-title-large',
            variant === 'medium' && 'text-headline-small mt-6',
            variant === 'large' && 'text-headline-medium mt-12',
          )}>
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
    </header>
  );
}
