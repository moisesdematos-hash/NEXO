import React, { useState } from 'react';
import { Clock, Check, Sparkles } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DayPlanSlot } from '../../../hooks/useTodayContext';

interface OrganizeDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DayPlanSlot[];
  onApplyPlan?: () => void;
  title?: string;
  description?: string;
}

export const OrganizeDayModal: React.FC<OrganizeDayModalProps> = ({
  isOpen,
  onClose,
  plan,
  onApplyPlan,
  title = 'Organizar o meu dia',
  description = 'Proposta inteligente do NEXO baseada no teu contexto actual. Confirma o plano antes de aplicar.',
}) => {
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const [applied, setApplied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const initialSelected: Record<number, boolean> = {};
      plan.forEach((_, idx) => {
        initialSelected[idx] = true;
      });
      setSelectedItems(initialSelected);
      setApplied(false);
    }
  }, [isOpen, plan]);

  const toggleSelect = (idx: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleApply = () => {
    setApplied(true);
    if (onApplyPlan) {
      onApplyPlan();
    }
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const totalSelected = Object.values(selectedItems).filter(Boolean).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="lg"
      footer={
        applied ? (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Check size={18} />
            <span>Plano aplicado com sucesso!</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {totalSelected} de {plan.length} blocos seleccionados
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                disabled={totalSelected === 0}
                leftIcon={<Sparkles size={16} />}
              >
                Aplicar Plano
              </Button>
            </div>
          </div>
        )
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Proposta de Horário Personalizada</span>
            Os blocos de tempo foram distribuídos prioritariamente sem alterar compromissos existentes da tua agenda. Nada é guardado até clicares em &quot;Aplicar Plano&quot;.
          </div>
        </div>

        {plan.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            Não existem tarefas nem compromissos para organizar neste dia.
          </div>
        ) : (
          <div className="space-y-2.5">
            {plan.map((slot, idx) => {
              const isChecked = selectedItems[idx] ?? true;
              return (
                <div
                  key={idx}
                  onClick={() => toggleSelect(idx)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(idx)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {slot.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <Clock size={12} className="text-indigo-500 shrink-0" />
                        <span>{slot.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={slot.type === 'event' ? 'primary' : 'default'} size="sm">
                    {slot.type === 'event' ? 'Agenda' : 'Tarefa'}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
