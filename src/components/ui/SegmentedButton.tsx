import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Segment {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface SegmentedButtonProps {
  segments: Segment[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
  className?: string;
}

export function SegmentedButton({ segments, value, onChange, multi, className }: SegmentedButtonProps) {
  const isActive = (key: string) => (multi ? (value as string[]).includes(key) : value === key);

  const handleClick = (key: string) => {
    if (multi) {
      const current = value as string[];
      onChange(current.includes(key) ? current.filter(k => k !== key) : [...current, key]);
    } else {
      onChange(key);
    }
  };

  return (
    <div className={cn('inline-flex rounded-full border border-outline-variant overflow-hidden', className)}>
      {segments.map((seg, i) => (
        <button
          key={seg.key}
          onClick={() => handleClick(seg.key)}
          className={cn(
            'flex items-center justify-center gap-1.5 px-4 h-9 text-label-large transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            i > 0 && 'border-l border-outline-variant',
            isActive(seg.key)
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface text-on-surface-variant hover:bg-surface-container-high',
          )}
        >
          {seg.icon && <span className="size-4">{seg.icon}</span>}
          <span>{seg.label}</span>
        </button>
      ))}
    </div>
  );
}
