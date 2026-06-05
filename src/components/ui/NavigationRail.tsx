import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface RailItem {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface NavigationRailProps {
  items: RailItem[];
  value: string;
  onChange: (key: string) => void;
  header?: ReactNode;
  className?: string;
}

export function NavigationRail({ items, value, onChange, header, className }: NavigationRailProps) {
  return (
    <nav
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 w-20 bg-surface-container-low border-r border-outline-variant',
        'flex flex-col items-center py-3 gap-2',
        className,
      )}
    >
      {header && <div className="mb-2">{header}</div>}
      <div className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {items.map(item => {
          const isActive = item.key === value;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 w-full py-3 rounded-full transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-highest',
              )}
              title={item.label}
            >
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-2 min-w-[14px] h-3.5 px-1 bg-error text-on-error rounded-full text-[8px] font-medium flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              <span className="size-6 flex items-center justify-center">{item.icon}</span>
              <span className={cn(
                'text-[10px] font-medium leading-tight text-center max-w-[64px] truncate',
                isActive && 'font-bold',
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
