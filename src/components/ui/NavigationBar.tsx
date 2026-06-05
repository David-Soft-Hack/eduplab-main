import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface NavigationBarProps {
  items: NavItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export function NavigationBar({ items, value, onChange, className }: NavigationBarProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 h-20 bg-surface-container-low border-t border-outline-variant',
        'flex items-center justify-around px-2 pb-2 safe-area-inset-bottom',
        className,
      )}
    >
      {items.map(item => {
        const isActive = item.key === value;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5 h-full min-w-[64px] px-3 rounded-full transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive ? 'text-on-surface' : 'text-on-surface-variant',
            )}
          >
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-18px)] min-w-[16px] h-4 px-1 bg-error text-on-error rounded-full text-[9px] font-medium flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
            <span className={cn('size-6 flex items-center justify-center', isActive && 'text-primary')}>
              {item.icon}
            </span>
            <span className={cn(
              'text-[11px] font-medium tracking-[0.5px] leading-none',
              isActive && 'font-bold',
            )}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute top-0 w-16 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
