import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  GraduationCap,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
  Award,
  ExternalLink,
  Mic,
  MicOff,
  SlidersHorizontal,
  X,
  Layers,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLearning, useLearningPlans, useLearningItems } from '../../hooks/useLearning';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { LearningObjectiveModal } from './components/LearningObjectiveModal';
import { FlashcardsModal } from './components/FlashcardsModal';
import { LessonModal } from './components/LessonModal';
import { learningService, LearningObjectiveRow, LearningPlanRow } from '../../services/learningService';

interface LearningPreferences {
  showTutorBriefing: boolean;
  showMetrics: boolean;
  showQuickAdd: boolean;
  showObjectives: boolean;
}

const DEFAULT_LEARNING_PREFS: LearningPreferences = {
  showTutorBriefing: true,
  showMetrics: true,
  showQuickAdd: true,
  showObjectives: true,
};

const PlanSection: React.FC<{
  objectiveId: string;
  courseTitle: string;
  plan: LearningPlanRow;
  onOpenLesson: (lessonId: string, lessonTitle: string, courseTitle: string, stageTitle: string, isCompleted: boolean) => void;
}> = ({ objectiveId, courseTitle, plan, onOpenLesson }) => {
  const { items, isLoading, addItem, toggleItem, deleteItem } = useLearningItems(objectiveId, plan.id);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    try {
      await addItem({
        plan_id: plan.id,
        title: newItemTitle.trim(),
        is_completed: false,
      });
      setNewItemTitle('');
      setShowAddForm(false);
      showToast('Módulo adicionado!', 'success');
    } catch {
      showToast('Erro ao adicionar módulo.', 'error');
    }
  };

  const handleQuickSpeak = (e: React.MouseEvent, itemTitle: string, itemId: string) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Síntese de voz não suportada neste dispositivo.', 'error');
      return;
    }

    if (playingItemId === itemId) {
      window.speechSynthesis.cancel();
      setPlayingItemId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `Módulo: ${itemTitle}. Clique em Estudar para ver a aula completa, exemplos práticos e mini-quiz com IA.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const lower = (courseTitle + ' ' + itemTitle).toLowerCase();
    if (lower.includes('ingl') || lower.includes('english')) {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'pt-PT';
    }
    utterance.onend = () => setPlayingItemId(null);
    utterance.onerror = () => setPlayingItemId(null);
    window.speechSynthesis.speak(utterance);
    setPlayingItemId(itemId);
  };

  const getUrlFromTitle = (text: string): string | null => {
    const match = text.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
  };

  const completedCount = items.filter((i) => i.is_completed).length;

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-xs overflow-hidden transition-all">
      {/* Header da Etapa */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-2.5 px-3 bg-slate-50/80 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <button 
            type="button"
            className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
            {plan.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            items.length > 0 && completedCount === items.length
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
          }`}>
            {completedCount} / {items.length}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForm(!showAddForm);
              if (!isExpanded) setIsExpanded(true);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors text-xs flex items-center gap-0.5"
            title="Adicionar aula a esta etapa"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="p-2.5 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
          {showAddForm && (
            <form onSubmit={handleAddItem} className="flex gap-1.5 pb-1">
              <Input
                placeholder="Nome da aula ou link..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="h-8 py-0 text-xs"
                autoFocus
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0 h-8 text-xs px-2.5">
                + Adicionar
              </Button>
            </form>
          )}

          {isLoading ? (
            <div className="text-[11px] text-slate-400 py-1 text-center">A carregar módulos...</div>
          ) : items.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic py-1">Nenhum módulo nesta etapa.</p>
          ) : (
            <div className="space-y-1.5">
              {items.map((item) => {
                const url = getUrlFromTitle(item.title);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800/80 transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleItem({ id: item.id, isCompleted: item.is_completed })}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 cursor-pointer p-0.5"
                        title={item.is_completed ? 'Marcar como não concluído' : 'Marcar como concluído'}
                      >
                        {item.is_completed ? (
                          <CheckSquare size={14} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square size={14} className="text-slate-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenLesson(item.id, item.title, courseTitle, plan.title, item.is_completed)}
                        className="text-left flex-1 min-w-0 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Abrir aula completa com IA e exercícios"
                      >
                        <span className={`truncate block text-xs ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-semibold'}`}>
                          {item.title}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleQuickSpeak(e, item.title, item.id)}
                        className={`p-1 px-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          playingItemId === item.id
                            ? 'bg-amber-400 text-slate-950 animate-pulse font-extrabold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title={playingItemId === item.id ? 'Parar áudio' : 'Ouvir título em áudio'}
                      >
                        <Volume2 size={11} className={playingItemId === item.id ? 'text-slate-950' : 'text-indigo-500'} />
                        <span className="hidden sm:inline">{playingItemId === item.id ? 'A Ouvir' : 'Áudio'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenLesson(item.id, item.title, courseTitle, plan.title, item.is_completed)}
                        className="p-1 px-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Estudar conteúdo da aula com IA"
                      >
                        <Sparkles size={11} className="text-amber-500" />
                        <span className="hidden sm:inline">Estudar</span>
                      </button>

                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-[10px] font-bold flex items-center gap-1"
                          title="Abrir Recurso Externo"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Eliminar Módulo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ObjectiveCard: React.FC<{
  objective: LearningObjectiveRow;
  onDelete: (id: string) => void;
  onOpenFlashcards: (title: string) => void;
  onOpenLesson: (lessonId: string, lessonTitle: string, courseTitle: string, stageTitle: string, isCompleted: boolean) => void;
}> = ({ objective, onDelete, onOpenFlashcards, onOpenLesson }) => {
  const queryClient = useQueryClient();
  const { plans, isLoading, createPlan } = useLearningPlans(objective.id);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const { showToast } = useToast();

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    try {
      await createPlan({
        objective_id: objective.id,
        title: newPlanTitle.trim(),
        order_index: plans.length,
      });
      setNewPlanTitle('');
      setShowAddPlan(false);
      showToast('Etapa de estudo criada!', 'success');
    } catch {
      showToast('Erro ao criar etapa.', 'error');
    }
  };

  const generateAiRoadmap = async () => {
    if (isGeneratingRoadmap) return;
    setIsGeneratingRoadmap(true);
    showToast(`A gerar roteiro e módulos para "${objective.title}" com IA...`, 'info');

    try {
      const result = await learningService.generateCourseCurriculum(objective.id, objective.title);
      queryClient.invalidateQueries({ queryKey: ['learning_plans', objective.id] });
      queryClient.invalidateQueries({ queryKey: ['learning_items'] });
      queryClient.invalidateQueries({ queryKey: ['learning_objectives'] });
      showToast(`✨ Roteiro criado com ${result.stagesCreated} etapas e ${result.topicsCreated} aulas práticas!`, 'success');
    } catch {
      showToast('Erro ao gerar roteiro.', 'error');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  return (
    <Card variant="default" padding="lg" className="flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all h-[520px] max-h-[520px]">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate" title={objective.title}>
                {objective.title}
              </h3>
              {objective.is_completed ? (
                <Badge variant="success" size="sm">Concluído</Badge>
              ) : (
                <Badge variant="primary" size="sm">Em Curso</Badge>
              )}
            </div>
            {objective.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{objective.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onOpenFlashcards(objective.title)}
              className="p-1.5 px-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Praticar Flashcards de Repetição Espaçada"
            >
              <Layers size={13} />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={generateAiRoadmap}
              disabled={isGeneratingRoadmap}
              className="p-1.5 px-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Gerar Roteiro Inteligente com IA"
            >
              <Sparkles size={13} className={isGeneratingRoadmap ? 'animate-spin text-indigo-500' : 'text-amber-500'} />
              <span className="hidden sm:inline">{isGeneratingRoadmap ? 'A gerar...' : 'Roteiro IA'}</span>
            </button>
            <button
              onClick={() => onDelete(objective.id)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Eliminar Objetivo"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500 font-bold">
            <span>Progresso do Tema</span>
            <span>{Math.round(objective.progress_percent || 0)}%</span>
          </div>
          <Progress value={objective.progress_percent || 0} color={objective.is_completed ? 'success' : 'primary'} />
        </div>
      </div>

      {/* Caixa Rolável de Conteúdo do Curso (Scrollable Box) */}
      <div className="flex-1 my-3 overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-1.5 px-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Etapas & Conteúdo ({plans.length})
          </span>
          <button
            type="button"
            onClick={() => setShowAddPlan(!showAddPlan)}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Plus size={12} />
            <span>Nova Etapa</span>
          </button>
        </div>

        {showAddPlan && (
          <form onSubmit={handleAddPlan} className="flex gap-1.5 mb-2">
            <Input
              placeholder="Nome da etapa (Ex: Etapa 1: Fundamentos)..."
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
              className="h-8 py-0 text-xs"
              autoFocus
            />
            <Button type="submit" variant="primary" size="sm" className="shrink-0 h-8 text-xs px-2.5">
              Adicionar
            </Button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-2.5 custom-scrollbar">
          {isLoading ? (
            <div className="text-xs text-slate-400 py-6 text-center">A carregar etapas de estudo...</div>
          ) : plans.length === 0 ? (
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col items-center justify-center text-center gap-2.5 h-full py-6">
              <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                📚 Este curso ainda não tem etapas geradas.
              </p>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400 max-w-xs">
                Crie etapas manualmente ou clique abaixo para gerar o currículo completo com IA.
              </p>
              <Button
                type="button"
                onClick={generateAiRoadmap}
                disabled={isGeneratingRoadmap}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <Sparkles size={13} className={isGeneratingRoadmap ? 'animate-spin text-amber-200' : 'text-amber-300'} />
                <span>{isGeneratingRoadmap ? 'A estruturar...' : '⚡ Gerar Módulos & Aulas'}</span>
              </Button>
            </div>
          ) : (
            plans.map((p) => (
              <PlanSection
                key={p.id}
                objectiveId={objective.id}
                courseTitle={objective.title}
                plan={p}
                onOpenLesson={onOpenLesson}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export const LearningPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { objectives, isLoading, isError, refetch, createObjective, deleteObjective } = useLearning();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Flashcards Modal state
  const [flashcardObjective, setFlashcardObjective] = useState<string | null>(null);

  // Lesson Modal state
  const [selectedLesson, setSelectedLesson] = useState<{
    lessonId: string;
    lessonTitle: string;
    courseTitle: string;
    stageTitle: string;
    isCompleted: boolean;
  } | null>(null);

  const handleOpenLesson = (
    lessonId: string,
    lessonTitle: string,
    courseTitle: string,
    stageTitle: string,
    isCompleted: boolean
  ) => {
    setSelectedLesson({ lessonId, lessonTitle, courseTitle, stageTitle, isCompleted });
  };

  // Voice Tutor State
  const [isPlayingTutor, setIsPlayingTutor] = useState(false);

  // Quick Creator State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCreating, setQuickCreating] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // Screen reader announcement
  const [announcement, setAnnouncement] = useState('');

  // Preferences state
  const [learningPrefs, setLearningPrefs] = useState<LearningPreferences>(() => {
    try {
      const saved = localStorage.getItem('nexo_learning_widgets');
      return saved ? JSON.parse(saved) : DEFAULT_LEARNING_PREFS;
    } catch {
      return DEFAULT_LEARNING_PREFS;
    }
  });

  const updateLearningPref = (key: keyof LearningPreferences, value: boolean) => {
    const updated = { ...learningPrefs, [key]: value };
    setLearningPrefs(updated);
    try {
      localStorage.setItem('nexo_learning_widgets', JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to save learning prefs', e);
    }
  };

  // Clean up speech synthesis
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 1. Voice Tutor Briefing
  const speakTutorBriefing = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Síntese de voz não suportada neste navegador.', 'error');
      return;
    }

    if (isPlayingTutor) {
      window.speechSynthesis.cancel();
      setIsPlayingTutor(false);
      return;
    }

    const totalCount = objectives.length;
    const completedCount = objectives.filter((o) => o.is_completed).length;

    let text = `Olá! Bem-vindo ao teu centro de aprendizagem do NEXO. `;
    if (totalCount === 0) {
      text += `Ainda não tens temas de estudo registados. Cria um novo tema para começares a organizar a tua aprendizagem!`;
    } else {
      text += `Atualmente tens ${totalCount} temas em estudo, dos quais ${completedCount} já foram concluídos. `;
      text += `A melhor forma de reteres o conhecimento é estudares em blocos curtos de 25 minutos com técnicas de repetição espaçada. Bons estudos!`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlayingTutor(false);
    utterance.onerror = () => setIsPlayingTutor(false);

    window.speechSynthesis.cancel();
    setIsPlayingTutor(true);
    window.speechSynthesis.speak(utterance);
  };

  // Quick Create Theme
  const handleQuickCreateTheme = async (e?: React.FormEvent, withAi = false, customTitle?: string) => {
    if (e) e.preventDefault();
    const titleToUse = (customTitle || quickTitle).trim();
    if (!titleToUse || quickCreating) return;
    setQuickCreating(true);

    try {
      const obj = await createObjective({
        title: titleToUse,
        description: withAi ? 'Curso completo com etapas e módulos gerados por IA' : 'Tema criado via Criador Rápido',
      });

      if (withAi) {
        showToast(`A estruturar etapas e módulos para "${titleToUse}" com IA...`, 'info');
        const res = await learningService.generateCourseCurriculum(obj.id, titleToUse);
        showToast(`✨ Curso "${titleToUse}" criado com ${res.stagesCreated} etapas e ${res.topicsCreated} aulas práticas!`, 'success');
      } else {
        showToast(`✓ Tema de estudo "${titleToUse}" criado!`, 'success');
      }

      setAnnouncement(`Tema "${titleToUse}" criado com sucesso.`);
      setQuickTitle('');
    } catch {
      showToast('Erro ao criar tema de estudo.', 'error');
    } finally {
      setQuickCreating(false);
    }
  };

  // Voice Dictation Input
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este objetivo de aprendizagem?')) return;
    try {
      await deleteObjective(id);
      showToast('Objetivo eliminado.', 'info');
    } catch {
      showToast('Erro ao eliminar objetivo.', 'error');
    }
  };

  if (isLoading) return <LoadingState label="A carregar área de aprendizagem..." />;
  if (isError) return <ErrorState message="Não foi possível carregar os objetivos de aprendizagem." onRetry={() => refetch()} />;

  const completedCount = objectives.filter((o) => o.is_completed).length;
  const avgProgress = objectives.length > 0
    ? Math.round(objectives.reduce((acc, o) => acc + (o.progress_percent || 0), 0) / objectives.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ARIA Live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Aprender & Planos de Estudo
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize o seu conhecimento em etapas, roteiros com IA e módulos práticos.
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
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizeOpen(true)}
            leftIcon={<SlidersHorizontal size={15} />}
            className="text-xs"
          >
            Personalizar
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<Plus size={20} />}
          >
            Novo Tema de Estudo
          </Button>
        </div>
      </div>

      {/* 🌟 1. [CHAVE DE OURO] 🎙️ TUTOR AI DE APRENDIZAGEM POR VOZ */}
      {learningPrefs.showTutorBriefing && (
        <Card
          variant="default"
          padding="lg"
          className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border-none shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-400/20 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  NEXO Study Tutor
                </span>
                <span className="text-xs text-slate-400">· Mentoria por IA</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Taxa Média de Retenção: {avgProgress}%
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tens <span className="text-amber-300 font-bold">{objectives.length} temas em estudo</span>. O teu foco está direcionado para o domínio gradual dos temas com técnicas de aprendizagem ativa.
              </p>
            </div>

            {/* Leitor de Áudio Tutor */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 space-y-3 min-w-[220px]">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 uppercase tracking-wider">
                {isPlayingTutor ? (
                  <>
                    <Volume2 size={16} className="text-emerald-400 animate-pulse" />
                    <span>A Explicar...</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={16} className="text-slate-400" />
                    <span>Tutor por Voz</span>
                  </>
                )}
              </div>

              <Button
                variant={isPlayingTutor ? 'secondary' : 'primary'}
                size="md"
                onClick={speakTutorBriefing}
                className="w-full text-xs font-bold"
                leftIcon={isPlayingTutor ? <Pause size={16} /> : <Play size={16} />}
              >
                {isPlayingTutor ? 'Pausar Explicador' : '▶ Ouvir Resumo do Tutor'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 📊 ESTATÍSTICAS DE APRENDIZAGEM & CRIADOR RÁPIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🏆 Estatísticas & Domínio */}
        {learningPrefs.showMetrics && (
          <Card variant="default" padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-sm">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Domínio & Progresso</span>
              </div>
              <Badge variant="primary" size="sm">Geral</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Temas Ativos</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{objectives.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Concluídos</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
              </div>
            </div>
          </Card>
        )}

        {/* ⚡ Criador Rápido de Tema */}
        {learningPrefs.showQuickAdd && (
          <Card variant="default" padding="md" className={`${learningPrefs.showMetrics ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-sm">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>Criador Rápido de Tema de Estudo</span>
              </div>
              <span className="text-xs text-slate-400">Texto ou Ditado</span>
            </div>

            <form onSubmit={(e) => handleQuickCreateTheme(e, false)} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Ex: Aprender Gestão de Projetos ou Programação em Python"
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
                  type="button"
                  onClick={() => handleQuickCreateTheme(undefined, true)}
                  variant="primary"
                  size="sm"
                  disabled={quickCreating || !quickTitle.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Criar tema e gerar automaticamente todas as etapas e aulas com IA"
                >
                  <Sparkles size={14} className={quickCreating ? 'animate-spin text-amber-200' : 'text-amber-300'} />
                  <span>{quickCreating ? 'A gerar...' : '✨ Gerar com IA'}</span>
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={quickCreating || !quickTitle.trim()}
                  leftIcon={<Plus size={16} />}
                  className="shrink-0 text-xs hidden sm:flex"
                >
                  Criar Manual
                </Button>
              </div>

              {/* Sugestões Rápidas de Cursos */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sugestões Rápidas:</span>
                {[
                  { label: '🇬🇧 Inglês do Zero ao Avançado', title: 'Inglês do Zero ao Avançado' },
                  { label: '💻 Python & IA', title: 'Programação em Python e Inteligência Artificial' },
                  { label: '📈 Gestão de Negócios', title: 'Gestão de Negócios & Finanças' },
                  { label: '🧠 Neurociência & Foco', title: 'Neurociência e Técnicas de Produtividade' },
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuickTitle(sug.title);
                      handleQuickCreateTheme(undefined, true, sug.title);
                    }}
                    disabled={quickCreating}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-semibold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer disabled:opacity-50"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* 📚 GRELHA DE TEMAS DE ESTUDO */}
      {learningPrefs.showObjectives && (
        objectives.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={28} />}
            title="Nenhum tema em estudo"
            description="Crie um novo objetivo de aprendizagem e divida a matéria em etapas e módulos práticos."
            actionLabel="+ Criar Tema de Estudo"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {objectives.map((o) => (
              <ObjectiveCard
                key={o.id}
                objective={o}
                onDelete={handleDelete}
                onOpenFlashcards={(title) => setFlashcardObjective(title)}
                onOpenLesson={handleOpenLesson}
              />
            ))}
          </div>
        )
      )}

      {/* MODAL DE PERSONALIZAÇÃO DE LAYOUT */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                <SlidersHorizontal size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Personalizar Visibilidade da Aprendizagem</span>
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
                { id: 'showTutorBriefing', label: '🎙️ Tutor por Voz & Previsão de Retenção' },
                { id: 'showMetrics', label: '📊 Domínio & Estatísticas de Aprendizagem' },
                { id: 'showQuickAdd', label: '⚡ Criador Rápido de Temas de Estudo' },
                { id: 'showObjectives', label: '📚 Grelha de Temas e Módulos' },
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
                    checked={(learningPrefs as any)[item.id]}
                    onChange={(e) => updateLearningPref(item.id as keyof LearningPreferences, e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
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

      {/* MODAL DE FLASHCARDS DE REPETIÇÃO ESPAÇADA */}
      {flashcardObjective && (
        <FlashcardsModal
          isOpen={Boolean(flashcardObjective)}
          onClose={() => setFlashcardObjective(null)}
          objectiveTitle={flashcardObjective}
        />
      )}

      {/* MODAL DE AULA INTERATIVA COM CONTEÚDO IA */}
      {selectedLesson && (
        <LessonModal
          isOpen={Boolean(selectedLesson)}
          onClose={() => setSelectedLesson(null)}
          lessonId={selectedLesson.lessonId}
          lessonTitle={selectedLesson.lessonTitle}
          courseTitle={selectedLesson.courseTitle}
          stageTitle={selectedLesson.stageTitle}
          isCompleted={selectedLesson.isCompleted}
          onToggleCompleted={async (id) => {
            try {
              await learningService.toggleItem(id, false);
              setSelectedLesson((prev) => prev ? { ...prev, isCompleted: true } : null);
              queryClient.invalidateQueries({ queryKey: ['learning_items'] });
              queryClient.invalidateQueries({ queryKey: ['learning_objectives'] });
            } catch {
              // ignore
            }
          }}
          onOpenTutorChat={(prompt) => {
            navigate('/app/students', { state: { initialPrompt: prompt } });
          }}
        />
      )}

      <LearningObjectiveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default LearningPage;
