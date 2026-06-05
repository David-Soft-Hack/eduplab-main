import { type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  indeterminate?: boolean;
  size?: 'sm' | 'md';
}

export function Checkbox({ indeterminate, checked, onChange, disabled, size = 'md', className, ...props }: CheckboxProps) {
  const boxSize = size === 'sm' ? 'size-4' : 'size-5';

  return (
    <label className={cn('inline-flex items-center cursor-pointer select-none', disabled && 'opacity-38 cursor-default', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
        ref={el => { if (el) el.indeterminate = indeterminate ?? false; }}
        {...props}
      />
      <div
        className={cn(
          boxSize,
          'rounded-sm border-2 flex items-center justify-center transition-all duration-150',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
          checked || indeterminate
            ? 'bg-primary border-primary text-on-primary'
            : 'border-outline-variant bg-transparent hover:border-on-surface',
        )}
      >
        {(checked || indeterminate) && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-3">
            {indeterminate ? (
              <path d="M6 12h12" />
            ) : (
              <path d="M5 12l4 4 9-9" />
            )}
          </svg>
        )}
      </div>
    </label>
  );
}
