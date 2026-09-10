import React from 'react';
import { Star, Quote } from 'lucide-react';

export const MomentsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Marta & Pedro Silva',
      role: 'Família de 4 membros (Lisboa)',
      content: 'O NEXO mudou o dia a dia da nossa casa. As propostas da casa com votação e a leitura de talões no chat facilitaram a gestão de compras sem discussões!',
      avatar: '👨‍👩‍👧‍👦',
      rating: 5,
    },
    {
      name: 'Dr. Afonso Carvalho',
      role: 'Médico & Profissional de Saúde',
      content: 'A síntese de voz nativa permite-me ouvir o briefing do meu dia no carro antes de chegar ao hospital. A exportação da agenda em .ics para o Outlook é perfeita.',
      avatar: '👨‍⚕️',
      rating: 5,
    },
    {
      name: 'Beatriz Santos',
      role: 'Estudante Universitária',
      content: 'O sistema de XP e desdobramento de metas com IA dá-me uma motivação gigante para estudar. Já atingi o Nível 4 e não troco por nenhuma outra app.',
      avatar: '👩‍🎓',
      rating: 5,
    },
  ];

  return (
    <section id="testemunhos" className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      
      {/* Glow */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Metric Counters Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl mb-20">
          <div className="text-center space-y-1">
            <div className="text-3xl sm:text-5xl font-black text-amber-400">100%</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Modo Offline PWA</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl sm:text-5xl font-black text-indigo-400">&lt; 1s</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Resposta da IA & Voz</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl sm:text-5xl font-black text-emerald-400">5 Níveis</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gamificação XP</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl sm:text-5xl font-black text-purple-400">0%</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Partilha Indevida de Dados</div>
          </div>
        </div>

        {/* Testimonials Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/60">
            💬 Histórias de Sucesso
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Adorado por famílias, estudantes e profissionais
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Veja o impacto real do NEXO na organização diária dos nossos utilizadores.
          </p>
        </div>

        {/* Testimonials Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 relative backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{t.avatar}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, r) => (
                      <Star key={r} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                </div>

                <Quote size={20} className="text-indigo-500/40" />

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <span className="font-extrabold text-white block text-sm">{t.name}</span>
                <span className="text-[11px] text-indigo-300 block">{t.role}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
