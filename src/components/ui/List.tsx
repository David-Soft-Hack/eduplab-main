import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ListItemProps {
  leading?: ReactNode;
  headline: string;
  supporting?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ListItem({ leading, headline, supporting, trailing, onClick, disabled, className }: ListItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-150',
        'hover:bg-on-surface/5 active:bg-on-surface/8',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        disabled && 'opacity-38 pointer-events-none',
        className,
      )}
    >
      {leading && <div className="flex items-center justify-center size-10 shrink-0 text-on-surface-variant">{leading}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-body-large text-on-surface truncate">{headline}</div>
        {supporting && <div className="text-body-small text-on-surface-variant truncate">{supporting}</div>}
      </div>
      {trailing && <div className="flex items-center shrink-0 text-on-surface-variant">{trailing}</div>}
    </button>
  );
}

interface ListProps {
  children: ReactNode;
  className?: string;
}

export function List({ children, className }: ListProps) {
  return <div className={cn('divide-y divide-outline-variant/40', className)}>{children}</div>;
}
