import React from 'react';
import { Check, Sparkles, ShieldCheck, Zap, Users, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingSection: React.FC = () => {

  return (
    <section id="precos" className="py-24 bg-slate-50 dark:bg-slate-900/60 relative overflow-hidden">
      {/* Decorative ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            <span>Preço Transparente &amp; Acesso Aberto</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Comece grátis hoje. <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Sem cartões de crédito nem surpresas.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Acreditamos que a organização pessoal e familiar deve ser acessível a todos. O NEXO é 100% funcional sem subscrições obrigatórias.
          </p>

          {/* Plan badge */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Acesso Total Gratuito com a sua Conta Google ou Email</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan 1: Individual */}
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/80 shadow-lg flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                  Pessoal &amp; Estudante
                </span>
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <Zap size={20} />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Starter Individual</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Ideal para organizar o teu dia a dia com listas de tarefas, hábitos e assistente de voz.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900 dark:text-white">0€</span>
                <span className="text-sm font-medium text-slate-500">/ para sempre</span>
              </div>

              <ul className="space-y-3.5 mb-8 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-500 shrink-0" />
                  <span>Listas de Tarefas e Checklists Ilimitadas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-500 shrink-0" />
                  <span>Gamificação XP e Níveis de Conquista</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-500 shrink-0" />
                  <span>Ditado por Voz &amp; Leitor Falado (TTS)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-500 shrink-0" />
                  <span>Modo PWA Offline e 100% Dados Locais</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-500 shrink-0" />
                  <span>Partilha Rápida de Listas via WhatsApp</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold text-center text-sm transition-colors block"
            >
              Criar Conta Grátis
            </Link>
          </div>

          {/* Plan 2: Family Pro (FEATURED) */}
          <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 border-2 border-indigo-500 shadow-2xl relative flex flex-col justify-between transform md:-translate-y-3">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-extrabold uppercase px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <Star size={14} className="fill-amber-300 text-amber-300" />
              <span>Mais Popular • 100% Grátis no Beta</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4 mt-2">
                <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">
                  Família &amp; Casal
                </span>
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Users size={20} />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">NEXO Família Pro</h3>
              <p className="text-sm text-indigo-200 mb-6">
                Orçamento familiar unificado, leitor de recibos com alertas e sincronização total de agenda.
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-white">0€</span>
                <span className="text-sm text-indigo-300 line-through">14.99€/mês</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Passe Grátis
                </span>
              </div>

              <ul className="space-y-3.5 mb-8 text-sm text-indigo-100">
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-400 shrink-0" />
                  <span><strong>Tudo do plano Starter</strong> +</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-400 shrink-0" />
                  <span>Gestão de Orçamento Familiar &amp; Limites de Gastos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-400 shrink-0" />
                  <span>Alerta de Scanner de Recibos &amp; Comprovativos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-400 shrink-0" />
                  <span>Exportação em 1-Clique para Google Cal e .ICS</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-emerald-400 shrink-0" />
                  <span>Suporte Prioritário &amp; Backup Local Encriptado</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-center text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Aproveitar Acesso Beta Grátis</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Plan 3: Business / Team */}
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/80 shadow-lg flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                  Equipas &amp; PMEs
                </span>
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <ShieldCheck size={20} />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Equipas &amp; Projetos</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Para pequenos grupos de trabalho que procuram gestão descentralizada e máxima privacidade.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-bold text-slate-400">Em Breve</span>
              </div>

              <ul className="space-y-3.5 mb-8 text-sm text-slate-700 dark:text-slate-300 opacity-75">
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-blue-500 shrink-0" />
                  <span>Quadros Avançados Kanban &amp; Sprint</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-blue-500 shrink-0" />
                  <span>Múltiplos Espaços de Trabalho</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-blue-500 shrink-0" />
                  <span>Histórico de Atividades &amp; Auditoria</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="text-blue-500 shrink-0" />
                  <span>Relatórios de Produtividade Exportáveis</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full py-3.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-center text-sm cursor-not-allowed"
            >
              Inscrever na Lista de Espera
            </button>
          </div>

        </div>

        {/* Security Trust Footnote */}
        <div className="mt-12 text-center flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Garantia NEXO: Sem fidelização, sem dados vendidos a terceiros, sem publicidade.</span>
        </div>

      </div>
    </section>
  );
};
