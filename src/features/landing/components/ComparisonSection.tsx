import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { NexoLogo } from '../../../components/ui/NexoLogo';

export const ComparisonSection: React.FC = () => {
  const comparisonItems = [
    {
      feature: 'Funciona 100% Offline (PWA Instalação Nativa)',
      nexo: true,
      others: false,
      note: 'Guarda os dados no teu dispositivo',
    },
    {
      feature: 'Ditado & Assistente de Voz em Português',
      nexo: true,
      others: false,
      note: 'Cria tarefas e notas sem digitar',
    },
    {
      feature: 'Gamificação com Pontos XP e Níveis de Evolução',
      nexo: true,
      others: false,
      note: 'Torna o cumprimento de metas motivador',
    },
    {
      feature: 'Orçamento Familiar com Aviso de Limite & Scanner Recibos',
      nexo: true,
      others: false,
      note: 'Calcula o limite mensal automaticamente',
    },
    {
      feature: 'Exportação 1-Clique Google Calendar & Ficheiro .ICS',
      nexo: true,
      others: false,
      note: 'Integrado com a tua agenda favorita',
    },
    {
      feature: 'Partilha Prática de Listas para WhatsApp',
      nexo: true,
      others: true,
      note: 'Formatação direta e limpa em texto',
    },
    {
      feature: 'Privacidade Total (Sem rastreio nem venda de dados)',
      nexo: true,
      others: false,
      note: 'Arquitetura Local-First',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} />
            <span>Porquê Mudar para o NEXO?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            NEXO vs Ferramentas Tradicionais
          </h2>
          <p className="mt-3 text-slate-400 text-base">
            Vê a diferença entre uma plataforma moderna focada no teu bem-estar e apps dispersas do passado.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto bg-slate-800/80 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="grid grid-cols-12 bg-slate-950/70 p-4 sm:p-6 border-b border-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wider items-center">
            <div className="col-span-6 sm:col-span-6 text-slate-300">Recurso / Capacidade</div>
            <div className="col-span-3 sm:col-span-3 text-center flex items-center justify-center">
              <NexoLogo variant="compact" size="sm" showBadge={false} />
            </div>
            <div className="col-span-3 sm:col-span-3 text-center text-slate-400">Outras Apps</div>
          </div>

          <div className="divide-y divide-slate-700/50">
            {comparisonItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-700/20 transition-colors">
                <div className="col-span-6 sm:col-span-6 pr-2">
                  <div className="font-semibold text-white text-xs sm:text-sm">{item.feature}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.note}</div>
                </div>
                <div className="col-span-3 sm:col-span-3 flex justify-center">
                  {item.nexo ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-sm">
                      <Check size={18} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                      <X size={18} />
                    </div>
                  )}
                </div>
                <div className="col-span-3 sm:col-span-3 flex justify-center">
                  {item.others ? (
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center">
                      <Check size={16} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                      <X size={16} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
