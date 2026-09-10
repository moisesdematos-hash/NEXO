import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { CheckSquare, Calendar, ListChecks, Target, Sparkles } from 'lucide-react';

export type ActionType = 'task' | 'event' | 'list' | 'goal' | null;

interface QuickActionModalProps {
  actionType: ActionType;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ actionType, onClose }) => {
  if (!actionType) return null;

  const titles = {
    task: 'Nova Tarefa',
    event: 'Novo Evento na Agenda',
    list: 'Nova Lista ou Checklist',
    goal: 'Novo Objectivo',
  };

  const icons = {
    task: <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    event: <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    list: <ListChecks className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    goal: <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
  };

  const descriptions = {
    task: 'O módulo de tarefas completas (prioridades, categorias e datas de limite) será activado na Fase 4.',
    event: 'O módulo de agenda e calendário (vista diária/mensal) será activado na Fase 4.',
    list: 'O módulo de listas de compras e checklists personalizadas será activado na Fase 4.',
    goal: 'O módulo de objectivos de vida e barra de progresso será activado na Fase 5.',
  };

  return (
    <Modal
      isOpen={Boolean(actionType)}
      onClose={onClose}
      title={titles[actionType]}
      size="md"
      footer={
        <Button onClick={onClose} variant="primary">
          Entendido
        </Button>
      }
    >
      <div className="space-y-4 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 mx-auto flex items-center justify-center">
          {icons[actionType]}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {descriptions[actionType]}
          </p>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <span>Ponto de Integração Preparado (Fase 3 OK)</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
