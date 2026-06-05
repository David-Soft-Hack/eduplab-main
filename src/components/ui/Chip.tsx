import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'assist' | 'filter' | 'input' | 'suggestion';
  selected?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  label: string;
  onDelete?: () => void;
}

const variantClasses: Record<string, string> = {
  assist:
    'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant',
  filter:
    'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant',
  input:
    'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant',
  suggestion:
    'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant',
};

const selectedClasses = 'bg-secondary-container text-on-secondary-container border-secondary-container';

export function Chip({
  variant = 'assist',
  selected,
  icon,
  trailingIcon,
  label,
  onDelete,
  className,
  ...props
}: ChipProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium tracking-[0.1px] select-none transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected ? selectedClasses : variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon && <span className="size-[16px]">{icon}</span>}
      <span>{label}</span>
      {trailingIcon && <span className="size-[16px]">{trailingIcon}</span>}
      {onDelete && variant === 'input' && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="ml-0.5 size-4 flex items-center justify-center rounded-full hover:bg-on-surface-variant/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </button>
  );
}
