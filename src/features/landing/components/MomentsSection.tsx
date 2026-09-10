import React from 'react';
import { Star, Quote } from 'lucide-react';

export const MomentsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Marta & André Silva',
      role: 'Gestão Familiar (Porto)',
      content: 'Começámos a usar o NEXO para controlar as despesas do mês e a lista de compras. O chat com IA a sugerir jantares rápidos e equilibrados com o que temos no frigorífico poupou-nos imenso tempo e discussões da casa.',
      avatar: '👨‍👩‍👧‍👦',
      rating: 5,
    },
    {
      name: 'Tomás Ferreira',
      role: 'Estudante de Engenharia (Coimbra)',
      content: 'O mentor de IA para tirar dúvidas de Matemática e o simulador de exames com correção passo a passo salvaram a minha preparação para os testes. Poder estudar offline no telemóvel é fantástico.',
      avatar: '🎓',
      rating: 5,
    },
    {
      name: 'Sara Mendonça',
      role: 'Profissional & Autodidata (Lisboa)',
      content: 'Criei a minha trilha de finanças pessoais e acompanho as minhas metas de leitura anual num só lugar. É raro encontrar uma ferramenta tão limpa, rápida e verdadeiramente sem anúncios.',
      avatar: '🧠',
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
            <div className="text-3xl sm:text-5xl font-black text-emerald-400">0€</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Acesso Total Grátis</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl sm:text-5xl font-black text-amber-400">100%</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Modo Offline PWA</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl sm:text-5xl font-black text-cyan-400">1-Clique</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Login com Google</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl sm:text-5xl font-black text-purple-400">RGPD</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Privacidade &amp; RLS</div>
          </div>
        </div>

        {/* Testimonials Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/60">
            💬 Experiências Reais
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            O que diz quem já usa o NEXO
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Organização pensada para a rotina diária de famílias, estudantes e curiosos.
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
                  &quot;{t.content}&quot;
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
