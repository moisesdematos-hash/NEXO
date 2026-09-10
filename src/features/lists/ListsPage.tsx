import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, ListChecks, Trash2, CheckSquare, Square, Volume2, Settings, 
  Sparkles, Mic, Share2, RefreshCw, X, ArrowLeft
} from 'lucide-react';
import { useLists, useListItems } from '../../hooks/useLists';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { ListFormModal, LIST_CATEGORIES } from './components/ListFormModal';
import { ListRow } from '../../services/listsService';

interface ListCardProps {
  list: ListRow;
  onDeleteList: (id: string) => void;
  voiceRate: number;
}

const ListCard: React.FC<ListCardProps> = ({ list, onDeleteList }) => {
  const { items, isLoading, addItem, toggleItem, deleteItem } = useListItems(list.id);
  const [newItemText, setNewItemText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { showToast } = useToast();

  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemText.trim()) return;
    try {
      await addItem({
        list_id: list.id,
        content: newItemText.trim(),
        is_completed: false,
      });
      setNewItemText('');
    } catch {
      showToast('Erro ao adicionar item.', 'error');
    }
  };

  const handleToggle = async (itemId: string, isCompleted: boolean) => {
    try {
      await toggleItem({ id: itemId, isCompleted });
    } catch {
      showToast('Erro ao actualizar item.', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
    } catch {
      showToast('Erro ao remover item.', 'error');
    }
  };

  // Voice dictation for list item
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Ditado por voz não suportado neste navegador.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-PT';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setNewItemText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          showToast(`Ditado: "${transcript}"`, 'info');
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
      showToast('Erro ao ativar microfone.', 'error');
    }
  };

  // Export / Copy formatted list to clipboard
  const handleShareList = () => {
    if (items.length === 0) {
      showToast('A lista está vazia.', 'info');
      return;
    }

    const textLines = [
      `📋 *${list.title}* (${list.category || 'Geral'})`,
      ...items.map((i) => `${i.is_completed ? '✅' : '⬜'} ${i.content}`),
      `\n_Partilhado via NEXO App_`
    ];

    const text = textLines.join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Lista copiada para a área de transferência!', 'success');
    } else {
      showToast('Não foi possível copiar a lista.', 'error');
    }
  };

  // Clear all completed items
  const handleClearCompleted = async () => {
    const completedItems = items.filter((i) => i.is_completed);
    if (completedItems.length === 0) {
      showToast('Nenhum item concluído para limpar.', 'info');
      return;
    }

    try {
      await Promise.all(completedItems.map((i) => deleteItem(i.id)));
      showToast(`${completedItems.length} itens concluídos removidos.`, 'success');
    } catch {
      showToast('Erro ao limpar itens.', 'error');
    }
  };

  // Reset all items (uncheck)
  const handleResetAll = async () => {
    const completedItems = items.filter((i) => i.is_completed);
    if (completedItems.length === 0) return;

    try {
      await Promise.all(completedItems.map((i) => toggleItem({ id: i.id, isCompleted: true })));
      showToast('Todos os itens foram desmarcados.', 'info');
    } catch {
      showToast('Erro ao reiniciar lista.', 'error');
    }
  };

  const completedCount = items.filter((i) => i.is_completed).length;
  const percent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const catObj = LIST_CATEGORIES.find((c) => c.id === list.category) || { icon: '📋', label: list.category || 'Geral' };

  return (
    <Card variant="default" padding="md" className="space-y-4 relative overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
      
      {/* Header da Lista */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              {catObj.icon} {catObj.label}
            </span>
            {percent === 100 && items.length > 0 && <Badge variant="success">Concluída</Badge>}
          </div>

          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white pt-1">{list.title}</h3>
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {completedCount} de {items.length} itens concluídos ({percent}%)
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleShareList}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copiar / Partilhar Lista"
          >
            <Share2 size={18} />
          </button>
          
          <button
            onClick={() => onDeleteList(list.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Eliminar Lista"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Barra de Progresso Visual */}
      {items.length > 0 && (
        <div className="space-y-1">
          <Progress value={percent} color={percent === 100 ? 'success' : 'primary'} />
        </div>
      )}

      {/* Form de Adição com Ditado por Voz */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Adicionar novo item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[42px]"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
            title="Ditado por voz"
          >
            <Mic size={16} />
          </button>
        </div>

        <Button type="submit" variant="secondary" size="sm" className="shrink-0 min-h-[42px] px-4 font-bold">
          + Adicionar
        </Button>
      </form>

      {/* Lista de Itens */}
      {isLoading ? (
        <div className="text-xs text-slate-400 py-2">A carregar itens...</div>
      ) : items.length === 0 ? (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 text-center border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 italic">Esta lista ainda não tem itens.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-none">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                item.is_completed
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => handleToggle(item.id, item.is_completed)}
                className="flex items-center gap-2 text-xs font-semibold text-left min-w-0 flex-1 cursor-pointer"
              >
                {item.is_completed ? (
                  <CheckSquare size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Square size={18} className="text-slate-400 shrink-0" />
                )}
                <span
                  className={`truncate ${
                    item.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {item.content}
                </span>
              </button>

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
                title="Remover item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Acções Rápidas de Rodapé */}
      {items.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={handleClearCompleted}
            disabled={completedCount === 0}
            className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 disabled:hover:text-slate-500 font-semibold"
          >
            Limpar Concluídos
          </button>

          <button
            onClick={handleResetAll}
            disabled={completedCount === 0}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold disabled:opacity-40"
          >
            <RefreshCw size={12} /> Desmarcar Todos
          </button>
        </div>
      )}

    </Card>
  );
};

export const ListsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lists, isLoading, isError, refetch, createList, deleteList } = useLists();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Settings
  const [voiceRate, setVoiceRate] = useState<number>(() => {
    return Number(localStorage.getItem('nexo_lists_voice_rate')) || 1;
  });

  const handleDeleteList = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta lista e todos os seus itens?')) return;
    try {
      await deleteList(id);
      showToast('Lista eliminada.', 'info');
    } catch {
      showToast('Erro ao eliminar lista.', 'error');
    }
  };

  // Preset Template Lists Generator
  const handleCreateTemplate = async (title: string, category: string) => {
    try {
      await createList({ title, category });
      showToast(`Lista "${title}" criada com sucesso!`, 'success');
    } catch {
      showToast('Erro ao criar lista de modelo.', 'error');
    }
  };

  // Voice Briefing
  const handleVoiceBriefing = () => {
    if (!('speechSynthesis' in window)) {
      showToast('A síntese de voz não é suportada neste navegador.', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const totalLists = lists.length;
    const text = `Resumo das suas listas no Nexo. Possui um total de ${totalLists} listas criadas. ${
      totalLists > 0
        ? `Categorias disponíveis: Compras, Viagem e Tarefas. Utilize os modelos pré-definidos para poupar tempo!`
        : 'Crie a sua primeira lista de compras ou checklist.'
    }`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = voiceRate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem('nexo_lists_voice_rate', voiceRate.toString());
    setIsCustomizing(false);
    showToast('Preferências de listas guardadas!', 'success');
  };

  if (isLoading) return <LoadingState label="A carregar listas..." />;
  if (isError) return <ErrorState message="Não foi possível carregar as listas." onRetry={() => refetch()} />;

  const filteredLists = lists.filter((l) => {
    if (selectedCategory === 'all') return true;
    return (l.category || 'Outro') === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header & Hero Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <Badge variant="primary" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30">
              Organização & Checklists
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              As Minhas Listas & Checklists
            </h1>

            <p className="text-sm text-indigo-200/80">
              {lists.length} listas ativas • Compras, viagens e materiais essenciais
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              size="md"
              leftIcon={<ArrowLeft size={18} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold"
            >
              Voltar
            </Button>

            <Button
              onClick={handleVoiceBriefing}
              variant="secondary"
              size="md"
              leftIcon={<Volume2 size={18} className={isSpeaking ? 'animate-bounce text-amber-400' : ''} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {isSpeaking ? 'A falar...' : 'Briefing de Voz'}
            </Button>

            <Button
              onClick={() => setIsCustomizing(true)}
              variant="secondary"
              size="md"
              leftIcon={<Settings size={18} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Preferências
            </Button>

            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              size="md"
              leftIcon={<Plus size={20} />}
              className="bg-indigo-500 hover:bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/30"
            >
              Nova Lista
            </Button>
          </div>
        </div>

        {/* Modelos IA Rápidos (Presets 1-Clique) */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-2 relative z-10">
          <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" /> Modelos Rápidos em 1-Clique:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCreateTemplate('Supermercado Semanal', 'Compras')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/15 flex items-center gap-1"
            >
              🛒 Supermercado Semanal
            </button>
            <button
              onClick={() => handleCreateTemplate('Mala de Viagem', 'Viagem')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/15 flex items-center gap-1"
            >
              🧳 Mala de Viagem
            </button>
            <button
              onClick={() => handleCreateTemplate('Material Escolar', 'Material Escolar')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/15 flex items-center gap-1"
            >
              📚 Material Escolar
            </button>
            <button
              onClick={() => handleCreateTemplate('Limpeza da Casa', 'Tarefas Rápidas')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/15 flex items-center gap-1"
            >
              🧹 Limpeza da Casa
            </button>
          </div>
        </div>
      </div>

      {/* Categorias Filtro */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          🌟 Todas ({lists.length})
        </button>

        {LIST_CATEGORIES.map((cat) => {
          const count = lists.filter((l) => (l.category || 'Outro') === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo de Listas */}
      {filteredLists.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={28} />}
          title={selectedCategory === 'all' ? "Nenhuma lista criada" : "Nenhuma lista nesta categoria"}
          description="Ainda não criou nenhuma lista nesta secção. Crie a sua primeira lista de compras ou checklist!"
          actionLabel="+ Criar Lista"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLists.map((l) => (
            <ListCard key={l.id} list={l} onDeleteList={handleDeleteList} voiceRate={voiceRate} />
          ))}
        </div>
      )}

      {/* List Form Modal */}
      <ListFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Customization Modal */}
      {isCustomizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Preferências de Listas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ajuste parâmetros de voz, ditado e ordenação.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomizing(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Velocidade do Briefing de Voz ({voiceRate}x)
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.25"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Lento (0.75x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Rápido (1.5x)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 space-y-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-400" />
                  Dica de Produtividade
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pode usar o microfone integrado em cada lista para ditar verbalmente os artigos de compras sem precisar de digitar. O botão de partilha copia a lista formatada para enviar no WhatsApp em 1-clique!
                </p>
              </div>
            </div>

            {/* Footer with Sticky Sair button */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCustomizing(false)}
                className="font-bold"
              >
                Sair
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Guardar Preferências
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ListsPage;
