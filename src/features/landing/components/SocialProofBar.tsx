import React from 'react';
import { ShieldCheck, WifiOff, Sparkles, Star, Zap } from 'lucide-react';

export const SocialProofBar: React.FC = () => {
  return (
    <section className="py-8 bg-slate-900 text-white border-y border-slate-800 relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Active User Counter & Stars */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Utilizador NEXO"
                className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Utilizador NEXO"
                className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Utilizador NEXO"
                className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
              />
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                +12k
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="text-xs font-bold text-slate-200 ml-1">4.9/5</span>
              </div>
              <p className="text-xs text-slate-400">
                Escolhido por mais de <strong className="text-white">12.000 pessoas</strong> e famílias
              </p>
            </div>
          </div>

          {/* Badges ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>100% Dados Locais</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200">
              <WifiOff size={16} className="text-blue-400 shrink-0" />
              <span>Modo Offline PWA</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200">
              <Zap size={16} className="text-amber-400 shrink-0" />
              <span>Comandos de Voz</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200">
              <Sparkles size={16} className="text-purple-400 shrink-0" />
              <span>Zero Anúncios</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
