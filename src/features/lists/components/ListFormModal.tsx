import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useLists } from '../../../hooks/useLists';
import { useToast } from '../../../components/ui/Toast';
import { Tag } from 'lucide-react';

export const LIST_CATEGORIES = [
  { id: 'Compras', label: 'Compras', icon: '🛒' },
  { id: 'Material Escolar', label: 'Material Escolar', icon: '📚' },
  { id: 'Viagem', label: 'Viagem', icon: '🧳' },
  { id: 'Tarefas Rápidas', label: 'Tarefas Rápidas', icon: '⚡' },
  { id: 'Outro', label: 'Outro', icon: '📌' },
];

interface ListFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ListFormModal: React.FC<ListFormModalProps> = ({ isOpen, onClose }) => {
  const { createList, isCreating } = useLists();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Compras');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor introduza o nome da lista.');
      return;
    }

    try {
      await createList({
        title: title.trim(),
        category,
      });
      showToast('Lista criada com sucesso!', 'success');
      setTitle('');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar lista.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Lista & Checklist" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <Input
          label="Nome da Lista *"
          placeholder="Ex: Compras de Supermercado, Viagem de Férias, Preparação de Exame"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Tag size={14} className="text-indigo-500" /> Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {LIST_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreating}>
            Criar Lista
          </Button>
        </div>
      </form>
    </Modal>
  );
};

