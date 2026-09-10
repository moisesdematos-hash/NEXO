import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useEvents } from './useEvents';
import { useGoals } from './useGoals';
import { useLearning } from './useLearning';
import { TaskRow } from '../services/tasksService';
import { EventRow } from '../services/eventsService';

export interface FocusItem {
  id: string;
  type: 'task' | 'event' | 'goal' | 'learning';
  title: string;
  subtitle: string;
  priorityLabel: 'Urgente' | 'Hoje' | 'Próximo' | 'Meta';
  timeInfo?: string;
  rawItem: any;
}

export interface SmartAlert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
}

export interface NexoSuggestion {
  text: string;
  actionType: 'start_task' | 'plan_study' | 'organize_day' | 'create_task';
  buttonText: string;
  targetId?: string;
}

export interface DayPlanSlot {
  timeSlot: string;
  title: string;
  type: 'event' | 'task';
  itemId?: string;
}

export interface CheckoutSummary {
  completedTodayCount: number;
  pendingTodayCount: number;
  tomorrowEventsCount: number;
  tomorrowTasksCount: number;
  tomorrowHeadline: string;
}

export interface TodayContext {
  isLoading: boolean;
  overdueTasks: TaskRow[];
  todayTasks: TaskRow[];
  todayEvents: EventRow[];
  currentEvent: EventRow | null;
  nextEvent: EventRow | null;
  freeWindowMinutes: number | null;
  currentFocus: FocusItem[];
  nowSection: {
    title: string;
    description: string;
    suggestedTask?: TaskRow;
  };
  dayTimeline: { time: string; title: string; type: 'event' | 'task' }[];
  smartAlerts: SmartAlert[];
  nexoSuggestion: NexoSuggestion | null;
  organizeDayPlan: DayPlanSlot[];
  isEmpty: boolean;

  // Daily Loop Extensions
  completedTodayCount: number;
  pendingTodayCount: number;
  progressSummaryText: string;
  isAllPrioritiesDone: boolean;
  isDoneForToday: boolean;
  doneForTodayMessage: string | null;
  isEveningCheckoutTime: boolean;
  checkoutSummary: CheckoutSummary;
  tomorrowEvents: EventRow[];
  tomorrowTasks: TaskRow[];
  tomorrowPlan: DayPlanSlot[];
  continuityText: string | null;
}

