import React from 'react';

interface NexoLogoProps {
  variant?: 'full' | 'icon' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const NexoLogo: React.FC<NexoLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showBadge = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon Mark */}
      <div
        className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-950 p-1.5 shadow-lg shadow-indigo-500/20 border border-slate-700/50 group-hover:scale-105 transition-transform duration-200`}
      >
        {/* Glow halo behind icon */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 opacity-80 blur-sm -z-10 group-hover:opacity-100 transition-opacity" />
        
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow"
        >
          <defs>
            <linearGradient id="nexoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="nexoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          
          {/* Interlocking N shapes */}
          <path
            d="M 22 80 L 22 20 L 45 20 L 78 80 L 78 20"
            stroke="url(#nexoGrad1)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glowing node connection accent */}
          <circle cx="22" cy="20" r="7" fill="#60A5FA" />
          <circle cx="78" cy="80" r="7" fill="#A78BFA" />
          <circle cx="45" cy="20" r="5" fill="#38BDF8" />
          <path
            d="M 22 50 L 78 50"
            stroke="url(#nexoGrad2)"
            strokeWidth="4"
            strokeDasharray="4 4"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${textSizes[size]} bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-indigo-200`}
            >
              NEXO
            </span>
            {showBadge && variant === 'full' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                HUB
              </span>
            )}
          </div>
          {variant === 'full' && (
            <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-0.5">
              Inteligência Pessoal &amp; Familiar
            </span>
          )}
        </div>
      )}
    </div>
  );
};
