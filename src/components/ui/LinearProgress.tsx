import { cn } from '../../lib/utils';

interface LinearProgressProps {
  value?: number;
  indeterminate?: boolean;
  className?: string;
}

export function LinearProgress({ value, indeterminate, className }: LinearProgressProps) {
  return (
    <div
      className={cn('relative h-1 w-full overflow-hidden rounded-full bg-surface-container-highest', className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full bg-primary transition-all duration-300',
          indeterminate && 'absolute w-1/2 animate-[md3-indeterminate_2s_infinite]',
        )}
        style={indeterminate ? undefined : { width: `${value ?? 0}%` }}
      />
    </div>
  );
}
