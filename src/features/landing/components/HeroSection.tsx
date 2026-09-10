import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, ShieldCheck, CheckCircle2, UserCheck, 
  Users, GraduationCap, BookOpen, Check, 
  Clock, Flame, Brain
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const HeroSection: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'family' | 'students' | 'learning' | 'tasks'>('family');

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

        {/* 3 Pillars Spotlight Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/40 text-indigo-300 font-bold text-xs sm:text-sm mb-6 shadow-xl backdrop-blur-md animate-fade-in ring-1 ring-white/10">
          <span className="flex items-center gap-1 text-amber-300">
            <Users size={14} /> Família &amp; Finanças
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <GraduationCap size={14} /> Estudantes &amp; Exames
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-purple-300">
            <BookOpen size={14} /> Aprender com IA
          </span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto text-white">
          A tua Família, os teus Estudos e as tuas Metas.{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            Organizados com Inteligência Artificial.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Substitua várias aplicações pagas por uma só: <strong className="text-white">Orçamento e Chat Familiar</strong>, <strong className="text-white">Explicadores e Simuladores para Estudantes</strong>, <strong className="text-white">Cursos Personalizados por IA</strong> e modo <strong className="text-white">100% Offline PWA</strong>.
        </p>

        {/* Primary High-Converting CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          {user ? (
            <Link
              to="/app"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group border border-white/20"
            >
              <UserCheck size={22} />
              <span>Abrir o Meu Painel NEXO</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group border border-white/20"
              >
                <span>Criar Conta Gratuita</span>
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
            <span>100% Gratuito</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-400" />
            <span>Privacidade &amp; RGPD</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <span>Google Gemini IA Nativo</span>
          </div>
        </div>

        {/* Live Interactive Application Preview */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-indigo-500/20 via-slate-800/40 to-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 text-left shadow-2xl">
            
            {/* Window Topbar with the 3 Pillars */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs text-slate-400 font-mono hidden sm:inline">nexo.app / demonstracao-ao-vivo</span>
              </div>

              {/* Interactive Tabs for the 3 Themes */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setActiveTab('family')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'family' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users size={13} /> 👨‍👩‍👧 Família
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'students' ? 'bg-cyan-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap size={13} /> 🎓 Estudantes
                </button>
                <button
                  onClick={() => setActiveTab('learning')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'learning' ? 'bg-purple-500 text-white font-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen size={13} /> 🧠 Aprender
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Check size={13} /> ⚡ Tarefas &amp; Voz
                </button>
              </div>
            </div>

            {/* Tab Preview Content */}
            <div className="p-6 sm:p-8 min-h-[280px] flex items-center justify-center">
              
              {/* 1. ABA FAMÍLIA */}
              {activeTab === 'family' && (
                <div className="w-full space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cartão Finanças */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                          <Users size={16} /> Orçamento Familiar • Setembro
                        </span>
                        <span className="font-bold text-slate-300">540€ / 1.100€</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2.5 rounded-full w-[49%]" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>🛒 Supermercado: 210€</span>
                        <span>🏠 Renda/Luz: 330€</span>
                        <span className="text-emerald-400 font-bold">560€ Restante</span>
                      </div>
                    </div>

                    {/* Cartão Chat Família & IA */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-indigo-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Sparkles size={13} className="text-amber-400" /> Assistente IA da Casa
                        </span>
                        <span className="text-[10px] text-slate-500">Hoje</span>
                      </div>
                      <p className="text-slate-200">
                        &quot;Sugeri a ementa da semana (Bacalhau com Legumes &amp; Frango Assado) e já adicionei 6 ingredientes à lista de compras da família!&quot;
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/50">
                          ✓ Lista Sincronizada
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          ✓ Ementa Pronta
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ABA ESTUDANTES */}
              {activeTab === 'students' && (
                <div className="w-full space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mentores IA */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-cyan-400 flex items-center gap-1.5">
                          <GraduationCap size={16} /> Mentor IA • Matemática &amp; Física
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold">Ativo</span>
                      </div>
                      <p className="text-xs text-slate-200">
                        &quot;Aqui está a explicação passo a passo da regra de três simples e equações de 2º grau com 3 exercícios para treinares antes do teste.&quot;
                      </p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 text-emerald-400 border border-slate-800 font-bold">
                          ✓ Simulador de Exame: Nota 17.5/20
                        </span>
                      </div>
                    </div>

                    {/* Modo Pomodoro & Médias */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
                          <Clock size={14} className="text-rose-400" /> Pomodoro de Foco
                        </span>
                        <span className="font-mono text-rose-400 font-bold">25:00 • Som Binaural</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                        <span>Calculadora de Média Final:</span>
                        <span className="text-cyan-300 font-bold">Precisas de 14 valores no exame</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ABA APRENDER */}
              {activeTab === 'learning' && (
                <div className="w-full space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trilha de Aprendizagem */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-purple-400 flex items-center gap-1.5">
                          <Brain size={16} /> Curso Gerado: Finanças &amp; Investimentos
                        </span>
                        <span className="font-bold text-emerald-400 text-[11px]">Módulo 3 de 6</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-2 rounded-full w-[50%]" />
                      </div>
                      <p className="text-xs text-slate-300">
                        Próxima lição: Como criar um fundo de emergência e calcular juros compostos.
                      </p>
                    </div>

                    {/* Livros & Leituras */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                          <BookOpen size={14} /> Meta Anual de Leitura
                        </span>
                        <span className="font-bold text-slate-300">8 / 12 Livros</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                        <span>Livro Atual: Hábitos Atómicos</span>
                        <span className="text-amber-400 font-bold">Pág. 142/280</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">✓ Resumo dos pontos-chave gerado pela IA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ABA TAREFAS & VOZ */}
              {activeTab === 'tasks' && (
                <div className="w-full space-y-3 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
                    <div className="space-y-1 text-left w-full sm:w-auto">
                      <span className="font-extrabold text-white block">⚡ Briefing Matinal &amp; Tarefas do Dia</span>
                      <span className="text-slate-400 text-[11px]">Dite tarefas com voz natural ou sincronize com o calendário</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1.5 font-bold">
                        <Flame size={13} className="text-amber-400" /> 5 Tarefas Concluídas (+120 XP)
                      </span>
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
