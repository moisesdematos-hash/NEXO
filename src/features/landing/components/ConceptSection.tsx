import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const ConceptSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O NEXO é verdadeiramente gratuito?',
      a: 'Sim! O NEXO pode ser utilizado gratuitamente por qualquer pessoa. Pode experimentar a aplicação como Convidado sem registo ou criar uma conta para sincronização entre dispositivos.',
    },
    {
      q: 'Funciona sem ligação à Internet (Offline)?',
      a: 'Sim! O NEXO possui uma arquitetura 100% offline-first com tecnologia PWA. Todas as suas tarefas, metas e listas são guardadas no seu dispositivo e sincronizadas automaticamente assim que recuperar a ligação à rede.',
    },
    {
      q: 'Como funciona a privacidade dos meus dados familiares?',
      a: 'A sua privacidade é a nossa maior prioridade. O NEXO isola os seus dados pessoais dos dados partilhados da casa. Além disso, pode exportar todos os seus dados em formato JSON a qualquer momento nas Definições.',
    },
    {
      q: 'Posso usar o NEXO no meu telemóvel (iPhone / Android)?',
      a: 'Com certeza! Ao aceder ao NEXO no navegador do telemóvel, pode tocar em "Adicionar ao Ecrã Principal" (PWA) para instalar a aplicação como uma app nativa sem precisar da App Store.',
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/60 inline-flex items-center gap-1.5">
            <HelpCircle size={14} /> Perguntas Frequentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Tem dúvidas? Nós respondemos.
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Tudo o que precisa de saber antes de começar a transformar a sua rotina.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900 border-indigo-500/50 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base text-white"
                >
                  <span>{faq.q}</span>
                  <div className="text-indigo-400 shrink-0">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
