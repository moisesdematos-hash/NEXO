import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'A carregar informação...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
      {label && <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        {content}
      </div>
    );
  }

  return content;
};
