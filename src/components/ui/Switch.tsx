import { type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md';
}

export function Switch({ size = 'md', checked, onChange, disabled, className, ...props }: SwitchProps) {
  const dimensions = size === 'sm' ? { track: 'w-8 h-4', thumb: 'size-3.5', translate: 'translate-x-4' } : { track: 'w-11 h-6', thumb: 'size-5', translate: 'translate-x-5' };

  return (
    <label
      className={cn(
        'relative inline-flex items-center cursor-pointer select-none',
        disabled && 'opacity-38 cursor-default',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <div
        className={cn(
          dimensions.track,
          'rounded-full transition-colors duration-200',
          checked ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
        )}
      >
        <div
          className={cn(
            dimensions.thumb,
            'rounded-full bg-white shadow-elevation-level1 transition-transform duration-200',
            checked && dimensions.translate,
            !checked && 'translate-x-0.5',
          )}
        />
      </div>
    </label>
  );
}
