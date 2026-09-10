import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Calendar,
  ListChecks,
  Target,
  Send,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  CalendarDays,
  Check,
  Moon,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Play,
  Pause,
  BarChart3,
  Timer,
  Mic,
  MicOff,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { useTodayContext } from '../../hooks/useTodayContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { TaskFormModal } from '../tasks/components/TaskFormModal';
import { EventFormModal } from '../calendar/components/EventFormModal';
import { ListFormModal } from '../lists/components/ListFormModal';
import { OrganizeDayModal } from './components/OrganizeDayModal';
import { aiService } from '../../services/aiService';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface WidgetPreferences {
  showBriefing: boolean;
  showStreak: boolean;
  showQuickCreate: boolean;
  showYield: boolean;
  showPomodoro: boolean;
  showTimeline: boolean;
}

const DEFAULT_PREFERENCES: WidgetPreferences = {
  showBriefing: true,
  showStreak: true,
  showQuickCreate: true,
  showYield: true,
  showPomodoro: true,
  showTimeline: true,
};

export const DashboardPage: React.FC = () => {
  const { profile, user, isGuest } = useAuth();
  const { toggleTask, createTask } = useTasks();
  const { isOnline } = useNetworkStatus();
  const { showToast } = useToast();

  const {
    currentFocus,
    nowSection,
    dayTimeline,
    smartAlerts,
    nexoSuggestion,
    organizeDayPlan,
    isEmpty,
    completedTodayCount,
    pendingTodayCount,
    progressSummaryText,
    isDoneForToday,
    doneForTodayMessage,
    isEveningCheckoutTime,
    checkoutSummary,
    tomorrowPlan,
    continuityText,
  } = useTodayContext();

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<
    'task' | 'event' | 'list' | 'organize_today' | 'organize_tomorrow' | 'customize' | null
  >(null);

  // Accessibility screen reader announcement state
  const [announcement, setAnnouncement] = useState<string>('');

  // Daily Checkout dismissed state
  const [dismissCheckout, setDismissCheckout] = useState(false);
  const [eveningMood, setEveningMood] = useState<'calm' | 'productive' | 'awesome' | null>(null);

  // Widget preferences
  const [widgetPrefs, setWidgetPrefs] = useState<WidgetPreferences>(() => {
    try {
      const saved = localStorage.getItem('nexo_dashboard_widgets');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const updateWidgetPref = (key: keyof WidgetPreferences, value: boolean) => {
    const updated = { ...widgetPrefs, [key]: value };
    setWidgetPrefs(updated);
    try {
      localStorage.setItem('nexo_dashboard_widgets', JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to save widget prefs to localStorage', e);
    }
  };

  // 1. CHAVE DE OURO — Daily Audio Briefing
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const speakBriefing = () => {
    if (!('speechSynthesis' in window)) {
      setAnnouncement('Síntese de voz não suportada neste navegador.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const topTaskTitle = currentFocus[0]?.title || 'Rever objetivos do dia';
    const text = `Bom dia ${userName}! Este é o teu NEXO Daily Briefing. ` +
      `Tens ${pendingTodayCount} tarefas pendentes e ${dayTimeline.length} compromissos agendados. ` +
      `O teu nível de energia estimado é alto. A tua prioridade número um de hoje é: ${topTaskTitle}. ` +
      `Mantenha a concentração e bom trabalho!`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 2. Daily Streak & Gamification
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('nexo_user_streak') || '3', 10);
    } catch {
      return 3;
    }
  });

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastActive = localStorage.getItem('nexo_last_active_date');
      if (lastActive !== todayStr) {
        localStorage.setItem('nexo_last_active_date', todayStr);
        if (lastActive) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          if (lastActive === yesterdayStr) {
            const nextStreak = streakCount + 1;
            setStreakCount(nextStreak);
            localStorage.setItem('nexo_user_streak', nextStreak.toString());
          }
        }
      }
    } catch (e) {
      console.warn('Streak storage error', e);
    }
  }, []);

  const totalXP = (completedTodayCount * 15) + (streakCount * 20);
  const userLevel = Math.floor(totalXP / 100) + 1;
  const currentXPInLevel = totalXP % 100;

  // 3. Quick Creator Top Bar
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCreating, setQuickCreating] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || quickCreating) return;
    setQuickCreating(true);
    try {
      await createTask({
        title: quickTitle.trim(),
        priority: 'medium',
        status: 'pending',
      });
      setAnnouncement(`✓ Tarefa "${quickTitle}" criada com sucesso!`);
      setQuickTitle('');
    } catch (err: any) {
      setAnnouncement('Erro ao criar tarefa rápida.');
    } finally {
      setQuickCreating(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Reconhecimento de voz não é suportado pelo seu navegador.', 'info');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListeningVoice(true);
    recognition.onend = () => setIsListeningVoice(false);
    recognition.onerror = () => setIsListeningVoice(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setQuickTitle(transcript);
        setAnnouncement(`Ditado reconhecido: "${transcript}"`);
      }
    };

    recognition.start();
  };

  // 5. Pomodoro Focus Timer
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const pomodoroIntervalRef = useRef<any>(null);

  const currentPomodoroTask = currentFocus[0]?.title || 'Sessão de Foco Geral';

  useEffect(() => {
    if (isPomodoroRunning) {
      pomodoroIntervalRef.current = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(pomodoroIntervalRef.current);
            setIsPomodoroRunning(false);
            if ('speechSynthesis' in window) {
              const speakDone = new SpeechSynthesisUtterance('Sessão de Pomodoro concluída! É hora de uma pausa.');
              speakDone.lang = 'pt-PT';
              window.speechSynthesis.speak(speakDone);
            }
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(pomodoroIntervalRef.current);
    }
    return () => clearInterval(pomodoroIntervalRef.current);
  }, [isPomodoroRunning]);

  const togglePomodoro = () => setIsPomodoroRunning(!isPomodoroRunning);
  const resetPomodoro = () => {
    setIsPomodoroRunning(false);
    setPomodoroSeconds(25 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Convidado');

  const hourNow = new Date().getHours();
  const timeGreeting =
    hourNow < 12 ? 'Bom dia' : hourNow < 20 ? 'Boa tarde' : 'Boa noite';

  const todayDate = new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleTaskToggle = async (id: string, currentStatus: any, title: string) => {
    await toggleTask({ id, currentStatus });
    const isNowCompleted = currentStatus !== 'completed';
    const message = isNowCompleted
      ? `✓ Tarefa "${title}" marcada como concluída.`
      : `Tarefa "${title}" reaberta.`;
    setAnnouncement(message);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    if (!isOnline) {
      setAiResponse('A IA precisa de ligação à internet para responder.');
      return;
    }

    setAiLoading(true);
    setAiResponse(null);

    try {
      const conv = await aiService.createConversation('NEXO Daily Loop Prompt');
      const result = await aiService.sendMessage(conv.id, aiPrompt);
      setAiResponse(result.replyMessage.content);
      setAiPrompt('');
    } catch (err: any) {
      setAiResponse(
        err.message || 'Ocorreu um erro ao processar o pedido. Tenta novamente.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Região Acessível ARIA Live para Anúncios */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* 1. SAUDAÇÃO & TOPO DO PAINEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 capitalize">
            {todayDate}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {timeGreeting}, {userName}!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {progressSummaryText || 'O NEXO ajuda-te a perceber o teu dia, fazer o que importa e preparar o próximo.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isGuest && (
            <Badge variant="warning" size="md">
              Modo Convidado
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal('customize')}
            leftIcon={<SlidersHorizontal size={15} />}
            className="text-xs"
          >
            Personalizar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveModal('organize_today')}
            leftIcon={<CalendarDays size={16} />}
          >
            Organizar o meu dia
          </Button>
        </div>
      </div>

      {/* 2. 🌟 [CHAVE DE OURO] 🎙️ NEXO DAILY BRIEFING EM ÁUDIO & PREVISÃO DE ENERGIA */}
      {widgetPrefs.showBriefing && (
        <Card
          variant="default"
          padding="lg"
          className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border-none shadow-xl relative overflow-hidden"
        >
          {/* Fundo decorativo sutil */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-400/20 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  NEXO Daily Briefing
                </span>
                <span className="text-xs text-slate-400">· Previsão de Foco</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Previsão de Foco & Energia do Dia
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Energia estimada: <span className="text-emerald-400 font-bold">Pico de Manhã (92%)</span>. 
                Melhor janela para trabalho de alta exigência cognitiva: <span className="text-amber-300 font-mono font-bold">09:00 - 12:30</span>.
              </p>

              {/* Indicadores Visuais de Métricas */}
              <div className="flex items-center gap-4 pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 bg-white/5 px-2.5 py-1 rounded-xl">
                  <Zap size={14} className="text-amber-400" />
                  <span>Nível de Energia: Elevado</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-200 bg-white/5 px-2.5 py-1 rounded-xl">
                  <Target size={14} className="text-indigo-400" />
                  <span>Prioridades: {currentFocus.length} ativas</span>
                </div>
              </div>
            </div>

            {/* Leitor de Áudio Briefing */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 space-y-3 min-w-[220px]">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 uppercase tracking-wider">
                {isPlayingAudio ? (
                  <>
                    <Volume2 size={16} className="text-emerald-400 animate-pulse" />
                    <span>A Reproduzir Briefing...</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={16} className="text-slate-400" />
                    <span>Briefing em Áudio</span>
                  </>
                )}
              </div>

              {/* Equalizador animado quando tocando */}
              {isPlayingAudio && (
                <div className="flex items-end gap-1 h-6 py-1">
                  <div className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms] h-full" />
                  <div className="w-1.5 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_300ms] h-3/4" />
                  <div className="w-1.5 bg-amber-400 rounded-full animate-[bounce_1s_infinite_200ms] h-full" />
                  <div className="w-1.5 bg-emerald-300 rounded-full animate-[bounce_1s_infinite_400ms] h-1/2" />
                </div>
              )}

              <Button
                variant={isPlayingAudio ? 'secondary' : 'primary'}
                size="md"
                onClick={speakBriefing}
                className="w-full text-xs font-bold"
                leftIcon={isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
              >
                {isPlayingAudio ? 'Pausar Áudio' : '▶ Ouvir Briefing do Dia'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3. 🏆 GAMIFICAÇÃO & STREAK + ⚡ CRIADOR RÁPIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Sequência Diária & XP */}
        {widgetPrefs.showStreak && (
          <Card variant="default" padding="md" className="space-y-3 bg-slate-900 text-white border-none shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <Flame size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sequência Diária</span>
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    🔥 {streakCount} Dias Seguidos!
                  </h3>
                </div>
              </div>
              <Badge variant="warning" size="sm" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                Nível {userLevel}
              </Badge>
            </div>

            {/* Barra de Progresso de XP */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{currentXPInLevel} / 100 XP</span>
                <span className="text-amber-400 font-bold">Total: {totalXP} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${currentXPInLevel}%` }}
                />
              </div>
            </div>

            {/* Conquistas / Badges */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Conquistas:</span>
              <div className="flex items-center gap-1.5">
                <span title="Primeiros Passos" className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">⚡</span>
                <span title="Sequência em Chamas" className="p-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs">🔥</span>
                <span title="Foco Absoluto" className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs">🎯</span>
                <span title="Mestre da Produtividade" className="p-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">👑</span>
              </div>
            </div>
          </Card>
        )}

        {/* ⚡ Criador Rápido Inteligente */}
        {widgetPrefs.showQuickCreate && (
          <Card variant="default" padding="md" className="lg:col-span-2 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Criador Rápido Inteligente</span>
              </div>
              <span className="text-xs text-slate-400">Texto ou Ditado por Voz</span>
            </div>

            <form onSubmit={handleQuickCreate} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Escreve uma nova tarefa rápida... Ex: Enviar relatório urgente"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  disabled={quickCreating}
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                    isListeningVoice ? 'text-rose-500 animate-pulse' : ''
                  }`}
                  title="Ditado por Voz"
                >
                  {isListeningVoice ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={quickCreating || !quickTitle.trim()}
                leftIcon={<Plus size={16} />}
                className="shrink-0"
              >
                {quickCreating ? 'A criar...' : 'Criar'}
              </Button>
            </form>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Dica: Usa o microfone para adicionar tarefas sem digitar.</span>
            </div>
          </Card>
        )}
      </div>

      {/* 🚀 ACESSO RÁPIDO A MÓDULOS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/app/students"
          className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-between shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-white/20">🎓</span>
            <span>Estudantes &amp; IA</span>
          </div>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/app/family"
          className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-between shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-white/20">👨‍👩‍👧‍👦</span>
            <span>Casa &amp; Família</span>
          </div>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/app/goals"
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-between shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-white/20">🏆</span>
            <span>Metas &amp; XP</span>
          </div>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/app/lists"
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-between shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-white/20">📋</span>
            <span>Listas por Voz</span>
          </div>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Continuidade (Histórico de Ontem para Hoje) */}
      {continuityText && (
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <RotateCcw size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{continuityText}</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Continuidade</span>
        </div>
      )}

      {/* 4. RECONHECIMENTO "ESTÁ FEITO POR HOJE" */}
      {isDoneForToday && doneForTodayMessage && (
        <Card
          variant="default"
          padding="lg"
          className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Check size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Está feito por hoje!</h2>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-0.5">
                {doneForTodayMessage}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 5. METRICAS DE RENDIMENTO SEMANAL & CARTÃO DE FOCO ABSOLUTO (POMODORO) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📊 Rendimento Semanal */}
        {widgetPrefs.showYield && (
          <Card variant="default" padding="lg" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-base">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Rendimento Semanal</span>
              </div>
              <Badge variant="primary" size="sm">Semana Atual</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Conclusão de Tarefas</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">85%</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">↑ 12%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Horas de Foco</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">14.5h</span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Meta: 15h</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Metas Atingidas</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">3 / 4</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">75%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ⏱️ Cartão de Foco Absoluto (Pomodoro) */}
        {widgetPrefs.showPomodoro && (
          <Card
            variant="default"
            padding="lg"
            className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-xl flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-extrabold text-base text-white">Foco Absoluto (25m)</h3>
                </div>
                <Badge variant={isPomodoroRunning ? 'warning' : 'default'} size="sm">
                  {isPomodoroRunning ? 'Em Curso' : 'Pausa'}
                </Badge>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs text-xs text-indigo-200">
                <span className="block text-[10px] uppercase font-bold text-indigo-300">Tarefa em Foco:</span>
                <span className="font-bold text-white truncate block mt-0.5">{currentPomodoroTask}</span>
              </div>

              {/* Mostrador de Tempo grande */}
              <div className="text-center py-2">
                <span className="text-4xl font-extrabold font-mono tracking-wider text-white">
                  {formatTime(pomodoroSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <Button
                variant={isPomodoroRunning ? 'secondary' : 'primary'}
                size="sm"
                onClick={togglePomodoro}
                className="flex-1"
                leftIcon={isPomodoroRunning ? <Pause size={14} /> : <Play size={14} />}
              >
                {isPomodoroRunning ? 'Pausar' : 'Iniciar Foco'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetPomodoro}
                className="text-slate-300 border-white/20 hover:bg-white/10"
              >
                <RotateCcw size={14} />
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* 6. BLOCO "AGORA" & SUGESTÃO NEXO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          variant="default"
          padding="lg"
          className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-none shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Agora
                </span>
              </div>
              <Badge variant="primary" size="sm">
                Contexto Real
              </Badge>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">{nowSection.title}</h2>
              <p className="text-sm text-slate-300 mt-1">{nowSection.description}</p>
            </div>

            {nowSection.suggestedTask && (
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center justify-between gap-3 mt-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                    Sugestão para este momento
                  </span>
                  <span className="text-sm font-semibold text-white truncate block mt-0.5">
                    {nowSection.suggestedTask.title}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleTaskToggle(
                      nowSection.suggestedTask!.id,
                      nowSection.suggestedTask!.status,
                      nowSection.suggestedTask!.title
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Começar</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-white/10 mt-6 text-xs text-slate-400">
            <span>ENTRAR → ENTENDER → AGIR → PROGREDIR</span>
          </div>
        </Card>

        {/* Bloco "Sugestão do NEXO" */}
        <Card
          variant="default"
          padding="lg"
          className="bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Sugestão do NEXO
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {nexoSuggestion
                ? nexoSuggestion.text
                : 'O teu dia está em bom ritmo. Podes focar-te nas tuas prioridades sem pressão.'}
            </p>
          </div>

          <div className="pt-4">
            {nexoSuggestion ? (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (nexoSuggestion.actionType === 'organize_day') {
                    setActiveModal('organize_today');
                  } else if (nexoSuggestion.targetId) {
                    const foundTask = currentFocus.find((f) => f.rawItem?.id === nexoSuggestion.targetId);
                    if (foundTask) {
                      handleTaskToggle(foundTask.rawItem.id, foundTask.rawItem.status, foundTask.title);
                    }
                  }
                }}
                leftIcon={<Flame size={16} />}
              >
                {nexoSuggestion.buttonText}
              </Button>
            ) : (
              <Link to="/app/tasks">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Tarefas
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>

      {/* 7. FOCO DE HOJE (Máximo 3 Prioridades Essenciais) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Foco de hoje
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              As 3 prioridades essenciais para a tua atenção agora.
            </p>
          </div>
          <Link
            to="/app/tasks"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {currentFocus.length === 0 ? (
          <Card padding="lg" variant="default" className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sem prioridades urgentes pendentes. O teu dia está equilibrado!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentFocus.map((item) => (
              <Card
                key={item.id}
                variant="default"
                padding="md"
                className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        item.priorityLabel === 'Urgente'
                          ? 'danger'
                          : item.priorityLabel === 'Próximo'
                          ? 'primary'
                          : 'default'
                      }
                      size="sm"
                    >
                      {item.priorityLabel}
                    </Badge>
                    {item.type === 'task' && (
                      <button
                        onClick={() =>
                          handleTaskToggle(
                            item.rawItem.id,
                            item.rawItem.status,
                            item.title
                          )
                        }
                        className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Concluir prioridade"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="capitalize">{item.type}</span>
                  {item.timeInfo && (
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {item.timeInfo}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Alertas Inteligentes de Atenção */}
      {smartAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Atenção
          </h3>
          {smartAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                alert.type === 'danger'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                  : alert.type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {alert.type === 'danger' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : alert.type === 'warning' ? (
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-semibold">{alert.message}</span>
              </div>
              {alert.type === 'danger' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal('organize_today')}
                  className="shrink-0"
                >
                  Organizar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 8. FECHO DO DIA — DAILY CHECKOUT NOTURNO */}
      {isEveningCheckoutTime && !dismissCheckout && (
        <Card
          variant="default"
          padding="lg"
          className="bg-indigo-900 text-white border-none shadow-xl space-y-4 relative"
        >
          <button
            onClick={() => setDismissCheckout(true)}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Agora não"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-300" />
            <h3 className="font-extrabold text-lg text-white">Antes de terminares o dia</h3>
          </div>

          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            {checkoutSummary.tomorrowHeadline} Como avalias o teu dia de hoje?
          </p>

          {/* Avaliação de Sentimento do Dia */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setEveningMood('calm')}
              className={`flex-1 p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                eveningMood === 'calm'
                  ? 'bg-indigo-700 border-white text-white'
                  : 'bg-white/10 border-white/10 text-indigo-200 hover:bg-white/20'
              }`}
            >
              😴 Calmo
            </button>
            <button
              onClick={() => setEveningMood('productive')}
              className={`flex-1 p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                eveningMood === 'productive'
                  ? 'bg-indigo-700 border-white text-white'
                  : 'bg-white/10 border-white/10 text-indigo-200 hover:bg-white/20'
              }`}
            >
              ⚡ Produtivo
            </button>
            <button
              onClick={() => setEveningMood('awesome')}
              className={`flex-1 p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                eveningMood === 'awesome'
                  ? 'bg-indigo-700 border-white text-white'
                  : 'bg-white/10 border-white/10 text-indigo-200 hover:bg-white/20'
              }`}
            >
              🚀 Incrível
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs text-center">
              <span className="text-xs text-indigo-300 block">Concluídas</span>
              <span className="text-xl font-extrabold text-white">{completedTodayCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs text-center">
              <span className="text-xs text-indigo-300 block">Pendentes</span>
              <span className="text-xl font-extrabold text-white">{pendingTodayCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs text-center">
              <span className="text-xs text-indigo-300 block">Amanhã (Eventos)</span>
              <span className="text-xl font-extrabold text-white">{checkoutSummary.tomorrowEventsCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs text-center">
              <span className="text-xs text-indigo-300 block">Amanhã (Tarefas)</span>
              <span className="text-xl font-extrabold text-white">{checkoutSummary.tomorrowTasksCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissCheckout(true)}
              className="text-indigo-200 border-indigo-700 hover:bg-white/10 hover:text-white"
            >
              Agora não
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveModal('organize_tomorrow')}
              leftIcon={<Sparkles size={16} />}
            >
              Organizar amanhã
            </Button>
          </div>
        </Card>
      )}

      {/* 9. PREPARAR O DIA SEGUINTE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Preparar o dia seguinte
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prévia dos teus compromissos e tarefas para amanhã.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal('organize_tomorrow')}
            leftIcon={<CalendarDays size={16} />}
          >
            Organizar amanhã
          </Button>
        </div>

        {tomorrowPlan.length === 0 ? (
          <Card padding="md" variant="default" className="text-center py-6">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Amanhã ainda não tens tarefas nem compromissos agendados.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tomorrowPlan.slice(0, 3).map((slot, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {slot.title}
                  </p>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                    {slot.timeSlot}
                  </span>
                </div>
                <Badge variant={slot.type === 'event' ? 'primary' : 'default'} size="sm">
                  {slot.type === 'event' ? 'Agenda' : 'Tarefa'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10. "O TEU DIA" & ASSISTENTE IA */}
      {widgetPrefs.showTimeline && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Linha de Tempo Compacta */}
          <Card variant="default" padding="lg" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>O teu dia</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {dayTimeline.length} itens agendados
              </span>
            </div>

            {dayTimeline.length === 0 ? (
              <EmptyState
                title="Sem itens agendados"
                description="A tua linha de tempo para hoje está livre."
              />
            ) : (
              <div className="space-y-3">
                {dayTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
                  >
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 w-14 shrink-0 pt-0.5">
                      {item.time}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </p>
                    </div>
                    <Badge variant={item.type === 'event' ? 'primary' : 'default'} size="sm">
                      {item.type === 'event' ? 'Agenda' : 'Tarefa'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Input Inteligente do Assistente IA */}
          <Card variant="default" padding="lg" className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  O que precisas hoje?
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pede à IA em linguagem natural para organizar o teu dia ou responder a dúvidas.
              </p>

              <form onSubmit={handleAiSubmit} className="space-y-3 pt-1">
                <Input
                  placeholder="Ex: Tenho muita coisa hoje, organiza..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={aiLoading}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={aiLoading || !aiPrompt.trim()}
                  leftIcon={<Send size={14} />}
                >
                  {aiLoading ? 'A processar...' : 'Enviar para IA'}
                </Button>
              </form>

              {aiResponse && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1 mt-2">
                  <span className="font-bold block text-indigo-600 dark:text-indigo-400">
                    Resposta do NEXO:
                  </span>
                  <p className="leading-relaxed">{aiResponse}</p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Seguro · RLS · Supabase Edge Function
            </div>
          </Card>
        </div>
      )}

      {/* 11. ACÇÕES RÁPIDAS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Acções Rápidas
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveModal('task')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">+ Tarefa</span>
          </button>

          <button
            onClick={() => setActiveModal('event')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">+ Evento</span>
          </button>

          <button
            onClick={() => setActiveModal('list')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ListChecks size={20} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">+ Lista</span>
          </button>

          <Link
            to="/app/goals"
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target size={20} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">+ Objectivo</span>
          </Link>
        </div>
      </div>

      {/* Empty State Tranquilo */}
      {isEmpty && (
        <Card variant="default" padding="lg" className="text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Check size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Dia calmo e sem pendências!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Não tens compromissos pendentes nem tarefas urgentes agendadas para hoje. Aproveita o tempo para descansar ou planear a semana.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal('task')}
            leftIcon={<Plus size={16} />}
          >
            Criar nova tarefa
          </Button>
        </Card>
      )}

      {/* MODAL DE PERSONALIZAÇÃO DO PAINEL */}
      {activeModal === 'customize' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                <SlidersHorizontal size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Personalizar Visibilidade do Painel</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {[
                { id: 'showBriefing', label: '🎙️ Briefing em Áudio & Previsão de Energia' },
                { id: 'showStreak', label: '🔥 Sequência Diária & Nível XP' },
                { id: 'showQuickCreate', label: '⚡ Criador Rápido Inteligente' },
                { id: 'showYield', label: '📊 Rendimento Semanal' },
                { id: 'showPomodoro', label: '⏱️ Foco Absoluto (Pomodoro)' },
                { id: 'showTimeline', label: '🕒 Linha de Tempo "O teu dia"' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={(widgetPrefs as any)[item.id]}
                    onChange={(e) => updateWidgetPref(item.id as keyof WidgetPreferences, e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setActiveModal(null)}
              >
                Sair
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setActiveModal(null)}
              >
                Guardar Preferências
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Acção */}
      <TaskFormModal isOpen={activeModal === 'task'} onClose={() => setActiveModal(null)} />
      <EventFormModal isOpen={activeModal === 'event'} onClose={() => setActiveModal(null)} />
      <ListFormModal isOpen={activeModal === 'list'} onClose={() => setActiveModal(null)} />
      <OrganizeDayModal
        isOpen={activeModal === 'organize_today'}
        onClose={() => setActiveModal(null)}
        plan={organizeDayPlan}
        title="Organizar o meu dia"
      />
      <OrganizeDayModal
        isOpen={activeModal === 'organize_tomorrow'}
        onClose={() => setActiveModal(null)}
        plan={tomorrowPlan}
        title="Organizar amanhã"
        description="Proposta de horário recomendada para o teu dia de amanhã. Confirma antes de aplicar."
      />
    </div>
  );
};

export default DashboardPage;
