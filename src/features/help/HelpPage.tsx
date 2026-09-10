import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, Search, MessageSquare, Volume2, ChevronDown, ChevronUp, 
  Send, Shield, CheckCircle2, Zap, Compass, Info, ArrowLeft
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: string;
}

const FAQ_DATABASE: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'IA & Voz',
    question: 'Como funciona o Briefing de Voz e a fala do assistente @nexo?',
    answer: 'O NEXO utiliza a tecnologia Web Speech API nativa do navegador para ler resumos em voz alta. Nas abas de Objetivos, Listas e Família, pode clicar em "Briefing de Voz" para ouvir um resumo falado em português de Portugal. Nas Definições, pode ajustar a velocidade da voz.',
    icon: '🎙️',
  },
  {
    id: 'faq-2',
    category: 'IA & Voz',
    question: 'Como utilizar o Ditado por Voz para criar itens ou mensagens?',
    answer: 'Nas listas e no chat da família, clique no ícone de microfone ao lado da caixa de texto. Fale claramente e a sua voz será convertida em texto automaticamente sem precisar de digitar.',
    icon: '🎤',
  },
  {
    id: 'faq-3',
    category: 'Família & Casa',
    question: 'Como criar propostas e votações familiares?',
    answer: 'Na aba Família & Casa, utilize a caixa de "Propostas da Casa" para propor ideias (ex: passeios, compras). Cada membro pode votar 👍 Aprovar ou 👎 Recusar. Quando a maioria aprova, a proposta é automaticamente assinalada como Aprovada!',
    icon: '🗳️',
  },
  {
    id: 'faq-4',
    category: 'Família & Casa',
    question: 'Como funciona a Visão por IA para talões e fotos de compras?',
    answer: 'No Chat Familiar, ao enviar a foto de um talão de compras ou lista em papel, clique no botão "📷 Visão IA (+Compras)" que surge na mensagem. O NEXO analisa a imagem e adiciona os produtos detetados diretamente à Lista de Compras da Casa.',
    icon: '📷',
  },
  {
    id: 'faq-5',
    category: 'Objetivos',
    question: 'Como ganhar XP e subir de nível na aba Objetivos?',
    answer: 'Ganha 100 XP por cada meta de vida concluída, 25 XP por cada sub-passo assinalado e XP bónus pela percentagem de avanço. À medida que acumula XP, passa do Nível 1 (Aspirante) até ao Nível 5 (Lenda do Nexo).',
    icon: '🏆',
  },
  {
    id: 'faq-6',
    category: 'Objetivos',
    question: 'O que é o botão "Desdobrar IA" nos objetivos?',
    answer: 'Ao clicar em "Desdobrar IA" num objetivo, o assistente gera automaticamente 4 sub-passos práticos e organizados para o ajudar a alcançar essa meta passo a passo.',
    icon: '✨',
  },
  {
    id: 'faq-7',
    category: 'Listas',
    question: 'Como partilhar uma lista no WhatsApp?',
    answer: 'Em qualquer cartão da aba Listas, clique no ícone de Partilha (Share). A lista é formatada com marcadores ✅ e ⬜ e copiada para a área de transferência para colar no WhatsApp ou SMS.',
    icon: '📋',
  },
  {
    id: 'faq-8',
    category: 'Privacidade & Offline',
    question: 'O NEXO funciona sem ligação à Internet (Modo Offline)?',
    answer: 'Sim! O NEXO possui uma arquitetura offline-first. Todas as suas tarefas, listas e objetivos são guardados no armazenamento local e sincronizados automaticamente quando recuperar a ligação.',
    icon: '📡',
  },
];

