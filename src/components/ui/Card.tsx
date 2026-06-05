import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined';
  interactive?: boolean;
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  elevated: 'bg-surface text-on-surface shadow-elevation-level1',
  filled: 'bg-surface-container-high text-on-surface',
  outlined: 'bg-surface text-on-surface border border-outline-variant',
};

export function Card({
  variant = 'elevated',
  interactive,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 transition-all duration-200',
        variantClasses[variant],
        interactive && 'cursor-pointer hover:shadow-elevation-level2 active:shadow-elevation-level0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
