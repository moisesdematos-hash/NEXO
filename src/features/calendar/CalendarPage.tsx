import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Trash2,
  Edit3,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
  Sparkles,
  ExternalLink,
  Video,
  Coffee,
  AlertTriangle,
  Mic,
  MicOff,
  Filter,
  SlidersHorizontal,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { EventFormModal } from './components/EventFormModal';
import { EventRow } from '../../services/eventsService';
import { downloadAllEventsICS, downloadEventICS, getGoogleCalendarUrl } from '../../utils/calendarExport';

type CalendarViewMode = 'daily' | 'weekly' | 'monthly';
type EventCategory = 'all' | 'work' | 'personal' | 'health' | 'leisure';

interface AgendaPreferences {
  showBriefing: boolean;
  showQuickAdd: boolean;
  showCategoryFilters: boolean;
  showViewsNav: boolean;
}

const DEFAULT_AGENDA_PREFS: AgendaPreferences = {
  showBriefing: true,
  showQuickAdd: true,
  showCategoryFilters: true,
  showViewsNav: true,
};

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, isLoading, isError, refetch, deleteEvent, createEvent } = useEvents();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventRow | null>(null);

  // Layout customization preferences
  const [agendaPrefs, setAgendaPrefs] = useState<AgendaPreferences>(() => {
    try {
      const saved = localStorage.getItem('nexo_agenda_widgets');
      return saved ? JSON.parse(saved) : DEFAULT_AGENDA_PREFS;
    } catch {
      return DEFAULT_AGENDA_PREFS;
    }
  });

  const updateAgendaPref = (key: keyof AgendaPreferences, value: boolean) => {
    const updated = { ...agendaPrefs, [key]: value };
    setAgendaPrefs(updated);
    try {
      localStorage.setItem('nexo_agenda_widgets', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save agenda prefs', e);
    }
  };

  // 1. CHAVE DE OURO — Voice Briefing State
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Quick Creator State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCreating, setQuickCreating] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // Screen reader announcements
  const [announcement, setAnnouncement] = useState('');

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePrev = () => {
    const next = new Date(selectedDate);
    if (viewMode === 'daily') {
      next.setDate(next.getDate() - 1);
    } else if (viewMode === 'weekly') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setSelectedDate(next);
  };

  const handleNext = () => {
    const next = new Date(selectedDate);
    if (viewMode === 'daily') {
      next.setDate(next.getDate() + 1);
    } else if (viewMode === 'weekly') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este evento?')) return;
    try {
      await deleteEvent(id);
      showToast('Evento eliminado da agenda.', 'info');
    } catch {
      showToast('Erro ao eliminar evento.', 'error');
    }
  };

  // Helper for video meeting links (Zoom, Meet, Teams, etc.)
  const getMeetingUrl = (e: EventRow): string | null => {
    const textToSearch = `${e.location || ''} ${e.description || ''} ${e.title || ''}`;
    const match = textToSearch.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
  };

  // Helper to categorize events based on title/description
  const getEventCategory = (e: EventRow): 'work' | 'personal' | 'health' | 'leisure' => {
    const titleLower = `${e.title} ${e.description || ''}`.toLowerCase();
    if (titleLower.match(/(médic|consult|exame|saúd|treino|gym|corrida)/i)) return 'health';
    if (titleLower.match(/(festa|jantar|almoço|aniversá|cinema|jogo|futebol)/i)) return 'leisure';
    if (titleLower.match(/(famíli|casa|compras|filh|espos|mãe|pai)/i)) return 'personal';
    return 'work';
  };

  // 1. Voice Briefing for Today's Agenda
  const speakAgendaBriefing = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Síntese de voz não é suportada neste navegador.', 'error');
      return;
    }

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    const todayEvents = events.filter((e) => {
      const start = new Date(e.start_time);
      return start.toDateString() === selectedDate.toDateString();
    });

    let text = '';
    const dateFormatted = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long' }).format(selectedDate);

    if (todayEvents.length === 0) {
      text = `Para o dia ${dateFormatted}, não tens nenhum compromisso agendado. A tua agenda está totalmente livre!`;
    } else {
      text = `Agenda para ${dateFormatted}. Tens ${todayEvents.length} compromissos agendados. `;
      todayEvents.forEach((ev, idx) => {
        const start = new Date(ev.start_time);
        const timeStr = ev.is_all_day
          ? 'o dia inteiro'
          : `às ${start.getHours()} horas e ${start.getMinutes() === 0 ? 'zero minutos' : start.getMinutes() + ' minutos'}`;
        text += `O ${idx + 1}º evento é ${ev.title}, ${timeStr}. `;
      });
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    window.speechSynthesis.cancel();
    setIsPlayingVoice(true);
    window.speechSynthesis.speak(utterance);
  };

  // Quick Event Add
  const handleQuickCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || quickCreating) return;
    setQuickCreating(true);

    try {
      const start = new Date(selectedDate);
      start.setHours(10, 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      await createEvent({
        title: quickTitle.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_all_day: false,
      });

      showToast(`✓ Evento "${quickTitle}" agendado!`, 'success');
      setAnnouncement(`Evento "${quickTitle}" criado com sucesso.`);
      setQuickTitle('');
    } catch {
      showToast('Erro ao criar evento rápido.', 'error');
    } finally {
      setQuickCreating(false);
    }
  };

  // Voice Dictation
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Reconhecimento de voz não suportado neste navegador.', 'error');
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

  if (isLoading) return <LoadingState label="A carregar a sua agenda..." />;
  if (isError) return <ErrorState message="Não foi possível carregar a agenda." onRetry={() => refetch()} />;

  // Filter events based on viewMode, selectedDate & category
  const filteredEvents = events.filter((e) => {
    const start = new Date(e.start_time);

    // Category filter
    if (selectedCategory !== 'all') {
      const cat = getEventCategory(e);
      if (cat !== selectedCategory) return false;
    }

    if (viewMode === 'daily') {
      return start.toDateString() === selectedDate.toDateString();
    }

    if (viewMode === 'weekly') {
      const startOfWeek = new Date(selectedDate);
      const dayIndex = (startOfWeek.getDay() + 6) % 7; // Monday = 0
      startOfWeek.setDate(startOfWeek.getDate() - dayIndex);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      return start >= startOfWeek && start < endOfWeek;
    }

    // Monthly
    return (
      start.getMonth() === selectedDate.getMonth() &&
      start.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Calculate statistics & fatigue alerts for the selected day
  const todayEventsOnly = events.filter(
    (e) => new Date(e.start_time).toDateString() === selectedDate.toDateString()
  );

  let totalScheduledMinutes = 0;
  let hasOverlappingEvents = false;
  let hasBackToBackFatigue = false;

  todayEventsOnly.forEach((ev, idx) => {
    const start = new Date(ev.start_time);
    const end = new Date(ev.end_time);
    const durationMin = Math.max(15, (end.getTime() - start.getTime()) / (1000 * 60));
    totalScheduledMinutes += durationMin;

    if (idx > 0) {
      const prevEnd = new Date(todayEventsOnly[idx - 1].end_time);
      if (start < prevEnd) {
        hasOverlappingEvents = true;
      } else if (start.getTime() - prevEnd.getTime() <= 15 * 60 * 1000) {
        hasBackToBackFatigue = true;
      }
    }
  });

  const totalScheduledHours = (totalScheduledMinutes / 60).toFixed(1);

  const formattedDateTitle = new Intl.DateTimeFormat('pt-PT', {
    month: 'long',
    year: 'numeric',
    ...(viewMode === 'daily' ? { day: 'numeric', weekday: 'short' } : {}),
  }).format(selectedDate);

  // Helper for generating monthly grid days
  const getDaysInMonthGrid = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Monday start
    const daysInMonth = lastDayOfMonth.getDate();

    const gridDays: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      gridDays.push({ date: prevDate, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      gridDays.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }

    // Next month padding to fill grid 35 or 42 cells
    const remaining = (7 - (gridDays.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      gridDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return gridDays;
  };

  // Helper for generating weekly days (Monday - Sunday)
  const getDaysInWeek = () => {
    const startOfWeek = new Date(selectedDate);
    const dayIndex = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - dayIndex);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ARIA Live area */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Agenda & Calendário
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mt-0.5">
            {formattedDateTitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="md"
            leftIcon={<ArrowLeft size={18} />}
          >
            Voltar
          </Button>

          <Button
            onClick={() => {
              if (filteredEvents.length === 0) {
                showToast('Nenhum evento na vista atual para exportar.', 'info');
                return;
              }
              downloadAllEventsICS(filteredEvents, `nexo-agenda-${viewMode}.ics`);
              showToast(`${filteredEvents.length} eventos exportados em ficheiro .ics (iCal)!`, 'success');
            }}
            variant="secondary"
            size="sm"
            leftIcon={<ExternalLink size={15} />}
            className="text-xs font-bold"
          >
            Exportar Agenda (.ics)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizeOpen(true)}
            leftIcon={<SlidersHorizontal size={15} />}
            className="text-xs"
          >
            Personalizar
          </Button>
          <Button
            onClick={() => {
              setEventToEdit(null);
              setIsModalOpen(true);
            }}
            variant="primary"
            size="md"
            leftIcon={<Plus size={20} />}
          >
            Novo Evento
          </Button>
        </div>
      </div>

      {/* 🌟 1. [CHAVE DE OURO] 🎙️ BANNER DE CARGA HORÁRIA & AUDIO BRIEFING DA AGENDA */}
      {agendaPrefs.showBriefing && (
        <Card
          variant="default"
          padding="lg"
          className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white border-none shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/20 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  Resumo da Agenda
                </span>
                <span className="text-xs text-slate-400">· Análise NEXO</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Carga Horária: {totalScheduledHours}h Agendadas Hoje
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tens <span className="text-blue-300 font-bold">{todayEventsOnly.length} compromissos</span> para a data selecionada. 
                {hasOverlappingEvents ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1 inline-flex ml-1">
                    <AlertTriangle size={14} /> Atenção: Há sobreposição de horários!
                  </span>
                ) : hasBackToBackFatigue ? (
                  <span className="text-amber-300 font-bold flex items-center gap-1 inline-flex ml-1">
                    <Coffee size={14} /> Reuniões seguidas: Recomenda-se fazer pausas curtas.
                  </span>
                ) : (
                  ' O teu tempo está bem distribuído e sem conflitos aparentes.'
                )}
              </p>
            </div>

            {/* Botão de Áudio Briefing */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 space-y-3 min-w-[220px]">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-wider">
                {isPlayingVoice ? (
                  <>
                    <Volume2 size={16} className="text-emerald-400 animate-pulse" />
                    <span>A Ler Agenda...</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={16} className="text-slate-400" />
                    <span>Leitura por Voz</span>
                  </>
                )}
              </div>

              <Button
                variant={isPlayingVoice ? 'secondary' : 'primary'}
                size="md"
                onClick={speakAgendaBriefing}
                className="w-full text-xs font-bold"
                leftIcon={isPlayingVoice ? <Pause size={16} /> : <Play size={16} />}
              >
                {isPlayingVoice ? 'Pausar Áudio' : '▶ Ouvir Agenda do Dia'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ⚡ AGENDADOR RÁPIDO & FILTRO DE CATEGORIAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agendador Rápido por Texto ou Voz */}
        {agendaPrefs.showQuickAdd && (
          <Card variant="default" padding="md" className={`${agendaPrefs.showCategoryFilters ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-sm">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Agendador Rápido</span>
              </div>
              <span className="text-xs text-slate-400">Texto ou Ditado</span>
            </div>

            <form onSubmit={handleQuickCreateEvent} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Ex: Reunião de equipa às 10:00 ou Almoço de negócios"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  disabled={quickCreating}
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
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
                {quickCreating ? 'A agendar...' : '+ Agendar'}
              </Button>
            </form>
          </Card>
        )}

        {/* Filtro de Categorias */}
        {agendaPrefs.showCategoryFilters && (
          <Card variant="default" padding="md" className={`${agendaPrefs.showQuickAdd ? '' : 'lg:col-span-3'} space-y-3 flex flex-col justify-between`}>
            <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-sm">
              <Filter className="w-4 h-4 text-indigo-500" />
              <span>Filtrar por Categoria</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'work', label: '💼 Trabalho' },
                { id: 'personal', label: '🏠 Pessoal' },
                { id: 'health', label: '🏥 Saúde' },
                { id: 'leisure', label: '🎉 Lazer' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as EventCategory)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* NAV BAR DE NAVEGAÇÃO & ALTERNADOR DE VISTAS */}
      {agendaPrefs.showViewsNav && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Button onClick={handlePrev} variant="ghost" size="sm" aria-label="Anterior">
              <ChevronLeft size={20} />
            </Button>
            <Button onClick={handleToday} variant="secondary" size="sm">
              Hoje
            </Button>
            <Button onClick={handleNext} variant="ghost" size="sm" aria-label="Seguinte">
              <ChevronRight size={20} />
            </Button>
            <span className="text-sm font-bold text-slate-900 dark:text-white ml-2 capitalize">
              {formattedDateTitle}
            </span>
          </div>

          <Tabs
            tabs={[
              { id: 'daily', label: 'Vista Diária' },
              { id: 'weekly', label: 'Vista Semanal' },
              { id: 'monthly', label: 'Grelha Mensal' },
            ]}
            activeTab={viewMode}
            onChange={(id) => setViewMode(id as CalendarViewMode)}
          />
        </div>
      )}

      {/* 2. 🗓️ VISTA DE GRELHA MENSAL REAL (GRID 7x5) */}
      {viewMode === 'monthly' && (
        <Card padding="md" variant="default" className="space-y-3 overflow-x-auto">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 uppercase pb-2 border-b border-slate-200 dark:border-slate-700 min-w-[600px]">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Células da Grelha */}
          <div className="grid grid-cols-7 gap-1.5 min-w-[600px]">
            {getDaysInMonthGrid().map((dayObj, idx) => {
              const dayStr = dayObj.date.toDateString();
              const isToday = dayStr === new Date().toDateString();
              const isSelected = dayStr === selectedDate.toDateString();

              const dayEvents = events.filter(
                (ev) => new Date(ev.start_time).toDateString() === dayStr
              );

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dayObj.date)}
                  className={`min-h-[85px] p-2 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    !dayObj.isCurrentMonth
                      ? 'opacity-40 bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-400/30'
                      : isToday
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-emerald-500 text-white'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayObj.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        {dayEvents.length} {dayEvents.length === 1 ? 'evt' : 'evts'}
                      </span>
                    )}
                  </div>

                  {/* Badges de Eventos na Célula */}
                  <div className="space-y-1 mt-1 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 truncate"
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 block font-bold">
                        +{dayEvents.length - 2} mais
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* 3. ⏰ VISTA SEMANAL (WEEKLY CARDS) */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {getDaysInWeek().map((dayDate, idx) => {
            const dayStr = dayDate.toDateString();
            const isToday = dayStr === new Date().toDateString();
            const isSelected = dayStr === selectedDate.toDateString();

            const dayEvents = events.filter(
              (ev) => new Date(ev.start_time).toDateString() === dayStr
            );

            const dayLabel = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: 'numeric' }).format(dayDate);

            return (
              <Card
                key={idx}
                variant="default"
                padding="md"
                className={`space-y-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-400/20'
                    : isToday
                    ? 'border-emerald-500'
                    : ''
                }`}
                onClick={() => setSelectedDate(dayDate)}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className={`text-xs font-extrabold capitalize ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {dayLabel}
                  </span>
                  <Badge variant={dayEvents.length > 0 ? 'primary' : 'default'} size="sm">
                    {dayEvents.length}
                  </Badge>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {dayEvents.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic block py-4 text-center">Livre</span>
                  ) : (
                    dayEvents.map((e) => {
                      const start = new Date(e.start_time);
                      const timeStr = `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`;
                      return (
                        <div
                          key={e.id}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs space-y-1"
                        >
                          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 block">
                            {timeStr}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white line-clamp-2">
                            {e.title}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* LISTA DE EVENTOS (VISTA DIÁRIA E DETALHADA) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Compromissos para {formattedDateTitle}
          </h2>
          <span className="text-xs text-slate-500">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon size={28} />}
            title="Nenhum evento agendado"
            description={`Não existem compromissos agendados para ${formattedDateTitle}.`}
            actionLabel="+ Adicionar Evento"
            onAction={() => {
              setEventToEdit(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((e) => {
              const start = new Date(e.start_time);
              const end = new Date(e.end_time);
              const timeStr = e.is_all_day
                ? 'Dia Inteiro'
                : `${new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(start)} - ${new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(end)}`;

              const meetingUrl = getMeetingUrl(e);
              const category = getEventCategory(e);

              return (
                <Card
                  key={e.id}
                  variant="default"
                  padding="md"
                  className="hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          category === 'health'
                            ? 'danger'
                            : category === 'leisure'
                            ? 'warning'
                            : category === 'personal'
                            ? 'default'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {category === 'health'
                          ? 'Saúde'
                          : category === 'leisure'
                          ? 'Lazer'
                          : category === 'personal'
                          ? 'Pessoal'
                          : 'Trabalho'}
                      </Badge>

                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {e.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-mono font-bold">
                        <Clock size={14} />
                        <span>{timeStr}</span>
                      </div>

                      {e.location && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <MapPin size={14} />
                          <span>{e.location}</span>
                        </div>
                      )}
                    </div>

                    {e.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 line-clamp-2">
                        {e.description}
                      </p>
                    )}
                  </div>

                  {/* Botões de Ação Directa (Link de Reunião + Google Cal + .ics + Editar/Eliminar) */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-800 flex-wrap">
                    {meetingUrl && (
                      <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Video size={14} />
                        <span>🚀 Entrar na Reunião</span>
                        <ExternalLink size={12} />
                      </a>
                    )}

                    <a
                      href={getGoogleCalendarUrl(e)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                      title="Abrir no Google Calendar"
                    >
                      <CalendarIcon size={14} />
                      <span>Google Cal</span>
                    </a>

                    <button
                      onClick={() => {
                        downloadEventICS(e);
                        showToast(`Evento "${e.title}" descarregado em .ics`, 'info');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-all flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                      title="Descarregar ficheiro .ics (iCal/Outlook)"
                    >
                      <ExternalLink size={14} />
                      <span>.ics</span>
                    </button>

                    <button
                      onClick={() => {
                        setEventToEdit(e);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Editar Evento"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Eliminar Evento"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE PERSONALIZAÇÃO DA AGENDA */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                <SlidersHorizontal size={18} className="text-blue-600 dark:text-blue-400" />
                <span>Personalizar Visibilidade da Agenda</span>
              </div>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: 'showBriefing', label: '🎙️ Briefing por Voz & Carga Horária' },
                { id: 'showQuickAdd', label: '⚡ Agendador Rápido por Texto/Voz' },
                { id: 'showCategoryFilters', label: '🎨 Filtros por Categoria de Evento' },
                { id: 'showViewsNav', label: '🗓️ Navegação de Vistas (Diária/Semanal/Grelha)' },
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
                    checked={(agendaPrefs as any)[item.id]}
                    onChange={(e) => updateAgendaPref(item.id as keyof AgendaPreferences, e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                </label>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => setIsCustomizeOpen(false)}
            >
              Guardar Preferências
            </Button>
          </div>
        </div>
      )}

      {/* Modais de Ação */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventToEdit={eventToEdit}
      />
    </div>
  );
};

export default CalendarPage;
