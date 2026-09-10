import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, ArrowLeft, Users, GraduationCap, Target, 
  ShieldCheck, Search, Lightbulb, HelpCircle, UserCheck, Compass
} from 'lucide-react';
import { HeaderNav } from '../../components/layout/HeaderNav';
import { FooterSection } from '../landing/components/FooterSection';

interface ManualSection {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  summary: string;
  steps: {
    number: number;
    title: string;
    description: string;
    tip?: string;
  }[];
}

export const UserManualPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Manual de Instruções Passo a Passo | NEXO Hub Digital';
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const manualSections: ManualSection[] = [
    {
      id: 'intro',
      category: 'inicio',
      title: '1. Primeiros Passos & Configuração',
      icon: <Compass className="text-amber-400" size={24} />,
      summary: 'Como criar a sua conta gratuita, iniciar sessão com o Google e instalar a aplicação no telemóvel.',
      steps: [
        {
          number: 1,
          title: 'Iniciar Sessão ou Criar Conta',
          description: 'Aceda a https://nexo-platform-omega.vercel.app e clique em "Entrar com Google" para acesso instantâneo em 1-clique, ou escolha o registo tradicional por email e palavra-passe.',
          tip: 'Não precisa de cartão de crédito. Todas as funcionalidades são 100% gratuitas.',
        },
        {
          number: 2,
          title: 'Instalar no Telemóvel como App Nativa (PWA)',
          description: 'No iPhone (Safari), toque no botão de Partilhar e selecione "Adicionar ao Ecrã Principal". No Android (Chrome), toque nos 3 pontinhos e selecione "Instalar Aplicativo".',
          tip: 'O NEXO funciona mesmo sem Internet através da sua arquitetura Offline-First.',
        },
        {
          number: 3,
          title: 'Personalizar o Visual e Acessibilidade',
          description: 'No topo da página, clique no ícone do Sol/Lua para alternar entre Modo Claro e Modo Escuro. Pode também clicar no botão "Simples" para ativar o modo de leitura ampliada.',
        },
      ],
    },
    {
      id: 'family',
      category: 'familia',
      title: '2. Módulo Família & Gestão Doméstica',
      icon: <Users className="text-amber-400" size={24} />,
      summary: 'Como organizar o orçamento familiar, dividir despesas da casa, partilhar listas de compras e usar o chat com IA.',
      steps: [
        {
          number: 1,
          title: 'Criar ou Entrar num Grupo Familiar',
          description: 'Na aba "Família", clique em "Criar Grupo Familiar" para gerar um código de convite. Partilhe esse código com os membros da sua casa para que todos fiquem sincronizados.',
          tip: 'Cada membro entra com a sua própria conta Google ou email e partilha o mesmo painel doméstico.',
        },
        {
          number: 2,
          title: 'Registar Despesas e Controlar o Teto Mensal',
          description: 'Insira as contas pagas (ex: Supermercado, Renda, Eletricidade, Farmácia). O gráfico visual mostra a percentagem gasta e calcula automaticamente quem pagou o quê e os saldos a liquidar.',
        },
        {
          number: 3,
          title: 'Listas de Compras em Tempo Real',
          description: 'Adicione artigos que estão em falta em casa. Quando um membro marca um artigo como comprado no supermercado, a lista é atualizada instantaneamente para todos.',
        },
        {
          number: 4,
          title: 'Usar o Assistente @nexo no Chat Familiar',
          description: 'No chat da família, mencione @nexo para pedir ideias de refeições (ex: "Sugere 3 jantares rápidos com frango e arroz") ou para organizar a ementa semanal.',
        },
      ],
    },
    {
      id: 'students',
      category: 'estudantes',
      title: '3. Módulo Estudantes & Exames',
      icon: <GraduationCap className="text-cyan-400" size={24} />,
      summary: 'Como utilizar os mentores de IA por disciplina, simuladores de testes, flashcards e calculadora de médias.',
      steps: [
        {
          number: 1,
          title: 'Consultar os Mentores de Disciplina com IA',
          description: 'Na aba "Estudantes", selecione o mentor da matéria que pretende estudar (Matemática, Físico-Química, Português, História, Biologia, Inglês). Faça perguntas e obtenha explicações com exemplos práticos.',
          tip: 'Pode colar exercícios ou matérias difíceis e pedir explicações passo a passo.',
        },
        {
          number: 2,
          title: 'Gerar Simuladores de Testes e Exames',
          description: 'Clique em "Simulador de Exame", escolha a matéria e a dificuldade. A Inteligência Artificial cria um teste personalizado, avalia as suas respostas na hora e explica onde errou.',
        },
        {
          number: 3,
          title: 'Estudo Ativo com Flashcards',
          description: 'Crie cartões de memorização para fórmulas, vocabulário ou datas históricas. O sistema usa repetição espaçada para garantir a fixação do conhecimento a longo prazo.',
        },
        {
          number: 4,
          title: 'Calcular a Nota Necessária no Exame',
          description: 'Abra a "Calculadora de Média Final", insira as suas notas atuais e o peso do exame para saber exatamente que nota precisa tirar para passar ou entrar no curso desejado.',
        },
        {
          number: 5,
          title: 'Ativar o Pomodoro com Sons de Foco',
          description: 'Ligue o temporizador de estudo de 25 minutos com o "Focus Soundscape" (sons binaurais e ambientes relaxantes) para eliminar distrações e estudar concentrado.',
        },
      ],
    },
    {
      id: 'learning',
      category: 'aprender',
      title: '4. Módulo Aprender & Crescimento Pessoal',
      icon: <BookOpen className="text-purple-400" size={24} />,
      summary: 'Como criar trilhas de estudo estruturadas para qualquer assunto e acompanhar metas de leitura.',
      steps: [
        {
          number: 1,
          title: 'Criar uma Trilha de Estudo Personalizada',
          description: 'Na aba "Aprender", digite qualquer tópico que queira dominar (ex: "Finanças Pessoais", "Marketing Digital", "Fotografia"). O NEXO gera uma trilha com módulos, aulas e exercícios.',
        },
        {
          number: 2,
          title: 'Acompanhar a Meta Anual de Livros',
          description: 'Registe os livros que está a ler, atualize o número de páginas lidas e receba resumos inteligentes dos conceitos fundamentais de cada obra.',
        },
        {
          number: 3,
          title: 'Responder aos Quizzes Diários de Retenção',
          description: 'Teste os seus conhecimentos com perguntas rápidas geradas pela IA para exercitar o cérebro e consolidar o que aprendeu.',
        },
      ],
    },
    {
      id: 'tasks',
      category: 'tarefas',
      title: '5. Tarefas, Agenda & Comandos de Voz',
      icon: <Target className="text-indigo-400" size={24} />,
      summary: 'Como ditar tarefas, organizar a rotina diária, sincronizar com o Google Calendar e ganhar pontos XP.',
      steps: [
        {
          number: 1,
          title: 'Criar Tarefas com a Sua Voz (Ditado Nativo)',
          description: 'Nas listas ou tarefas, toque no ícone do microfone e dite em português natural. O NEXO transcreve a sua fala e organiza o item instantaneamente.',
        },
        {
          number: 2,
          title: 'Desdobrar Metas Grandes com IA',
          description: 'Ao criar um objetivo complexo, clique em "Desdobrar IA" para que o assistente crie 4 etapas práticas e acionáveis.',
        },
        {
          number: 3,
          title: 'Sincronizar com Google Calendar (.ICS)',
          description: 'Na aba "Agenda", agende compromissos e clique em exportar para sincronizar diretamente com o Google Calendar, Apple Calendar ou Microsoft Outlook.',
        },
        {
          number: 4,
          title: 'Gamificação: Subir de Nível e Ganhar XP',
          description: 'Cada tarefa concluída e meta cumprida atribui pontos de experiência (XP). Avance de Aspirante até se tornar uma Lenda do NEXO!',
        },
      ],
    },
    {
      id: 'privacy',
      category: 'seguranca',
      title: '6. Privacidade, Segurança & Dados Locais',
      icon: <ShieldCheck className="text-emerald-400" size={24} />,
      summary: 'Como os seus dados são protegidos e como exportar a sua informação a qualquer momento.',
      steps: [
        {
          number: 1,
          title: 'Segurança de Dados com RLS e Criptografia',
          description: 'Todos os seus dados na base de dados Supabase utilizam Row Level Security (RLS) e encriptação AES-256. Apenas a sua conta tem a chave de acesso.',
        },
        {
          number: 2,
          title: 'Exportação Total dos Seus Dados',
          description: 'Nas Definições da sua conta, pode clicar em "Exportar Dados (JSON)" a qualquer momento para guardar uma cópia local de todas as suas tarefas, notas e finanças.',
        },
        {
          number: 3,
          title: 'Eliminação Definitiva da Conta',
          description: 'Tem total controlo e soberania sobre os seus dados nos termos do RGPD. Pode eliminar a sua conta e todos os dados associados com apenas um clique nas Definições.',
        },
      ],
    },
  ];

  const filteredSections = manualSections.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.steps.some(st => st.title.toLowerCase().includes(searchQuery.toLowerCase()) || st.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <HeaderNav />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Navigation & Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar à Página Principal</span>
          </Link>

          <Link
            to="/app/help"
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <HelpCircle size={14} />
            <span>Central de Ajuda</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30 mb-4">
            <BookOpen size={14} className="text-amber-400" />
            <span>Guia Oficial do Utilizador</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Manual de Instruções Passo a Passo
          </h1>
          
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Aprenda a tirar o máximo partido de cada funcionalidade do <strong>NEXO Hub Digital</strong>: desde o orçamento familiar e explicadores de IA até à criação de cursos e comandos de voz.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar instrução (ex: orçamento, exames, voz, offline)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-xl"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 border-b border-slate-800">
          {[
            { id: 'all', label: '📖 Todos os Módulos' },
            { id: 'inicio', label: '🚀 1. Início & Instalação' },
            { id: 'familia', label: '👨‍👩‍👧 2. Família & Finanças' },
            { id: 'estudantes', label: '🎓 3. Estudantes & Exames' },
            { id: 'aprender', label: '🧠 4. Aprender & IA' },
            { id: 'tarefas', label: '⚡ 5. Tarefas & Voz' },
            { id: 'seguranca', label: '🔒 6. Privacidade' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Manual Content Sections */}
        <div className="space-y-12">
          {filteredSections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 backdrop-blur-md"
            >
              {/* Section Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-800/80">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {section.title}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {section.summary}
                  </p>
                </div>
              </div>

              {/* Step-by-Step List */}
              <div className="grid grid-cols-1 gap-6">
                {section.steps.map((step) => (
                  <div
                    key={step.number}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                        {step.number}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-11">
                      {step.description}
                    </p>

                    {step.tip && (
                      <div className="ml-11 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-2 text-xs text-indigo-300">
                        <Lightbulb size={15} className="text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Dica Prática:</strong> {step.tip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
              <Search size={32} className="text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Nenhum resultado encontrado</h3>
              <p className="text-xs text-slate-400">Tente pesquisar por outros termos como "família", "estudos", "voz" ou "offline".</p>
            </div>
          )}
        </div>

        {/* CTA Bottom Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Pronto para colocar as instruções em prática?</h3>
            <p className="text-xs text-indigo-200">Abra o seu painel do NEXO e experimente todas as funcionalidades agora.</p>
          </div>

          <Link
            to="/app"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 shrink-0 border border-white/20"
          >
            <UserCheck size={18} />
            <span>Abrir o Meu NEXO</span>
          </Link>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default UserManualPage;
