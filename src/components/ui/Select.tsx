import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, id, className = '', disabled, ...props }, ref) => {
    const selectId = id || props.name || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            className={`w-full min-h-[48px] pl-4 pr-10 py-2.5 rounded-xl border text-sm appearance-none transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 ${
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>

        {error ? (
          <p id={`${selectId}-error`} className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
