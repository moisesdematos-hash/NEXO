import React from 'react';
import { 
  Volume2, Trophy, ListChecks, PieChart, Calendar, 
  Zap, Smartphone, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Volume2 className="text-amber-400" size={24} />,
      badge: 'Voz & Inteligência',
      title: 'Síntese & Ditado por Voz Nativa',
      description: 'Ouça o briefing motivacional do seu dia em voz alta ou dite verbalmente tarefas, listas e mensagens sem precisar de digitar.',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    },
    {
      icon: <Trophy className="text-purple-400" size={24} />,
      badge: 'Gamificação & XP',
      title: 'Sistema de Níveis & Metas de Vida',
      description: 'Evolua de Aspirante Focado a Lenda do Nexo. Ganhe XP real ao concluir metas, assinalar sub-passos e cumprir prazos.',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
    },
    {
      icon: <PieChart className="text-emerald-400" size={24} />,
      badge: 'Finanças & Casa',
      title: 'Orçamento Familiar & Leitura IA',
      description: 'Scaneie talões de compras no chat com Visão por IA ou registe faturas com alertas visuais de teto orçamental.',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    },
    {
      icon: <Calendar className="text-blue-400" size={24} />,
      badge: 'Agenda & Calendário',
      title: 'Sincronização .ics & Google Cal',
      description: 'Gerencie compromissos com exportação direta para Google Calendar e ficheiros iCal (.ics) compatíveis com Outlook e Apple.',
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
    },
    {
      icon: <ListChecks className="text-indigo-400" size={24} />,
      badge: 'Listas & Partilha',
      title: 'Checklists Rápidas & WhatsApp 1-Clique',
      description: 'Modelos pré-definidos (Mala de viagem, compras) com botão de cópia formatada para enviar no WhatsApp.',
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30',
    },
    {
      icon: <Smartphone className="text-rose-400" size={24} />,
      badge: 'PWA & Acessibilidade',
      title: 'Instalação PWA & 100% Offline',
      description: 'Funciona perfeitamente sem Internet e pode ser instalada no telemóvel como app nativa, com suporte a Modo Simples.',
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
    },
  ];

  return (
    <section id="recursos" className="py-20 md:py-32 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-extrabold text-xs tracking-wider uppercase">
            <Zap size={14} className="text-amber-400" /> Recursos Exclusivos do NEXO
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Tudo o que precisas numa única experiência irresistível.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Concebido para ser ultra-rápido, bonito e acessível a toda a família sem curva de aprendizagem.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl bg-gradient-to-br ${f.color} bg-slate-950/80 border backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 space-y-4 shadow-xl group`}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner group-hover:rotate-6 transition-transform">
                  {f.icon}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {f.badge}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white tracking-tight pt-2">
                {f.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-extrabold text-lg text-white">Pronto para experimentar a revolução do NEXO?</h4>
            <p className="text-xs text-indigo-200">Sem instalar nada, pode testar todas as funcionalidades como convidado em 1-clique.</p>
          </div>

          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm transition-all shadow-lg flex items-center gap-2 shrink-0"
          >
            <span>Criar Conta Grátis</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
};
