import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useEvents } from '../../../hooks/useEvents';
import { useToast } from '../../../components/ui/Toast';
import { EventRow } from '../../../services/eventsService';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventRow | null;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, eventToEdit }) => {
  const { createEvent, updateEvent, isCreating } = useEvents();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setLocation(eventToEdit.location || '');
      setStartTime(eventToEdit.start_time ? eventToEdit.start_time.substring(0, 16) : '');
      setEndTime(eventToEdit.end_time ? eventToEdit.end_time.substring(0, 16) : '');
      setIsAllDay(eventToEdit.is_all_day || false);
    } else {
      const defaultStart = new Date();
      const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);
      setTitle('');
      setDescription('');
      setLocation('');
      setStartTime(defaultStart.toISOString().substring(0, 16));
      setEndTime(defaultEnd.toISOString().substring(0, 16));
      setIsAllDay(false);
    }
    setErrorMsg(null);
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor introduza o título do evento.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg('Por favor defina a hora de início e fim.');
      return;
    }

    try {
      if (eventToEdit) {
        await updateEvent({
          id: eventToEdit.id,
          updates: {
            title: title.trim(),
            description: description.trim() || null,
            location: location.trim() || null,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            is_all_day: isAllDay,
          },
        });
        showToast('Evento actualizado com sucesso!', 'success');
      } else {
        await createEvent({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          is_all_day: isAllDay,
        });
        showToast('Evento criado na agenda!', 'success');
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao guardar evento.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Editar Evento' : 'Novo Evento na Agenda'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <Input
          label="Título do Evento *"
          placeholder="Ex: Consulta médica, Reunião de família"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Local (Opcional)"
          placeholder="Ex: Porto, Zoom ou Casa"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Checkbox
          label="Evento de Dia Inteiro"
          checked={isAllDay}
          onChange={(e) => setIsAllDay(e.target.checked)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Início *"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <Input
            label="Fim *"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Notas Adicionais"
          placeholder="Detalhes ou notas do evento..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreating}>
            {eventToEdit ? 'Guardar Alterações' : 'Adicionar à Agenda'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
