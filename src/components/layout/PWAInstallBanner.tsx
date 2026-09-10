import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export const PWAInstallBanner: React.FC = () => {
  const { showToast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('nexo_pwa_dismissed') === 'true';
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      showToast('iOS (Safari): Partilhar → "Adicionar ao Ecrã Principal". Android/Chrome: Menu 3 pontos → "Instalar Aplicação".', 'info');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('nexo_pwa_dismissed', 'true');
  };

  if (isDismissed || isInstalled) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white px-4 py-2.5 shadow-lg border-b border-indigo-500/20 relative z-40 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/30 text-amber-400 shrink-0">
            <Smartphone size={16} />
          </div>
          <span className="truncate font-semibold text-indigo-100">
            Instale a app <strong className="text-white">NEXO</strong> no seu telemóvel para acesso rápido e offline!
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleInstallClick}
            variant="primary"
            size="sm"
            leftIcon={<Download size={14} />}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 border-none font-extrabold text-[11px] py-1 h-auto"
          >
            Instalar App
          </Button>

          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Fechar aviso"
          >
            <X size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PWAInstallBanner;
