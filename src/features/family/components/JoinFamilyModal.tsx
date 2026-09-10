import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useFamily } from '../../../hooks/useFamily';
import { useToast } from '../../../components/ui/Toast';

interface JoinFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinFamilyModal: React.FC<JoinFamilyModalProps> = ({ isOpen, onClose }) => {
  const { joinFamily, isJoining } = useFamily();
  const { showToast } = useToast();

  const [inviteCode, setInviteCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setErrorMsg('Por favor introduza o código de convite.');
      return;
    }

    try {
      await joinFamily(inviteCode.trim());
      showToast('Juntou-se ao grupo familiar com sucesso como Membro!', 'success');
      setInviteCode('');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Código de convite inválido ou expirado.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Juntar-se a um Grupo Familiar" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <Input
          label="Código de Convite *"
          placeholder="Ex: a1b2c3d4"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
        />

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Introduza o código de convite fornecido pelo Proprietário (Owner) da família. Ser-lhe-á atribuído o papel de <strong>Membro (Member)</strong>.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isJoining}>
            Entrar no Grupo
          </Button>
        </div>
      </form>
    </Modal>
  );
};
