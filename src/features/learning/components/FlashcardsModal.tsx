import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { RotateCw, Award, Plus, Trash2 } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  nextReviewDays?: number;
}

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectiveTitle: string;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  objectiveTitle,
}) => {
  const { showToast } = useToast();

  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: '1',
      front: `Qual é o conceito fundamental de "${objectiveTitle}"?`,
      back: `É o princípio chave que estrutura toda a aplicação prática deste tema de estudo.`,
    },
    {
      id: '2',
      front: `Como aplicar "${objectiveTitle}" num cenário prático?`,
      back: `Dividindo o problema em etapas acionáveis e testando cada módulo sequencialmente.`,
    },
    {
      id: '3',
      front: `Qual a melhor técnica de retenção para "${objectiveTitle}"?`,
      back: `Prática intercalada com sessões de repetição espaçada e auto-explicação.`,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const currentCard = cards[currentIndex];

  const handleNextCard = (difficulty: 'easy' | 'medium' | 'hard') => {
    const days = difficulty === 'easy' ? 7 : difficulty === 'medium' ? 3 : 1;
    const updatedCards = [...cards];
    updatedCards[currentIndex] = {
      ...updatedCards[currentIndex],
      difficulty,
      nextReviewDays: days,
    };
    setCards(updatedCards);
    setIsFlipped(false);

    showToast(`Cartão classificado como ${difficulty === 'easy' ? 'Fácil (+7d)' : difficulty === 'medium' ? 'Médio (+3d)' : 'Difícil (+1d)'}`, 'info');

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      showToast('🎉 Sessão de Flashcards concluída com sucesso!', 'success');
      setCurrentIndex(0);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newFront.trim(),
      back: newBack.trim(),
    };

    setCards([...cards, newCard]);
    setNewFront('');
    setNewBack('');
    setShowAddForm(false);
    showToast('Novo Flashcard adicionado!', 'success');
  };

  const handleDeleteCard = (id: string) => {
    if (cards.length <= 1) {
      showToast('Deve manter pelo menos um flashcard.', 'error');
      return;
    }
    const filtered = cards.filter((c) => c.id !== id);
    setCards(filtered);
    if (currentIndex >= filtered.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Flashcards de Memorização: ${objectiveTitle}`}
      size="md"
    >
      <div className="space-y-5">
        {/* Top Header metrics */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Cartão {currentIndex + 1} de {cards.length}
            </span>
          </div>
          <Badge variant="primary" size="sm">
            Repetição Espaçada
          </Badge>
        </div>

        {/* Card View Container */}
        {currentCard && !showAddForm && (
          <div className="space-y-4">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[200px] p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-indigo-300 font-bold uppercase tracking-wider">
                <span>{isFlipped ? '💡 Resposta / Explicação' : '❓ Pergunta / Conceito'}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <RotateCw size={12} /> Clica para virar
                </span>
              </div>

              <div className="my-auto py-4">
                <p className="text-lg sm:text-xl font-bold leading-relaxed text-white text-center">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                <span>NEXO Spaced Repetition</span>
                {currentCard.difficulty && (
                  <span className="font-bold text-emerald-400 uppercase">
                    Última nota: {currentCard.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Flipped controls */}
            {isFlipped ? (
              <div className="space-y-2 animate-fade-in">
                <span className="text-xs font-bold text-slate-500 block text-center uppercase tracking-wider">
                  Avalia a tua facilidade de resposta:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleNextCard('hard')}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors"
                  >
                    🔴 Difícil (+1 dia)
                  </button>
                  <button
                    onClick={() => handleNextCard('medium')}
                    className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    🟡 Médio (+3 dias)
                  </button>
                  <button
                    onClick={() => handleNextCard('easy')}
                    className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    🟢 Fácil (+7 dias)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFlipped(true)}
                  className="flex-1"
                  leftIcon={<RotateCw size={14} />}
                >
                  Revelar Resposta
                </Button>
                <button
                  onClick={() => handleDeleteCard(currentCard.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                  title="Eliminar este cartão"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddCard} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Criar Novo Flashcard</h4>
            <Input
              label="Pergunta / Frente"
              placeholder="Ex: O que é a lei de Pareto?"
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              required
            />
            <Textarea
              label="Resposta / Verso"
              placeholder="Ex: 80% dos resultados provêm de 20% dos esforços."
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              rows={2}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Guardar Cartão
              </Button>
            </div>
          </form>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            leftIcon={<Plus size={15} />}
          >
            {showAddForm ? 'Voltar aos Cartões' : '+ Novo Cartão'}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
