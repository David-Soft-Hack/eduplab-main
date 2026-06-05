import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<string, string> = {
  filled:
    'bg-primary text-on-primary hover:brightness-110 active:brightness-90 shadow-elevation-level1',
  tonal:
    'bg-secondary-container text-on-secondary-container hover:brightness-95 active:brightness-90',
  elevated:
    'bg-surface text-primary shadow-elevation-level1 hover:shadow-elevation-level2 active:shadow-elevation-level0',
  outlined:
    'border border-outline text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10',
  text: 'text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 gap-1 text-[11px] font-medium tracking-[0.5px]',
  md: 'h-10 px-5 gap-2 text-[13px] font-medium tracking-[0.4px]',
  lg: 'h-12 px-6 gap-2 text-[14px] font-medium tracking-[0.4px]',
};

export function Button({
  variant = 'filled',
  size = 'md',
  loading,
  icon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full select-none transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-38 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="size-[18px] flex items-center justify-center">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}
