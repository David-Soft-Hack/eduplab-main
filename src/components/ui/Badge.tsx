import { cn } from '../../lib/utils';

interface BadgeProps {
  count?: number;
  max?: number;
  dot?: boolean;
  className?: string;
}

export function Badge({ count, max = 99, dot, className }: BadgeProps) {
  if (!dot && (count === undefined || count === 0)) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center bg-error text-on-error font-medium',
        dot
          ? 'size-2 rounded-full'
          : 'min-w-[18px] h-[18px] px-1.5 rounded-full text-[11px] leading-none',
        className,
      )}
    >
      {!dot && count !== undefined && (count > max ? `${max}+` : count)}
    </span>
  );
}
