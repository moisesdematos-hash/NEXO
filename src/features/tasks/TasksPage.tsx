import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Trash2, Edit3, ArrowUpDown, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { TaskFormModal } from './components/TaskFormModal';
import { TaskRow } from '../../services/tasksService';
import { TaskPriority } from '../../types/database.types';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
type TaskSort = 'dueDate' | 'priority' | 'status';

export const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, isLoading, isError, refetch, toggleTask, deleteTask } = useTasks();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [sortBy, setSortBy] = useState<TaskSort>('dueDate');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskRow | null>(null);

  const now = new Date();

  // Filtragem
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'completed') return t.status === 'completed';
    if (t.status === 'completed' && activeFilter !== 'all') return false;

    if (!t.due_date) {
      if (activeFilter === 'today' || activeFilter === 'overdue') return false;
      return true;
    }

    const dueDate = new Date(t.due_date);
    const isToday = dueDate.toDateString() === now.toDateString();
    const isOverdue = dueDate < now && !isToday;

    if (activeFilter === 'today') return isToday;
    if (activeFilter === 'overdue') return isOverdue;
    if (activeFilter === 'upcoming') return dueDate > now && !isToday;

    return true;
  });

  // Ordenação
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    // Default: Data limite
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const handleToggle = async (t: TaskRow) => {
    try {
      await toggleTask({ id: t.id, currentStatus: t.status });
      showToast(
        t.status === 'completed' ? 'Tarefa marcada como pendente.' : 'Tarefa concluída com sucesso!',
        'success'
      );
    } catch {
      showToast('Erro ao actualizar estado da tarefa.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta tarefa?')) return;
    try {
      await deleteTask(id);
      showToast('Tarefa eliminada.', 'info');
    } catch {
      showToast('Erro ao eliminar tarefa.', 'error');
    }
  };

  if (isLoading) return <LoadingState label="A carregar tarefas..." />;
  if (isError) return <ErrorState message="Não foi possível carregar as suas tarefas." onRetry={() => refetch()} />;

  const priorityBadges: Record<TaskPriority, { variant: 'default' | 'primary' | 'warning' | 'danger'; label: string }> = {
    low: { variant: 'default', label: 'Baixa' },
    medium: { variant: 'primary', label: 'Média' },
    high: { variant: 'warning', label: 'Alta' },
    urgent: { variant: 'danger', label: 'Urgente' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header com Acção Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            As Minhas Tarefas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tasks.filter((t) => t.status === 'completed').length} de {tasks.length} concluídas
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
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            variant="primary"
            size="md"
            leftIcon={<Plus size={20} />}
          >
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Tabs de Filtro */}
      <Tabs
        tabs={[
          { id: 'all', label: 'Todas', badge: tasks.length },
          { id: 'today', label: 'Hoje' },
          { id: 'upcoming', label: 'Próximas' },
          { id: 'overdue', label: 'Atrasadas' },
          { id: 'completed', label: 'Concluídas' },
        ]}
        activeTab={activeFilter}
        onChange={(id) => setActiveFilter(id as TaskFilter)}
      />

      {/* Selector de Ordenação */}
      <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <ArrowUpDown size={14} />
        <span>Ordenar por:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as TaskSort)}
          className="bg-transparent border-none font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
        >
          <option value="dueDate">Data Limite</option>
          <option value="priority">Prioridade</option>
          <option value="status">Estado</option>
        </select>
      </div>

      {/* Lista de Tarefas ou EmptyState */}
      {sortedTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={28} />}
          title="Nenhuma tarefa encontrada"
          description={
            activeFilter === 'all'
              ? 'Ainda não adicionou nenhuma tarefa. Comece por criar a sua primeira tarefa!'
              : 'Não existem tarefas correspondentes ao filtro seleccionado.'
          }
          actionLabel="+ Criar Tarefa"
          onAction={() => {
            setTaskToEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((t) => {
            const isCompleted = t.status === 'completed';
            const badgeInfo = priorityBadges[t.priority] || priorityBadges.medium;

            return (
              <Card
                key={t.id}
                variant="default"
                padding="md"
                className={`flex items-start justify-between gap-4 transition-all ${
                  isCompleted ? 'opacity-60 bg-slate-50/60 dark:bg-slate-900/60' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggle(t)}
                    className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                    aria-label={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                  >
                    {isCompleted && <CheckSquare size={16} />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-bold text-base text-slate-900 dark:text-white ${
                          isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {t.title}
                      </span>
                      <Badge variant={badgeInfo.variant} size="sm">
                        {badgeInfo.label}
                      </Badge>
                    </div>

                    {t.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {t.description}
                      </p>
                    )}

                    {t.due_date && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 pt-1">
                        <CalendarIcon size={12} />
                        <span>
                          {new Intl.DateTimeFormat('pt-PT', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(t.due_date))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setTaskToEdit(t);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Editar Tarefa"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Eliminar Tarefa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Formulação de Tarefa */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
      />

    </div>
  );
};

export default TasksPage;
