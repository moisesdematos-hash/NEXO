import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Target, Trash2, Edit3, RotateCcw, Trophy, Volume2, Sparkles, 
  Settings, Calendar, CheckSquare, Flame, Award, X, ArrowLeft
} from 'lucide-react';
import { useGoals } from '../../hooks/useGoals';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { GoalFormModal, GOAL_CATEGORIES } from './components/GoalFormModal';
import { GoalRow } from '../../services/goalsService';

interface SubStep {
  id: string;
  text: string;
  completed: boolean;
}

export const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { goals, isLoading, isError, refetch, updateProgress, toggleComplete, deleteGoal } = useGoals();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<GoalRow | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Local storage based state for sub-steps per goal
  const [subStepsMap, setSubStepsMap] = useState<Record<string, SubStep[]>>({});

  // Settings
  const [voiceRate, setVoiceRate] = useState<number>(() => {
    return Number(localStorage.getItem('nexo_goals_voice_rate')) || 1;
  });
  const [autoSound, setAutoSound] = useState<boolean>(() => {
    return localStorage.getItem('nexo_goals_auto_sound') !== 'false';
  });

  // Load sub-steps from localStorage
  useEffect(() => {
    const loaded: Record<string, SubStep[]> = {};
    goals.forEach((g) => {
      const saved = localStorage.getItem(`nexo_goal_steps_${g.id}`);
      if (saved) {
        try {
          loaded[g.id] = JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    });
    setSubStepsMap(loaded);
  }, [goals]);

  // Gamification stats
  const completedGoalsCount = goals.filter((g) => g.is_completed).length;
  
  let totalSubstepsCompleted = 0;
  Object.values(subStepsMap).forEach(steps => {
    totalSubstepsCompleted += steps.filter(s => s.completed).length;
  });

  const totalXP = (completedGoalsCount * 100) + (totalSubstepsCompleted * 25) + goals.reduce((acc, g) => {
    const curr = g.current_value || 0;
    const tgt = g.target_value || 100;
    return acc + Math.round((curr / tgt) * 20);
  }, 0);

  const currentLevel = Math.floor(totalXP / 250) + 1;
  const xpInCurrentLevel = totalXP % 250;
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / 250) * 100));

  const getLevelTitle = (lvl: number) => {
    if (lvl === 1) return 'Aspirante Focado';
    if (lvl === 2) return 'Estrategista de Metas';
    if (lvl === 3) return 'Conquistador de Objetivos';
    if (lvl === 4) return 'Mestre da Execução';
    return 'Lenda do Nexo';
  };

  const handleToggleComplete = async (goal: GoalRow) => {
    try {
      await toggleComplete({ id: goal.id, currentlyCompleted: goal.is_completed });
      showToast(
        goal.is_completed ? 'Objectivo reaberto.' : 'Parabéns! Objectivo marcado como concluído! +100 XP',
        'success'
      );
    } catch {
      showToast('Erro ao alterar estado do objectivo.', 'error');
    }
  };

  const handleStepProgress = async (goal: GoalRow, delta: number) => {
    const nextVal = Math.max(0, (goal.current_value || 0) + delta);
    try {
      await updateProgress({
        id: goal.id,
        currentValue: nextVal,
        targetValue: goal.target_value || 100,
      });
      showToast(`Progresso actualizado: ${nextVal} ${goal.unit || '%'}`, 'info');
    } catch {
      showToast('Erro ao actualizar progresso.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este objectivo?')) return;
    try {
      await deleteGoal(id);
      showToast('Objectivo eliminado.', 'info');
    } catch {
      showToast('Erro ao eliminar objectivo.', 'error');
    }
  };

  // AI Sub-step generator
  const handleGenerateSubSteps = (goal: GoalRow) => {
    const titleLower = goal.title.toLowerCase();
    let generated: string[] = [];

    if (titleLower.includes('poupar') || titleLower.includes('dinheiro') || titleLower.includes('finan') || titleLower.includes('comprar')) {
      generated = [
        'Criar orçamento mensal estruturado',
        'Definir transferência automática para poupança',
        'Reduzir despesas supérfluas do mês',
        'Rever meta quinzenalmente'
      ];
    } else if (titleLower.includes('ler') || titleLower.includes('livro') || titleLower.includes('estud')) {
      generated = [
        'Escolher a lista de leitura / material de estudo',
        'Reservar 20 minutos diários sem distrações',
        'Anotar os principais conceitos aprendidos',
        'Partilhar resumos das principais conclusões'
      ];
    } else if (titleLower.includes('correr') || titleLower.includes('saude') || titleLower.includes('peso') || titleLower.includes('trein')) {
      generated = [
        'Fazer planeamento semanal de treinos',
        'Garantir hidratação diária adequada',
        'Monitorizar evolução de frequência e peso',
        'Manter consistência no descanso'
      ];
    } else {
      generated = [
        `Definir escopo inicial para: ${goal.title}`,
        'Criar plano de ação quinzenal com prazos',
        'Executar primeiro marco prático',
        'Avaliar resultados obtidos e ajustar rumo'
      ];
    }

    const steps: SubStep[] = generated.map((text, idx) => ({
      id: `${goal.id}-step-${idx}`,
      text,
      completed: false,
    }));

    const updated = { ...subStepsMap, [goal.id]: steps };
    setSubStepsMap(updated);
    localStorage.setItem(`nexo_goal_steps_${goal.id}`, JSON.stringify(steps));
    showToast('Sub-passos gerados com sucesso!', 'success');
  };

  const handleToggleSubStep = (goalId: string, stepId: string) => {
    const existing = subStepsMap[goalId] || [];
    const updated = existing.map((s) => s.id === stepId ? { ...s, completed: !s.completed } : s);
    setSubStepsMap({ ...subStepsMap, [goalId]: updated });
    localStorage.setItem(`nexo_goal_steps_${goalId}`, JSON.stringify(updated));
  };

  // Voice Briefing
  const handleVoiceBriefing = () => {
    if (!('speechSynthesis' in window)) {
      showToast('A síntese de voz não é suportada neste navegador.', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const activeCount = goals.filter((g) => !g.is_completed).length;
    const text = `Resumo dos seus Objetivos de Vida no Nexo. Possui ${completedGoalsCount} metas concluídas de um total de ${goals.length}. ${activeCount > 0 ? `Tem ${activeCount} metas ativas em progresso.` : 'Tudo concluído!'} O seu nível atual é ${currentLevel}, ${getLevelTitle(currentLevel)}. Continue com o foco em alta!`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = voiceRate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem('nexo_goals_voice_rate', voiceRate.toString());
    localStorage.setItem('nexo_goals_auto_sound', autoSound ? 'true' : 'false');
    setIsCustomizing(false);
    showToast('Preferências de objetivos guardadas!', 'success');
  };

  // Deadline badge helper
  const renderDeadlineBadge = (deadlineStr?: string | null) => {
    if (!deadlineStr) return null;
    const date = new Date(deadlineStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
          <Calendar size={12} /> Expirado ({date.toLocaleDateString('pt-PT')})
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 animate-pulse">
          <Calendar size={12} /> Hoje!
        </span>
      );
    } else if (diffDays <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
          <Calendar size={12} /> Faltam {diffDays} dias
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        <Calendar size={12} /> {date.toLocaleDateString('pt-PT')} ({diffDays} dias)
      </span>
    );
  };

  if (isLoading) return <LoadingState label="A carregar objectivos..." />;
  if (isError) return <ErrorState message="Não foi possível carregar os seus objectivos." onRetry={() => refetch()} />;

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    if (selectedCategory === 'all') return true;
    const cat = localStorage.getItem(`nexo_goal_cat_${g.id}`) || 'carreira';
    return cat === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header & Gamification Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30">
                Nível {currentLevel} • {getLevelTitle(currentLevel)}
              </Badge>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Flame size={14} className="fill-amber-400" /> {totalXP} XP
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Objectivos de Vida & Metas
            </h1>

            <p className="text-sm text-indigo-200/80">
              {completedGoalsCount} de {goals.length} metas concretizadas • {totalSubstepsCompleted} sub-passos concluídos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              size="md"
              leftIcon={<ArrowLeft size={18} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold"
            >
              Voltar
            </Button>

            <Button
              onClick={handleVoiceBriefing}
              variant="secondary"
              size="md"
              leftIcon={<Volume2 size={18} className={isSpeaking ? 'animate-bounce text-amber-400' : ''} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {isSpeaking ? 'A falar...' : 'Briefing de Voz'}
            </Button>

            <Button
              onClick={() => setIsCustomizing(true)}
              variant="secondary"
              size="md"
              leftIcon={<Settings size={18} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Preferências
            </Button>

            <Button
              onClick={() => {
                setGoalToEdit(null);
                setIsModalOpen(true);
              }}
              variant="primary"
              size="md"
              leftIcon={<Plus size={20} />}
              className="bg-indigo-500 hover:bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/30"
            >
              Novo Objectivo
            </Button>
          </div>
        </div>

        {/* Level XP Progress */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
            <span>Progresso para Nível {currentLevel + 1}</span>
            <span>{xpInCurrentLevel} / 250 XP ({levelProgress}%)</span>
          </div>
          <div className="w-full bg-slate-950/60 rounded-full h-2.5 p-0.5">
            <div 
              className="bg-gradient-to-r from-indigo-400 to-amber-400 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          🌟 Todas ({goals.length})
        </button>

        {GOAL_CATEGORIES.map((cat) => {
          const count = goals.filter((g) => (localStorage.getItem(`nexo_goal_cat_${g.id}`) || 'carreira') === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Target size={28} />}
          title={selectedCategory === 'all' ? "Nenhum objectivo definido" : "Nenhum objectivo nesta categoria"}
          description="Defina metas claras de vida e acompanhe o seu progresso passo a passo."
          actionLabel="+ Definir Objectivo"
          onAction={() => {
            setGoalToEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((g) => {
            const current = g.current_value || 0;
            const target = g.target_value || 100;
            const percent = Math.min(100, Math.round((current / target) * 100));
            const catId = localStorage.getItem(`nexo_goal_cat_${g.id}`) || 'carreira';
            const catObj = GOAL_CATEGORIES.find((c) => c.id === catId) || GOAL_CATEGORIES[0];
            const steps = subStepsMap[g.id] || [];

            return (
              <Card
                key={g.id}
                variant="default"
                padding="md"
                className={`space-y-4 transition-all relative overflow-hidden ${
                  g.is_completed 
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
                    : 'hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {/* Top Badge & Actions */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        {catObj.icon} {catObj.label}
                      </span>
                      {g.is_completed && <Badge variant="success">Concluído</Badge>}
                      {renderDeadlineBadge(g.deadline)}
                    </div>

                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white pt-1">
                      {g.title}
                    </h3>
                    
                    {g.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {g.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setGoalToEdit(g);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar Objectivo"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Eliminar Objectivo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">
                      {current} / {target} {g.unit || '%'}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{percent}%</span>
                  </div>

                  <Progress value={percent} color={g.is_completed ? 'success' : 'primary'} />
                </div>

                {/* AI Sub-steps section */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-indigo-500" />
                      Sub-passos ({steps.filter((s) => s.completed).length}/{steps.length})
                    </span>

                    {steps.length === 0 ? (
                      <button
                        onClick={() => handleGenerateSubSteps(g)}
                        className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl"
                      >
                        <Sparkles size={12} /> Desdobrar IA
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateSubSteps(g)}
                        className="text-[10px] text-slate-400 hover:text-indigo-500 underline"
                      >
                        Regerar
                      </button>
                    )}
                  </div>

                  {steps.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {steps.map((step) => (
                        <label
                          key={step.id}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:opacity-80"
                        >
                          <input
                            type="checkbox"
                            checked={step.completed}
                            onChange={() => handleToggleSubStep(g.id, step.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                          <span className={step.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                            {step.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Increments & State buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleStepProgress(g, -1)}
                      variant="outline"
                      size="sm"
                      disabled={current <= 0}
                    >
                      -1
                    </Button>
                    <Button onClick={() => handleStepProgress(g, +1)} variant="outline" size="sm">
                      +1
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleToggleComplete(g)}
                    variant={g.is_completed ? 'secondary' : 'primary'}
                    size="sm"
                    leftIcon={g.is_completed ? <RotateCcw size={16} /> : <Trophy size={16} />}
                  >
                    {g.is_completed ? 'Reabrir Meta' : 'Concluir Meta'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      <GoalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      {/* Customization Modal */}
      {isCustomizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Preferências dos Objetivos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ajuste os parâmetros de voz, alertas e sistema de experiência.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomizing(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Voice Speed */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Velocidade da Síntese de Voz ({voiceRate}x)
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.25"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Lento (0.75x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Rápido (1.5x)</span>
                </div>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    Sons de Conclusão e Celebração
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tocar feedbacks visuais e congratulações ao concluir metas
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSound}
                  onChange={(e) => setAutoSound(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>

              {/* Gamification Summary */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 space-y-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Award size={16} className="text-indigo-600 dark:text-indigo-400" />
                  Estatísticas de Conquista
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800/50">
                    <span className="block text-slate-500 dark:text-slate-400">Total XP</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">{totalXP} XP</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800/50">
                    <span className="block text-slate-500 dark:text-slate-400">Nível Atual</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">Nível {currentLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Sticky Sair button */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCustomizing(false)}
                className="font-bold"
              >
                Sair
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Guardar Preferências
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default GoalsPage;
