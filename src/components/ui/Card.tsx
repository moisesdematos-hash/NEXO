import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', padding = 'md', className = '', ...props }, ref) => {
    const base = 'rounded-2xl transition-colors duration-150 overflow-hidden';

    const variants = {
      default:
        'bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs text-slate-900 dark:text-slate-100',
      flat:
        'bg-slate-100 dark:bg-slate-800/60 border border-transparent text-slate-900 dark:text-slate-100',
      outline:
        'bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100',
      interactive:
        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer text-slate-900 dark:text-slate-100 active:scale-[0.99]',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    return (
      <div ref={ref} className={`${base} ${variants[variant]} ${paddings[padding]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
