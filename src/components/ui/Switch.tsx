import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, id, className = '', disabled, checked, onChange, ...props }, ref) => {
    const switchId = id || React.useId();

    return (
      <label
        htmlFor={switchId}
        className={`inline-flex items-center justify-between gap-4 select-none cursor-pointer w-full min-h-[48px] py-1.5 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {(label || description) && (
          <div className="text-sm">
            {label && (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
        )}

        <div className="relative shrink-0">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className="w-12 h-7 rounded-full bg-slate-300 dark:bg-slate-700 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500 transition-colors duration-200" />
          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 peer-checked:translate-x-5" />
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';
