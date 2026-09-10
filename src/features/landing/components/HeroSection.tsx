import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, ShieldCheck, CheckCircle2, UserCheck, 
  MessageSquare, Trophy, ListChecks, PieChart, Mic, Smartphone, Check
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const HeroSection: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'goals' | 'lists' | 'finance' | 'calendar'>('chat');

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-slate-950 text-white">
      
      {/* Radiant Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Glowing Official NEXO Master Logo Emblem */}
        <div className="flex justify-center mb-6 animate-fade-in">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-indigo-400/40 shadow-2xl shadow-indigo-600/50 bg-slate-950 p-1 transform group-hover:scale-105 transition-transform duration-300">
              <img
                src="/logos/nexo-logo-master.jpg"
                alt="NEXO Official Master Logo"
                className="w-full h-full object-cover rounded-[20px]"
              />
            </div>
          </div>
        </div>

        {/* Slogan Pill with Glowing Border */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-300 font-bold text-xs sm:text-sm mb-8 shadow-xl backdrop-blur-md animate-fade-in ring-1 ring-white/10">
          <Sparkles size={16} className="text-amber-400 animate-pulse" />
          <span>A Plataforma Integrada de Inteligência Pessoal & Familiar</span>
          <span className="bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">v2.5.0</span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto text-white">
          A tua vida organizada num só lugar.{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            Sem o caos do dia a dia.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Substitua 5 aplicações dispersas por uma experiência fluida com <strong className="text-white">Assistente de Voz por IA</strong>, <strong className="text-white">Gamificação de Objetivos</strong>, <strong className="text-white">Chat Familiar Inteligente</strong> e funcionalidade <strong className="text-white">100% Offline PWA</strong>.
        </p>

        {/* Primary High-Converting CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          {user ? (
            <Link
              to="/app"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group border border-white/20"
            >
              <UserCheck size={22} />
              <span>Abrir o Meu NEXO</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group border border-white/20"
              >
                <span>Começar Gratuitamente</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-amber-300" />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-extrabold text-lg transition-all backdrop-blur-md shadow-lg flex items-center justify-center gap-3 hover:text-white"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.0 10.04.0 12s.47 3.8 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Entrar com Google</span>
              </Link>
            </>
          )}
        </div>

        {/* Trust & Guarantee Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>100% Gratuito sem Cartão</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-400" />
            <span>Privacidade & Dados Locais</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-amber-400" />
            <span>Pronto para PWA & Offline</span>
          </div>
        </div>

        {/* Live Interactive Application Preview */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-indigo-500/20 via-slate-800/40 to-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 text-left shadow-2xl">
            
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs text-slate-400 font-mono hidden sm:inline">nexo.app / hub-inteligente</span>
              </div>

              {/* Interactive Tabs inside Hero Preview */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare size={12} /> Chat IA
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'goals' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy size={12} /> Metas XP
                </button>
                <button
                  onClick={() => setActiveTab('lists')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'lists' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListChecks size={12} /> Listas Voz
                </button>
                <button
                  onClick={() => setActiveTab('finance')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 hidden sm:flex ${
                    activeTab === 'finance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PieChart size={12} /> Gastos
                </button>
              </div>
            </div>

            {/* Tab Preview Content */}
            <div className="p-6 sm:p-8 min-h-[260px] flex items-center justify-center">
              {activeTab === 'chat' && (
                <div className="w-full space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                      N
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 space-y-2 max-w-xl">
                      <div className="flex items-center justify-between text-indigo-400 font-bold">
                        <span>@nexo • Assistente da Casa</span>
                        <span className="text-[10px] text-slate-500">Agora</span>
                      </div>
                      <p>
                        Li o talão de compras que enviou! Adicionei 5 artigos à Lista de Compras da Casa e registei a despesa de 42.80€ no orçamento familiar.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/50 flex items-center gap-1">
                          <Check size={12} /> 5 Compras Adicionadas
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                          +42.80€ Registado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'goals' && (
                <div className="w-full space-y-4 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                        <Trophy size={16} /> Nível 3 • Conquistador de Objetivos
                      </span>
                      <span className="font-bold text-indigo-300">550 XP</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Ler 12 Livros no Ano</span>
                        <span className="text-emerald-400">75% (9 / 12 livros)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2">
                        <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full w-[75%]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-xl bg-slate-950 text-slate-300 flex items-center gap-1.5 border border-slate-800">
                        <Check size={12} className="text-emerald-400" /> Escolher lista anual
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 text-slate-300 flex items-center gap-1.5 border border-slate-800">
                        <Check size={12} className="text-emerald-400" /> 20 min de leitura diária
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 text-slate-300 flex items-center gap-1.5 border border-slate-800">
                        <Check size={12} className="text-emerald-400" /> Resumos dos livros
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 text-indigo-300 flex items-center gap-1.5 border border-indigo-800/60 font-bold">
                        <Sparkles size={12} className="text-amber-400" /> Desdobrar IA
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lists' && (
                <div className="w-full space-y-3 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">🛒 Compras de Supermercado</span>
                      <span className="text-slate-400 font-mono">(4/6 itens)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1 font-bold">
                        <Mic size={12} className="text-rose-400 animate-pulse" /> Ditado Ativo
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300">
                        WhatsApp 📋
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'finance' && (
                <div className="w-full space-y-3 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-emerald-400">Orçamento Familiar do Mês</span>
                      <span className="font-bold text-slate-300">620€ / 1200€ (51%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full w-[51%]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
