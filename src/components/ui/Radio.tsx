import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, id, className = '', disabled, checked, ...props }, ref) => {
    const radioId = id || React.useId();

    return (
      <label
        htmlFor={radioId}
        className={`inline-flex items-start gap-3 select-none cursor-pointer group min-h-[48px] py-1 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 peer-checked:border-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500 transition-colors flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-indigo-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>

        {(label || description) && (
          <div className="text-sm">
            {label && (
              <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
