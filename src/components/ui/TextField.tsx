import { type InputHTMLAttributes, type ReactNode, useState, useId } from 'react';
import { cn } from '../../lib/utils';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'filled' | 'outlined';
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

export function TextField({
  variant = 'filled',
  label,
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  fullWidth,
  className,
  value,
  ...props
}: TextFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';
  const isActive = focused || hasValue;

  return (
    <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
      <div
        className={cn(
          'relative flex items-center gap-2 transition-all duration-150',
          variant === 'filled' && [
            'bg-surface-container-highest rounded-t-lg rounded-b-xs',
            'border-b-2',
            error ? 'border-error' : focused ? 'border-primary' : 'border-outline-variant',
          ],
          variant === 'outlined' && [
            'bg-surface rounded-lg border',
            error ? 'border-error' : focused ? 'border-primary border-2' : 'border-outline-variant',
          ],
          error && focused && 'border-error',
          className,
        )}
      >
        {leadingIcon && (
          <span className={cn('pl-3 flex items-center', error ? 'text-error' : focused ? 'text-primary' : 'text-on-surface-variant')}>
            {leadingIcon}
          </span>
        )}
        <input
          id={id}
          value={value}
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          className={cn(
            'w-full bg-transparent outline-none py-3 text-body-large text-on-surface',
            'placeholder:text-on-surface-variant/60',
            leadingIcon ? 'pl-0' : 'pl-3',
            trailingIcon ? 'pr-0' : 'pr-3',
          )}
        />
        {trailingIcon && (
          <span className={cn('pr-3 flex items-center', error ? 'text-error' : focused ? 'text-primary' : 'text-on-surface-variant')}>
            {trailingIcon}
          </span>
        )}
      </div>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'transition-all duration-150',
            variant === 'filled' && [
              isActive ? 'text-label-small -mb-1' : 'text-body-large absolute pointer-events-none',
            ],
            error ? 'text-error' : focused ? 'text-primary' : 'text-on-surface-variant',
          )}
        >
          {label}
        </label>
      )}
      {(error || helperText) && (
        <span className={cn('text-label-small pl-3', error ? 'text-error' : 'text-on-surface-variant')}>
          {error || helperText}
        </span>
      )}
    </div>
  );
}
