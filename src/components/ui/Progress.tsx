import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  showPercent = true,
  size = 'md',
  color = 'primary',
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    primary: 'bg-indigo-600 dark:bg-indigo-500',
    success: 'bg-emerald-600 dark:bg-emerald-500',
    warning: 'bg-amber-500 dark:bg-amber-400',
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>{label}</span>
          {showPercent && <span>{Math.round(normalizedValue)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`h-full ${colors[color]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${normalizedValue}%` }}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
