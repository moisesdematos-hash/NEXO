import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const ConceptSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O NEXO é verdadeiramente gratuito?',
      a: 'Sim! O NEXO é 100% gratuito. Pode aceder de forma simples e imediata com a sua conta Google ou com endereço de email e palavra-passe, sem cartões de crédito nem compromissos.',
    },
    {
      q: 'Como funciona a aba Família e o orçamento partilhado?',
      a: 'Pode criar um grupo familiar e convidar membros por código. Todos podem registar despesas da casa, acompanhar o teto orçamental do mês, partilhar a lista de supermercado e usar a IA para planear refeições semanais.',
    },
    {
      q: 'Como é que o NEXO ajuda os Estudantes nas disciplinas e exames?',
      a: 'O NEXO inclui explicadores especializados por Inteligência Artificial (Matemática, Físico-Química, Português, História, Biologia e outras disciplinas), simuladores de exames com correção na hora, flashcards de memorização e calculadora de média final.',
    },
    {
      q: 'Como funciona a criação de cursos na aba Aprender?',
      a: 'Basta escrever o que quer aprender (ex: "Programação Web", "Finanças Pessoais" ou "Novo Idioma"). O NEXO gera um roteiro estruturado em módulos diários com exercícios práticos e acompanhamento das suas leituras.',
    },
    {
      q: 'Funciona sem ligação à Internet (Offline)?',
      a: 'Sim! Graças à tecnologia PWA (Progressive Web App), o NEXO funciona mesmo sem rede. Os seus dados são guardados em segurança no seu dispositivo e sincronizam automaticamente assim que recuperar a ligação.',
    },
    {
      q: 'Os meus dados e informações familiares estão seguros?',
      a: 'Absolutamente. Os seus dados são protegidos com criptografia AES-256 e isolamento rigoroso por linha (RLS) no Supabase. Não vendemos dados a terceiros nem usamos as suas notas privadas para anúncios.',
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