export const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Form State for Sending Questions
  const [userQuestion, setUserQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Voice introduction to Help page
  const handleHelpVoiceSummary = () => {
    if (!('speechSynthesis' in window)) {
      showToast('A síntese de voz não é suportada neste navegador.', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = "Bem-vindo à Central de Ajuda e Suporte do NEXO. Aqui pode pesquisar tutoriais, aprender sobre o assistente por voz, entender o sistema de pontos e tirar dúvidas sobre a sua conta.";
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'pt-PT';
    
    ut.onstart = () => setIsSpeaking(true);
    ut.onend = () => setIsSpeaking(false);
    ut.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(ut);
  };

  // Submit Feedback or Support Question
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setUserQuestion('');
      showToast('A sua mensagem foi enviada para o suporte NEXO!', 'success');
    }, 800);
  };

  // Filter FAQs
  const categories = ['all', 'IA & Voz', 'Família & Casa', 'Objetivos', 'Listas', 'Privacidade & Offline'];

  const filteredFaqs = FAQ_DATABASE.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-5xl mx-auto">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <Badge variant="primary" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30">
              Central de Suporte & Conhecimento
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Como podemos ajudar hoje?
            </h1>

            <p className="text-sm text-indigo-200/80">
              Encontre respostas rápidas sobre voz, IA, tarefas de família e privacidade
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              size="md"
              leftIcon={<ArrowLeft size={18} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold shrink-0"
            >
              Voltar
            </Button>

            <Button
              onClick={handleHelpVoiceSummary}
              variant="secondary"
              size="md"
              leftIcon={<Volume2 size={18} className={isSpeaking ? 'animate-bounce text-amber-400' : ''} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 shrink-0"
            >
              {isSpeaking ? 'A falar...' : 'Ouvir Guia Rápido'}
            </Button>
          </div>
        </div>

        {/* Pesquisa por Texto */}
        <div className="mt-6 relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por palavras-chave (ex: voz, chat, metas, offline, compras)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-indigo-200/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      {/* Categorias de Filtro */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            {cat === 'all' ? '🌟 Todas as Dúvidas' : cat}
          </button>
        ))}
      </div>

      {/* Accordeon de FAQs */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
          Perguntas Frequentes ({filteredFaqs.length})
        </h2>

        {filteredFaqs.length === 0 ? (
          <Card variant="default" padding="md" className="text-center py-12 space-y-3">
            <Info size={36} className="mx-auto text-slate-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Nenhum resultado encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Não encontramos nenhuma resposta para a sua pesquisa. Tente usar termos mais simples ou envie-nos a sua dúvida no formulário abaixo.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 shadow-md'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                        {faq.icon}
                      </span>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                          {faq.category}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    <div className="text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
                      <p className="pt-2">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cartões Rápidos de Dicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        <Card variant="default" padding="md" className="space-y-2 border-indigo-100 dark:border-indigo-900/50">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit">
            <Zap size={20} />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Atalhos de Teclado & Voz</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use o microfone na caixa de pesquisa ou ditado de mensagens para introduzir tarefas e itens em 1-clique sem digitar.
          </p>
        </Card>

        <Card variant="default" padding="md" className="space-y-2 border-emerald-100 dark:border-emerald-900/50">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit">
            <Shield size={20} />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Privacidade Garantida</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Os seus dados e tarefas familiares pertencem-lhe a 100%. Podem ser exportados a qualquer momento em JSON nas Definições.
          </p>
        </Card>

        <Card variant="default" padding="md" className="space-y-2 border-purple-100 dark:border-purple-900/50">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 w-fit">
            <Compass size={20} />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Assistente Inteligente `@nexo`</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No chat familiar, refira `@nexo` para pedir lembretes, resumos da semana ou tirar dúvidas rápidas sobre a casa.
          </p>
        </Card>

      </div>

      {/* Form de Contacto de Suporte */}
      <Card variant="default" padding="md" className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <MessageSquare size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Ainda tem dúvidas? Contacte a equipa NEXO
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Envie-nos a sua sugestão ou pergunta e responderemos rapidamente.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              A sua Dúvida ou Sugestão *
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o que necessita ou sugira uma melhoria para a plataforma NEXO..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" /> Resposta habitual em menos de 24h
            </span>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSending}
              leftIcon={<Send size={16} />}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold"
            >
              Enviar Mensagem
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
};

export default HelpPage;
