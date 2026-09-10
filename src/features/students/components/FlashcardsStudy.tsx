import React, { useState } from 'react';
import { Brain, Check, X, Plus } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
}

export const FlashcardsStudy: React.FC = () => {
  const { showToast } = useToast();

  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: 'fc-1',
      subject: 'Cálculo II',
      front: 'O que é o Teorema Fundamental do Cálculo?',
      back: 'Conecta a diferenciação com a integração, estabelecendo que a integração é a operação inversa da derivada.',
    },
    {
      id: 'fc-2',
      subject: 'Álgebra Linear',
      front: 'Quando é que uma matriz tem inversa A^-1?',
      back: 'Uma matriz quadrada A tem inversa se e só se o seu determinante for diferente de zero (det(A) != 0).',
    },
    {
      id: 'fc-3',
      subject: 'Física II',
      front: 'Qual é a 2ª Lei de Maxwell?',
      back: 'Lei de Gauss para o Magnetismo: O fluxo magnético total através de qualquer superfície fechada é sempre zero (não existem monopolos magnéticos).',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredCount, setMasteredCount] = useState<number>(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const currentCard = cards[currentIndex] || cards[0];

  const handleNextCard = (mastered: boolean) => {
    if (mastered) {
      setMasteredCount((prev) => prev + 1);
      showToast('🎉 Excelente memória! Cartão Dominado (+15 XP)', 'success');
    }
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront || !newBack) return;

    const newFc: Flashcard = {
      id: `fc-${Date.now()}`,
      subject: newSubject || 'Geral',
      front: newFront,
      back: newBack,
    };

    setCards([...cards, newFc]);
    setNewFront('');
    setNewBack('');
    setIsAddModalOpen(false);
    showToast('Novo Flashcard adicionado com sucesso!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Brain size={16} className="text-amber-500" /> Cartões de Revisão / Flashcards ({cards.length})
          </h4>
          <p className="text-xs text-slate-500">Toca no cartão para revelar a resposta. Dominados: {masteredCount} cartões.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Criar Flashcard</span>
        </button>
      </div>

      {/* Main Flashcard View */}
      {cards.length > 0 && (
        <div className="max-w-xl mx-auto space-y-4">
          
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[220px] p-8 rounded-3xl border shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between text-center select-none ${
              isFlipped
                ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 text-white border-indigo-500/50'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-indigo-500/40'
            }`}
          >
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full uppercase">
                {currentCard.subject}
              </span>
              <span>Cartão {currentIndex + 1} de {cards.length}</span>
            </div>

            <div className="py-6 space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-500">
                {isFlipped ? '💡 Resposta / Solução' : '❓ Pergunta / Conceito (Clica para virar)'}
              </span>
              <p className="text-lg sm:text-xl font-bold leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 font-semibold">
              {isFlipped ? 'Clica para voltar à pergunta' : 'Clica para ver a resposta'}
            </div>
          </div>

          {/* Mastered / Missed Controls */}
          {isFlipped && (
            <div className="flex items-center justify-center gap-4 animate-fade-in">
              <button
                onClick={() => handleNextCard(false)}
                className="px-6 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <X size={16} />
                <span>Preciso de Rever</span>
              </button>

              <button
                onClick={() => handleNextCard(true)}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-colors"
              >
                <Check size={16} />
                <span>Acertei! (+15 XP)</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Modal Add Flashcard */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Criar Novo Flashcard</h3>
            <form onSubmit={handleAddCard} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Disciplina / Matéria</label>
                <input
                  type="text"
                  placeholder="Ex: Cálculo II"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Frente (Pergunta / Conceito)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: O que é o Teorema de Bolzano?"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Verso (Resposta / Definição)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Estabelece que se uma função contínua muda de sinal num intervalo..."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 text-slate-500">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl">
                  Criar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
