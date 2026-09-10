import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-slate-50/50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-4 my-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
        {icon || <Inbox size={28} />}
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