export function useTodayContext(): TodayContext {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { events, isLoading: eventsLoading } = useEvents();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { objectives, isLoading: learningLoading } = useLearning();

  const isLoading = tasksLoading || eventsLoading || goalsLoading || learningLoading;

  return useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const currentHour = now.getHours();

    // 1. Filter Tasks
    const overdueTasks = tasks.filter((t) => {
      if (t.status === 'completed' || !t.due_date) return false;
      return new Date(t.due_date) < now && !t.due_date.startsWith(todayStr);
    });

    const todayTasks = tasks.filter((t) => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return true;
      return t.due_date.startsWith(todayStr) || new Date(t.due_date) < now;
    });

    const completedTodayTasks = tasks.filter((t) => {
      if (t.status !== 'completed') return false;
      if (t.updated_at && t.updated_at.startsWith(todayStr)) return true;
      if (t.due_date && t.due_date.startsWith(todayStr)) return true;
      return false;
    });

    const tomorrowTasks = tasks.filter((t) => {
      if (t.status === 'completed' || !t.due_date) return false;
      return t.due_date.startsWith(tomorrowStr);
    });

    // 2. Filter Events
    const todayEvents = events
      .filter((e) => {
        const start = new Date(e.start_time);
        return start.toISOString().split('T')[0] === todayStr || (start <= now && new Date(e.end_time) >= now);
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const tomorrowEvents = events
      .filter((e) => {
        const start = new Date(e.start_time);
        return start.toISOString().split('T')[0] === tomorrowStr;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const currentEvent =
      todayEvents.find((e) => {
        const start = new Date(e.start_time);
        const end = new Date(e.end_time);
        return start <= now && now <= end;
      }) || null;

    const nextEvent = todayEvents.find((e) => new Date(e.start_time) > now) || null;

    let freeWindowMinutes: number | null = null;
    if (nextEvent) {
      const diffMs = new Date(nextEvent.start_time).getTime() - now.getTime();
      freeWindowMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    }

    // 3. Calculate Deterministic Top 3 Focus Items
    const focusCandidates: FocusItem[] = [];

    // Overdue high priority tasks
    overdueTasks.forEach((t) => {
      focusCandidates.push({
        id: `task-${t.id}`,
        type: 'task',
        title: t.title,
        subtitle: 'Venceu antes de hoje · Tarefa Atrasada',
        priorityLabel: 'Urgente',
        rawItem: t,
      });
    });

    // Upcoming events starting soon
    if (nextEvent) {
      const eventStart = new Date(nextEvent.start_time);
      const timeStr = eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      focusCandidates.push({
        id: `event-${nextEvent.id}`,
        type: 'event',
        title: nextEvent.title,
        subtitle: `Próximo Evento às ${timeStr}`,
        priorityLabel: 'Próximo',
        timeInfo: timeStr,
        rawItem: nextEvent,
      });
    }

    // High priority today tasks
    todayTasks.forEach((t) => {
      if (!focusCandidates.some((c) => c.id === `task-${t.id}`)) {
        focusCandidates.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          subtitle: t.due_date ? `Vence hoje` : 'Sem prazo definido',
          priorityLabel: t.priority === 'urgent' || t.priority === 'high' ? 'Urgente' : 'Hoje',
          rawItem: t,
        });
      }
    });

    // Active learning objectives / goals if candidates are scarce
    objectives
      .filter((o) => !o.is_completed)
      .forEach((o) => {
        if (focusCandidates.length < 5) {
          focusCandidates.push({
            id: `learning-${o.id}`,
            type: 'learning',
            title: o.title,
            subtitle: `Progresso: ${o.progress_percent}%`,
            priorityLabel: 'Meta',
            rawItem: o,
          });
        }
      });

    const currentFocus = focusCandidates.slice(0, 3);

    // 4. "Agora" Section Logic
    let nowTitle = 'Dia Livre';
    let nowDesc = 'Não tens nenhum compromisso urgente agora.';
    let suggestedTaskForNow: TaskRow | undefined;

    if (currentEvent) {
      nowTitle = `Em curso: ${currentEvent.title}`;
      nowDesc = `Termina às ${new Date(currentEvent.end_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (nextEvent && freeWindowMinutes !== null) {
      nowTitle = `${freeWindowMinutes} minutos livres antes do próximo evento`;
      nowDesc = `Próximo: ${nextEvent.title} às ${new Date(nextEvent.start_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      suggestedTaskForNow = todayTasks.find((t) => t.status !== 'completed');
    } else if (todayTasks.length > 0) {
      suggestedTaskForNow = todayTasks[0];
      nowTitle = 'Tempo disponível';
      nowDesc = `A tarefa mais importante disponível é "${suggestedTaskForNow.title}"`;
    }

    // 5. Day Timeline
    const dayTimeline: { time: string; title: string; type: 'event' | 'task' }[] = [];
    todayEvents.forEach((e) => {
      const timeStr = new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      dayTimeline.push({ time: timeStr, title: e.title, type: 'event' });
    });
    todayTasks.slice(0, 3).forEach((t) => {
      const timeStr = t.due_date
        ? new Date(t.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Dia todo';
      dayTimeline.push({ time: timeStr, title: t.title, type: 'task' });
    });

    // 6. Smart Alerts
    const smartAlerts: SmartAlert[] = [];
    if (overdueTasks.length > 0) {
      smartAlerts.push({
        id: 'overdue-alert',
        type: 'danger',
        message: `⚠️ Tens ${overdueTasks.length} ${overdueTasks.length === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}.`,
      });
    }
    if (nextEvent && freeWindowMinutes !== null && freeWindowMinutes <= 30 && freeWindowMinutes > 0) {
      smartAlerts.push({
        id: 'event-soon-alert',
        type: 'warning',
        message: `O teu próximo evento ("${nextEvent.title}") começa daqui a ${freeWindowMinutes} minutos.`,
      });
    }
    if (todayTasks.length >= 5) {
      smartAlerts.push({
        id: 'density-alert',
        type: 'info',
        message: `Tens ${todayTasks.length} tarefas concentradas para hoje. Considera priorizar as mais importantes.`,
      });
    }

    // 7. NEXO Contextual Suggestion
    let nexoSuggestion: NexoSuggestion | null = null;
    if (freeWindowMinutes !== null && freeWindowMinutes >= 20 && suggestedTaskForNow) {
      nexoSuggestion = {
        text: `Tens ${freeWindowMinutes} minutos livres antes de "${nextEvent?.title}". Queres aproveitar para trabalhar em "${suggestedTaskForNow.title}"?`,
        actionType: 'start_task',
        buttonText: 'Fazer agora',
        targetId: suggestedTaskForNow.id,
      };
    } else if (overdueTasks.length > 0) {
      nexoSuggestion = {
        text: `Tens tarefas pendentes de dias anteriores. Posso ajudar-te a reorganizar o teu dia.`,
        actionType: 'organize_day',
        buttonText: 'Organizar o meu dia',
      };
    } else if (todayTasks.length > 3) {
      nexoSuggestion = {
        text: `O teu dia está bastante cheio. Queres criar uma proposta de horário estruturada?`,
        actionType: 'organize_day',
        buttonText: 'Organizar o meu dia',
      };
    } else if (objectives.some((o) => !o.is_completed)) {
      const activeObj = objectives.find((o) => !o.is_completed);
      nexoSuggestion = {
        text: `Tens o objectivo de aprendizagem "${activeObj?.title}" activo. Queres dedicar tempo a este tema hoje?`,
        actionType: 'plan_study',
        buttonText: 'Planear estudo',
        targetId: activeObj?.id,
      };
    }

    // 8. Organize Day Proposal Plan (Today & Tomorrow)
    const organizeDayPlan: DayPlanSlot[] = [];
    let startHour = 9;
    todayEvents.forEach((e) => {
      const eventStart = new Date(e.start_time);
      const timeStr = eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      organizeDayPlan.push({ timeSlot: timeStr, title: e.title, type: 'event', itemId: e.id });
    });
    todayTasks.forEach((t) => {
      const slotTime = `${String(startHour).padStart(2, '0')}:00–${String(startHour).padStart(2, '0')}:45`;
      organizeDayPlan.push({ timeSlot: slotTime, title: t.title, type: 'task', itemId: t.id });
      startHour += 1;
    });

    const tomorrowPlan: DayPlanSlot[] = [];
    let tmrStartHour = 9;
    tomorrowEvents.forEach((e) => {
      const eventStart = new Date(e.start_time);
      const timeStr = eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      tomorrowPlan.push({ timeSlot: timeStr, title: e.title, type: 'event', itemId: e.id });
    });
    tomorrowTasks.forEach((t) => {
      const slotTime = `${String(tmrStartHour).padStart(2, '0')}:00–${String(tmrStartHour).padStart(2, '0')}:45`;
      tomorrowPlan.push({ timeSlot: slotTime, title: t.title, type: 'task', itemId: t.id });
      tmrStartHour += 1;
    });

    const isEmpty = todayTasks.length === 0 && todayEvents.length === 0 && overdueTasks.length === 0;

    // 9. Daily Loop - Progress, Done State & Checkout
    const completedTodayCount = completedTodayTasks.length;
    const pendingTodayCount = todayTasks.length;

    const urgentOrHighTasks = todayTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');
    const isAllPrioritiesDone =
      urgentOrHighTasks.length === 0 && overdueTasks.length === 0 && currentFocus.length === 0;

    const isDoneForToday =
      isAllPrioritiesDone && (completedTodayCount > 0 || (todayTasks.length === 0 && todayEvents.length === 0));

    let doneForTodayMessage: string | null = null;
    if (isDoneForToday && !isEmpty) {
      if (todayTasks.length > 0) {
        doneForTodayMessage = `Está feito por hoje. Concluíste as tuas prioridades principais. Ainda existem ${todayTasks.length} tarefas menores, mas nenhuma é urgente. Podes deixar o resto para amanhã.`;
      } else {
        doneForTodayMessage = `Está feito por hoje. Concluíste todas as tuas tarefas e compromissos de hoje. Podes descansar.`;
      }
    }

    let progressSummaryText = '';
    if (completedTodayCount > 0) {
      progressSummaryText = `✓ Concluíste ${completedTodayCount} ${completedTodayCount === 1 ? 'item' : 'itens'} de hoje.`;
      if (todayTasks.length > 0) {
        progressSummaryText += ` Faltam ${todayTasks.length} ${todayTasks.length === 1 ? 'prioridade' : 'prioridades'}.`;
      }
    } else if (todayTasks.length > 0) {
      progressSummaryText = `Tens ${todayTasks.length} ${todayTasks.length === 1 ? 'tarefa pendente' : 'tarefas pendentes'} para hoje.`;
    }

    // Evening Checkout Trigger
    const isEveningCheckoutTime = currentHour >= 19 || (currentHour >= 17 && isDoneForToday);

    const tomorrowEventsCount = tomorrowEvents.length;
    const tomorrowTasksCount = tomorrowTasks.length;

    let tomorrowHeadline = 'Amanhã o teu dia está livre.';
    if (tomorrowEventsCount > 2) {
      tomorrowHeadline = 'Amanhã tens uma manhã ocupada.';
    } else if (tomorrowEventsCount > 0 || tomorrowTasksCount > 0) {
      tomorrowHeadline = `Amanhã tens ${tomorrowEventsCount} ${tomorrowEventsCount === 1 ? 'evento' : 'eventos'} e ${tomorrowTasksCount} ${tomorrowTasksCount === 1 ? 'tarefa' : 'tarefas'}.`;
    }

    const checkoutSummary: CheckoutSummary = {
      completedTodayCount,
      pendingTodayCount,
      tomorrowEventsCount,
      tomorrowTasksCount,
      tomorrowHeadline,
    };

    // Continuity Text (Yesterday -> Today)
    let continuityText: string | null = null;
    if (overdueTasks.length > 0) {
      continuityText = `A tua tarefa "${overdueTasks[0].title}" continuou pendente de ontem.`;
    } else if (completedTodayCount > 0) {
      continuityText = `A tua tarefa "${completedTodayTasks[0].title}" foi concluída hoje com sucesso.`;
    }

    return {
      isLoading,
      overdueTasks,
      todayTasks,
      todayEvents,
      currentEvent,
      nextEvent,
      freeWindowMinutes,
      currentFocus,
      nowSection: {
        title: nowTitle,
        description: nowDesc,
        suggestedTask: suggestedTaskForNow,
      },
      dayTimeline,
      smartAlerts,
      nexoSuggestion,
      organizeDayPlan,
      isEmpty,

      // Daily Loop Extensions
      completedTodayCount,
      pendingTodayCount,
      progressSummaryText,
      isAllPrioritiesDone,
      isDoneForToday,
      doneForTodayMessage,
      isEveningCheckoutTime,
      checkoutSummary,
      tomorrowEvents,
      tomorrowTasks,
      tomorrowPlan,
      continuityText,
    };
  }, [tasks, events, goals, objectives, isLoading]);
}
