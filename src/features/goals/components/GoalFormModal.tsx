import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { useGoals } from '../../../hooks/useGoals';
import { useToast } from '../../../components/ui/Toast';
import { GoalRow } from '../../../services/goalsService';
import { Tag } from 'lucide-react';

export const GOAL_CATEGORIES = [
  { id: 'carreira', label: 'Carreira & Finanças', icon: '💼' },
  { id: 'saude', label: 'Saúde & Bem-estar', icon: '❤️' },
  { id: 'estudos', label: 'Estudos & Aprendizagem', icon: '📚' },
  { id: 'casa', label: 'Casa & Família', icon: '🏡' },
  { id: 'viagens', label: 'Viagens & Projetos', icon: '✈️' },
];

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: GoalRow | null;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { createGoal, updateGoal, isCreating } = useGoals();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('carreira');
  const [targetValue, setTargetValue] = useState<number>(100);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('%');
  const [deadline, setDeadline] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setTargetValue(goalToEdit.target_value || 100);
      setCurrentValue(goalToEdit.current_value || 0);
      setUnit(goalToEdit.unit || '%');
      setDeadline(goalToEdit.deadline ? goalToEdit.deadline.substring(0, 10) : '');
      const savedCat = localStorage.getItem(`nexo_goal_cat_${goalToEdit.id}`) || 'carreira';
      setCategory(savedCat);
    } else {
      setTitle('');
      setDescription('');
      setCategory('carreira');
      setTargetValue(100);
      setCurrentValue(0);
      setUnit('%');
      setDeadline('');
    }
    setErrorMsg(null);
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor introduza o título do objectivo.');
      return;
    }
    if (targetValue <= 0) {
      setErrorMsg('O valor meta deve ser superior a 0.');
      return;
    }

    try {
      let savedGoalId = goalToEdit?.id;
      if (goalToEdit) {
        await updateGoal({
          id: goalToEdit.id,
          updates: {
            title: title.trim(),
            description: description.trim() || null,
            target_value: Number(targetValue),
            current_value: Number(currentValue),
            unit: unit.trim() || '%',
            deadline: deadline ? new Date(deadline).toISOString() : null,
          },
        });
        showToast('Objectivo actualizado com sucesso!', 'success');
      } else {
        const created = await createGoal({
          title: title.trim(),
          description: description.trim() || null,
          target_value: Number(targetValue),
          current_value: Number(currentValue),
          unit: unit.trim() || '%',
          deadline: deadline ? new Date(deadline).toISOString() : null,
        });
        savedGoalId = created.id;
        showToast('Objectivo criado com sucesso!', 'success');
      }

      if (savedGoalId) {
        localStorage.setItem(`nexo_goal_cat_${savedGoalId}`, category);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao guardar objectivo.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Editar Objectivo' : 'Novo Objectivo de Vida'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <Input
          label="Título do Objectivo *"
          placeholder="Ex: Poupar 1000€, Ler 12 Livros, Correr Maratona"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Tag size={14} className="text-indigo-500" /> Categorias de Vida
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {GOAL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <Textarea
          label="Descrição ou Razão (Opcional)"
          placeholder="Por que razão este objectivo é importante para si?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Valor Meta *"
            type="number"
            min={1}
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
            required
          />

          <Input
            label="Progresso Actual"
            type="number"
            min={0}
            value={currentValue}
            onChange={(e) => setCurrentValue(Number(e.target.value))}
          />

          <Input
            label="Unidade (Ex: €, km, livros)"
            placeholder="%"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>

        <Input
          label="Data Limite (Opcional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreating}>
            {goalToEdit ? 'Guardar Alterações' : 'Criar Objectivo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

