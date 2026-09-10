import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocorreu um erro',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-4 my-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
        <AlertCircle size={26} />
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">{title}</h3>
        <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm">
          Tentar Novamente
        </Button>
      )}
    </div>
  );
};
