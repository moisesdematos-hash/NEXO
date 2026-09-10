import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { useTasks } from '../../../hooks/useTasks';
import { useToast } from '../../../components/ui/Toast';
import { TaskRow } from '../../../services/tasksService';
import { TaskPriority } from '../../../types/database.types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskRow | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { createTask, updateTask, isCreating } = useTasks();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.substring(0, 16) : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
    setErrorMsg(null);
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor introduza o título da tarefa.');
      return;
    }

    try {
      if (taskToEdit) {
        await updateTask({
          id: taskToEdit.id,
          updates: {
            title: title.trim(),
            description: description.trim() || null,
            priority,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
          },
        });
        showToast('Tarefa actualizada com sucesso!', 'success');
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status: 'pending',
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
        });
        showToast('Tarefa criada com sucesso!', 'success');
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao guardar tarefa.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <Input
          label="Título da Tarefa *"
          placeholder="Ex: Comprar leite ou pagar conta de luz"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Descrição (Opcional)"
          placeholder="Detalhes adicionais..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Prioridade"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
              { value: 'urgent', label: 'Urgente' },
            ]}
          />

          <Input
            label="Data / Hora Limite"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreating}>
            {taskToEdit ? 'Guardar Alterações' : 'Criar Tarefa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
