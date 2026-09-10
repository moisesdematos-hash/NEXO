import React, { useState } from 'react';
import { 
  Sliders, Save
} from 'lucide-react';

interface FeatureFlag {
  id: string;
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'ai' | 'integrations' | 'security';
}

export const FeatureFlagsTab: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      id: 'flag-1',
      key: 'ENABLE_GOOGLE_OAUTH',
      title: 'Autenticação Segura com Google OAuth',
      description: 'Ativa o login em 1-clique com conta Google e sincronização instantânea de perfil.',
      enabled: true,
      category: 'security',
    },
    {
      id: 'flag-2',
      key: 'ENABLE_RECEIPT_SCANNER_AI',
      title: 'Scanner de Recibos por IA no Chat',
      description: 'Ativa a leitura de fotos de recibos no chat com extração automática de valor e categoria.',
      enabled: true,
      category: 'ai',
    },
    {
      id: 'flag-3',
      key: 'ENABLE_VOICE_SYNTHESIS',
      title: 'Síntese & Ditado por Voz Nativa',
      description: 'Leitura em voz alta do briefing do dia (TTS) e ditado verbal de tarefas.',
      enabled: true,
      category: 'core',
    },
    {
      id: 'flag-4',
      key: 'ENABLE_GCAL_EXPORT',
      title: 'Exportação Direta para Google Calendar & .ICS',
      description: 'Ativa os botões de adicionar à agenda em 1-clique.',
      enabled: true,
      category: 'integrations',
    },
    {
      id: 'flag-5',
      key: 'MAINTENANCE_MODE',
      title: 'Modo de Manutenção do Sistema',
      description: 'Exibe um banner informativo global para todos os utilizadores (apenas admins continuam).',
      enabled: false,
      category: 'security',
    },
  ]);

  // Load flags from localStorage on mount if saved
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('nexo_feature_flags');
      if (saved) {
        setFlags(JSON.parse(saved));
      }
    } catch { /* ignore */ }
  }, []);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const toggleFlag = (id: string) => {
    setFlags((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
      try {
        localStorage.setItem('nexo_feature_flags', JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };

  const handleSaveFlags = () => {
    try {
      localStorage.setItem('nexo_feature_flags', JSON.stringify(flags));
    } catch { /* ignore */ }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 p-6 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-600/30 border border-amber-400/30 text-amber-300 shadow-inner">
            <Sliders size={32} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Feature Flags &amp; Toggles do Sistema</h3>
            <p className="text-xs text-slate-300 mt-1">
              Ativação e desativação em tempo real de funcionalidades globais sem necessidade de novo deploy.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveFlags}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Save size={16} />
          <span>{savedSuccess ? 'Flags Guardadas!' : 'Guardar Alterações'}</span>
        </button>
      </div>

      {/* Flags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
              flag.enabled
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/40 opacity-75'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {flag.key}
                </span>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    flag.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      flag.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                {flag.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {flag.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">Estado:</span>
              <span className={flag.enabled ? 'text-emerald-500' : 'text-slate-400'}>
                {flag.enabled ? '🟢 Ativo Globalmente' : '⚪ Desativado'}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
