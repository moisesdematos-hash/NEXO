import React, { useState } from 'react';
import { 
  BookOpen, Plus, Trash2, Award, Calendar, Sparkles
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export interface Subject {
  id: string;
  name: string;
  code: string;
  professor: string;
  grade?: number;
  weight: number;
  status: 'em_curso' | 'concluida' | 'pendente';
  examDate?: string;
}

export const SubjectsManager: React.FC = () => {
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 'sub-1',
      name: 'Cálculo II',
      code: 'MAT201',
      professor: 'Prof. Dr. António Ramos',
      grade: 16.5,
      weight: 6,
      status: 'em_curso',
      examDate: '2026-06-22',
    },
    {
      id: 'sub-2',
      name: 'Álgebra Linear & Geometria',
      code: 'MAT102',
      professor: 'Dra. Sofia Martins',
      grade: 17.0,
      weight: 6,
      status: 'em_curso',
      examDate: '2026-06-25',
    },
    {
      id: 'sub-3',
      name: 'Física Geral II',
      code: 'FIS201',
      professor: 'Prof. Manuel Costa',
      grade: 14.0,
      weight: 5,
      status: 'em_curso',
      examDate: '2026-06-29',
    },
    {
      id: 'sub-4',
      name: 'Programação de Sistemas (C/C++)',
      code: 'INF202',
      professor: 'Dr. Afonso Henriques',
      grade: 18.5,
      weight: 6,
      status: 'em_curso',
      examDate: '2026-07-02',
    },
  ]);

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newProf, setNewProf] = useState('');
  const [newGrade, setNewGrade] = useState<string>('');
  const [newWeight, setNewWeight] = useState<number>(6);
  const [newExamDate, setNewExamDate] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Weighted average calculation
  const validSubjects = subjects.filter((s) => s.grade !== undefined);
  const totalWeightedGrades = validSubjects.reduce((acc, s) => acc + (s.grade! * s.weight), 0);
  const totalWeights = validSubjects.reduce((acc, s) => acc + s.weight, 0);
  const weightedAverage = totalWeights > 0 ? (totalWeightedGrades / totalWeights).toFixed(2) : 'N/A';

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: newName,
      code: newCode || 'GERAL',
      professor: newProf || 'Docente',
      grade: newGrade ? parseFloat(newGrade) : undefined,
      weight: newWeight,
      status: 'em_curso',
      examDate: newExamDate || undefined,
    };

    setSubjects([...subjects, newSub]);
    setNewName('');
    setNewCode('');
    setNewProf('');
    setNewGrade('');
    setIsAddOpen(false);
    showToast(`Disciplina "${newName}" adicionada com sucesso!`, 'success');
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    showToast('Disciplina removida.', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Weighted Average KPI */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 shadow-inner">
            <BookOpen size={32} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Disciplinas &amp; Média Académica Ponderada</h3>
            <p className="text-xs text-indigo-200 mt-1">
              Acompanhamento de notas, ECTS/créditos e agendamento de exames.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="text-right">
            <span className="block text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
              Média Ponderada Atual
            </span>
            <div className="text-3xl font-black text-amber-400">
              {weightedAverage} <span className="text-xs font-normal text-slate-400">/ 20</span>
            </div>
          </div>
          <Award size={28} className="text-amber-400" />
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" /> Cadeiras do Semestre Ativo ({subjects.length})
        </h4>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Adicionar Cadeira</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    {s.code} • {s.weight} ECTS
                  </span>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    {s.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.professor}</p>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nota Prevista</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {s.grade !== undefined ? s.grade : '—'}
                  </div>
                </div>
              </div>

              {s.examDate && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar size={14} className="text-indigo-500" /> Data do Exame:
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100 font-mono">{s.examDate}</strong>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleDeleteSubject(s.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Remover Cadeira"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Subject */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Adicionar Nova Cadeira / Disciplina</h3>
            <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nome da Disciplina</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Análise Matemática"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Código (Sigla)</label>
                  <input
                    type="text"
                    placeholder="MAT101"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Créditos ECTS</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Nota (0 a 20)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="16.5"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Data do Exame</label>
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-3 py-1.5 text-slate-500">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl">
                  Guardar Cadeira
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
