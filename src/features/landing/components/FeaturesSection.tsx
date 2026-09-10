import React from 'react';
import { 
  Users, GraduationCap, BookOpen, Volume2, Calendar, 
  Smartphone, ArrowRight, Sparkles, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesSection: React.FC = () => {
  const primaryPillars = [
    {
      icon: <Users className="text-amber-400" size={32} />,
      badge: 'Pilar 1 • Família & Casa',
      title: 'Orçamento Familiar & Chat da Casa',
      description: 'Acabe com o caos financeiro e discussões domésticas. Controle as despesas da casa com teto orçamental, divida contas e use o Chat de Família com IA para planear ementas e listas de compras sincronizadas.',
      highlights: ['Divisão de despesas e saldos em tempo real', 'Chat da família com sugestões de IA', 'Listas de supermercado partilhadas'],
      color: 'from-amber-500/20 via-orange-500/10 to-slate-900 border-amber-500/40 shadow-amber-500/10',
      tagColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    {
      icon: <GraduationCap className="text-cyan-400" size={32} />,
      badge: 'Pilar 2 • Hub Académico',
      title: 'Estudantes, Mentores IA & Exames',
      description: 'O explicador particular gratuito no bolso. Mentores de IA para Matemática, Ciências, Línguas e História, com simuladores de testes com correção imediata, flashcards e calculadora de média final.',
      highlights: ['Professores de IA 24h para todas as disciplinas', 'Simulador de exames com correção passo a passo', 'Temporizador Pomodoro com sons binaurais'],
      color: 'from-cyan-500/20 via-blue-500/10 to-slate-900 border-cyan-500/40 shadow-cyan-500/10',
      tagColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    },
    {
      icon: <BookOpen className="text-purple-400" size={32} />,
      badge: 'Pilar 3 • Autodidata',
      title: 'Aprender Qualquer Assunto com IA',
      description: 'Transforme curiosidade em conhecimento prático. Peça à IA para desenhar uma trilha de estudo estruturada para qualquer tópico, acompanhe os seus livros com resumos inteligentes e pratique com quizzes diários.',
      highlights: ['Cursos personalizados gerados por IA em segundos', 'Acompanhamento de metas de leitura anual', 'Quizzes e desafios para reter conhecimento'],
      color: 'from-purple-500/20 via-indigo-500/10 to-slate-900 border-purple-500/40 shadow-purple-500/10',
      tagColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
  ];

  const secondaryFeatures = [
    {
      icon: <Volume2 className="text-indigo-400" size={22} />,
      title: 'Voz Nativa & Ditado',
      description: 'Dite tarefas e listas com a sua voz ou ouça o resumo motivacional do dia em áudio.',
    },
    {
      icon: <Calendar className="text-emerald-400" size={22} />,
      title: 'Agenda & Google Calendar',
      description: 'Planeamento visual com exportação instantânea para Google Calendar, Apple e Outlook (.ics).',
    },
    {
      icon: <Smartphone className="text-rose-400" size={22} />,
      title: 'PWA Nativo & 100% Offline',
      description: 'Instale no telemóvel como app nativa e use tudo mesmo sem Internet com privacidade total.',
    },
  ];

  return (
    <section id="recursos" className="py-20 md:py-32 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-extrabold text-xs tracking-wider uppercase">
            <Sparkles size={14} className="text-amber-400" /> Os 3 Grandes Pilares do NEXO
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Uma plataforma completa para tudo o que mais importa.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Concebido para famílias que procuram harmonia, estudantes que querem notas de topo e quem deseja nunca parar de aprender.
          </p>
        </div>

        {/* 3 Main Highlight Pillar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {primaryPillars.map((p, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl bg-gradient-to-b ${p.color} border backdrop-blur-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between shadow-2xl space-y-6 group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner group-hover:rotate-6 transition-transform">
                    {p.icon}
                  </div>
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${p.tagColor}`}>
                    {p.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight pt-2">
                  {p.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/10">
                {p.highlights.map((h, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Supporting Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {secondaryFeatures.map((sf, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {sf.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">{sf.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{sf.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-2xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="font-extrabold text-xl text-white">Pronto para transformar a sua rotina e da sua família?</h4>
            <p className="text-xs sm:text-sm text-indigo-200/80">Acesso instantâneo, 100% gratuito e sem necessidade de cartão de crédito.</p>
          </div>

          <Link
            to="/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-base transition-all shadow-xl flex items-center gap-2 shrink-0 border border-white/20"
          >
            <span>Criar Conta Gratuita</span>
            <ArrowRight size={18} className="text-amber-300" />
          </Link>
        </div>

      </div>
    </section>
  );
};
