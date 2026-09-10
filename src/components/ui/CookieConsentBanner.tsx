import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, Check, X } from 'lucide-react';

const STORAGE_KEY = 'nexo_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Delay slightly for smooth entrance after page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(STORAGE_KEY, 'all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(STORAGE_KEY, 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-5 shadow-2xl text-slate-200 text-xs sm:text-sm space-y-4">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
              <Cookie size={18} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Privacidade &amp; Cookies</h4>
              <p className="text-[11px] text-slate-400">Transparência e controlo total dos seus dados</p>
            </div>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
            title="Fechar"
            aria-label="Fechar banner de cookies"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-slate-300 leading-relaxed text-xs">
          O NEXO utiliza armazenamento local e cookies essenciais para autenticação segura com Google/Email e personalização da sua experiência. Não vendemos os seus dados nem usamos rastreadores invasivos de terceiros.
        </p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-indigo-400">
          <ShieldCheck size={13} className="text-emerald-400 inline" />
          <span>Em conformidade com RGPD e Google OAuth.</span>
          <Link to="/privacy" className="underline hover:text-indigo-300 font-semibold">
            Ler Política
          </Link>
          <span>•</span>
          <Link to="/terms" className="underline hover:text-indigo-300 font-semibold">
            Termos
          </Link>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Check size={14} />
            <span>Aceitar Todos</span>
          </button>

          <button
            onClick={handleAcceptEssential}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
          >
            Apenas Essenciais
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookieConsentBanner;
