import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { useLearning } from '../../../hooks/useLearning';
import { useToast } from '../../../components/ui/Toast';

interface LearningObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningObjectiveModal: React.FC<LearningObjectiveModalProps> = ({ isOpen, onClose }) => {
  const { createObjective, isCreating } = useLearning();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor introduza o título do objectivo de aprendizagem.');
      return;
    }

    try {
      await createObjective({
        title: title.trim(),
        description: description.trim() || null,
      });
      showToast('Objectivo de Aprendizagem criado!', 'success');
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar objectivo.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Objectivo de Aprendizagem" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <Input
          label="Título do Tema / Matéria *"
          placeholder="Ex: Aprender Gestão Financeira Pessoal, Programação TypeScript"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Descrição ou Notas Rápidas"
          placeholder="O que pretende dominar ou alcançar nesta matéria?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreating}>
            Criar Objectivo
          </Button>
        </div>
      </form>
    </Modal>
  );
};
