import React, { useState, useEffect } from 'react';
import { Calendar, Download, MapPin, Plus, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { downloadAllEventsICS } from '../../../utils/calendarExport';

export interface ClassItem {
  id: string;
  day: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado';
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  color: string;
}

const DEFAULT_SCHEDULE: ClassItem[] = [
  { id: '1', day: 'Segunda', startTime: '09:00', endTime: '11:00', subject: 'Cálculo II (Teórica)', room: 'Anfiteatro A1', color: 'bg-blue-600' },
  { id: '2', day: 'Segunda', startTime: '14:00', endTime: '16:00', subject: 'Física Geral II (Prática)', room: 'Lab 2.1', color: 'bg-emerald-600' },
  { id: '3', day: 'Terça', startTime: '10:00', endTime: '12:00', subject: 'Álgebra Linear (Teórica)', room: 'Anfiteatro B2', color: 'bg-purple-600' },
  { id: '4', day: 'Quarta', startTime: '09:00', endTime: '11:00', subject: 'Cálculo II (Prática)', room: 'Sala 1.4', color: 'bg-blue-600' },
  { id: '5', day: 'Quarta', startTime: '15:00', endTime: '18:00', subject: 'Programação C/C++', room: 'Lab Computadores 3', color: 'bg-amber-600' },
  { id: '6', day: 'Quinta', startTime: '11:00', endTime: '13:00', subject: 'Álgebra Linear (Prática)', room: 'Sala 2.2', color: 'bg-purple-600' },
  { id: '7', day: 'Sexta', startTime: '10:00', endTime: '12:00', subject: 'Física Geral II (Teórica)', room: 'Anfiteatro A1', color: 'bg-emerald-600' },
];

const COLOR_OPTIONS = [
  { label: 'Azul', value: 'bg-blue-600' },
  { label: 'Verde', value: 'bg-emerald-600' },
  { label: 'Roxo', value: 'bg-purple-600' },
  { label: 'Laranja', value: 'bg-amber-600' },
  { label: 'Vermelho', value: 'bg-rose-600' },
  { label: 'Índigo', value: 'bg-indigo-600' },
];

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;

export const ClassScheduleGrid: React.FC = () => {
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('nexo_student_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SCHEDULE;
      }
    }
    return DEFAULT_SCHEDULE;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassItem | null>(null);

  // Form State
  const [day, setDay] = useState<ClassItem['day']>('Segunda');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [color, setColor] = useState('bg-blue-600');

  useEffect(() => {
    localStorage.setItem('nexo_student_schedule', JSON.stringify(schedule));
  }, [schedule]);

  const handleOpenAddModal = (selectedDay?: ClassItem['day']) => {
    setEditingItem(null);
    setDay(selectedDay || 'Segunda');
    setStartTime('09:00');
    setEndTime('11:00');
    setSubject('');
    setRoom('');
    setColor('bg-blue-600');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ClassItem) => {
    setEditingItem(item);
    setDay(item.day);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setSubject(item.subject);
    setRoom(item.room);
    setColor(item.color);
    setIsModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast('Por favor introduza o nome da disciplina.', 'error');
      return;
    }

    if (editingItem) {
      setSchedule((prev) =>
        prev.map((s) =>
          s.id === editingItem.id
            ? { ...s, day, startTime, endTime, subject: subject.trim(), room: room.trim() || 'Sala por definir', color }
            : s
        )
      );
      showToast('✅ Aula atualizada com sucesso!', 'success');
    } else {
      const newItem: ClassItem = {
        id: `class-${Date.now()}`,
        day,
        startTime,
        endTime,
        subject: subject.trim(),
        room: room.trim() || 'Sala por definir',
        color,
      };
      setSchedule((prev) => [...prev, newItem]);
      showToast('🎉 Nova aula adicionada ao horário!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja remover a aula de "${name}"?`)) {
      setSchedule((prev) => prev.filter((s) => s.id !== id));
      showToast('🗑️ Aula removida do horário.', 'info');
    }
  };

  const handleExportScheduleICS = () => {
    const events = schedule.map((s) => ({
      id: s.id,
      user_id: 'student-user',
      family_id: null,
      is_private: true,
      title: `Aula: ${s.subject}`,
      description: `Aula na sala ${s.room}. Exportado do NEXO Estudantes.`,
      start_time: `2026-09-15T${s.startTime}:00Z`,
      end_time: `2026-09-15T${s.endTime}:00Z`,
      location: s.room,
      is_all_day: false,
      created_at: new Date().toISOString(),
    }));

    downloadAllEventsICS(events, 'nexo_horario_escolar.ics');
    showToast('📅 Horário de aulas descarregado em ficheiro .ics!', 'success');
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            <span>Horário Semanal de Aulas &amp; Salas</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adicione, edite e gira as tuas aulas semanais com salas e exportação sincronizada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Adicionar Aula</span>
          </button>

          <button
            onClick={handleExportScheduleICS}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={16} />
            <span>Exportar (.ics)</span>
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {DAYS.map((d) => {
          const dayClasses = schedule
            .filter((s) => s.day === d)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={d} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between px-3">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  {d}
                </span>
                <button
                  onClick={() => handleOpenAddModal(d)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title={`Adicionar aula a ${d}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-2.5">
                {dayClasses.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative p-3.5 rounded-2xl text-white shadow-md space-y-1.5 transition-transform hover:-translate-y-0.5 ${item.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded inline-block">
                        {item.startTime} - {item.endTime}
                      </span>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs px-1.5 py-0.5 rounded-lg">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 hover:text-amber-300 transition-colors"
                          title="Editar aula"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(item.id, item.subject)}
                          className="p-1 hover:text-rose-300 transition-colors"
                          title="Remover aula"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h5 className="font-extrabold text-xs leading-tight">{item.subject}</h5>
                    <div className="flex items-center gap-1 text-[11px] opacity-90">
                      <MapPin size={12} />
                      <span>{item.room}</span>
                    </div>
                  </div>
                ))}

                {dayClasses.length === 0 && (
                  <button
                    onClick={() => handleOpenAddModal(d)}
                    className="w-full p-4 text-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs italic bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <Plus size={16} />
                    <span>Adicionar aula</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                <span>{editingItem ? 'Editar Aula do Horário' : 'Adicionar Nova Aula'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dia da Semana
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value as ClassItem['day'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hora de Início
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hora de Fim
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Disciplina / Tipo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Engenharia de Software (Teórica)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sala de Aula / Bloco
                </label>
                <input
                  type="text"
                  placeholder="Ex: Anfiteatro A1, Lab Computadores 2"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cor do Cartão
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-7 h-7 rounded-full transition-transform ${c.value} ${
                        color === c.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>{editingItem ? 'Guardar Alterações' : 'Criar Aula'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClassScheduleGrid;
