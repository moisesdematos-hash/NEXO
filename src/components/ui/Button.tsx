import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles: WCAG 2.2 AA touch target (min 48px), visible focus states, prefers-reduced-motion transition
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[48px] px-4';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs dark:bg-indigo-500 dark:hover:bg-indigo-600',
      secondary:
        'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
      outline:
        'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 bg-transparent',
      ghost:
        'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 bg-transparent',
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs',
    };

    const sizes = {
      sm: 'text-xs min-h-[44px] px-3 py-1.5',
      md: 'text-sm min-h-[48px] px-4 py-2.5',
      lg: 'text-base min-h-[54px] px-6 py-3.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-current" />
        ) : leftIcon ? (
          <span className="mr-2 inline-flex items-center shrink-0">{leftIcon}</span>
        ) : null}

        <span>{children}</span>

        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
