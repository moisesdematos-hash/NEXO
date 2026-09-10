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
      {/* Logo Icon Mark */}
      <div
        className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-indigo-500/25 border border-indigo-400/30 group-hover:scale-105 transition-transform duration-200 bg-slate-950`}
      >
        {/* Glow halo behind icon */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 opacity-70 blur-xs -z-10 group-hover:opacity-100 transition-opacity" />
        
        <img
          src="/logos/nexo-logo-master.jpg"
          alt="NEXO Logo"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            // Fallback se imagem não carregar
            e.currentTarget.style.display = 'none';
          }}
        />
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
