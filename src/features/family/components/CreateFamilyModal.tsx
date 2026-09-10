import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useFamily } from '../../../hooks/useFamily';
import { useToast } from '../../../components/ui/Toast';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({ isOpen, onClose }) => {
  const { createFamily, isCreating } = useFamily();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor introduza o nome do grupo familiar.');
      return;
    }

    try {
      await createFamily(name.trim());
      showToast('Grupo Familiar criado com sucesso! Foi definido como Proprietário (Owner).', 'success');
      setName('');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar grupo familiar.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Grupo Familiar" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <Input
          label="Nome da Família / Grupo *"
          placeholder="Ex: Família Silva, Casa Porto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ao criar o grupo, ser-lhe-á gerado um código único de convite para partilhar com os membros da sua família.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreating}>
            Criar Grupo
          </Button>
        </div>
      </form>
    </Modal>
  );
};
