import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, PieChart, ShoppingBag, Home, Heart, PartyPopper, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Progress } from '../../../components/ui/Progress';
import { useToast } from '../../../components/ui/Toast';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 'supermarket' | 'housing' | 'health' | 'leisure' | 'other';
  date: string;
}

export const FamilyFinanceTracker: React.FC = () => {
  const { showToast } = useToast();

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    return Number(localStorage.getItem('nexo_monthly_budget')) || 1200;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('nexo_family_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      { id: 'exp-1', title: 'Supermercado Continente', amount: 84.50, category: 'supermarket', date: new Date().toISOString() },
      { id: 'exp-2', title: 'Fatura Eletricidade', amount: 62.10, category: 'housing', date: new Date().toISOString() },
      { id: 'exp-3', title: 'Farmácia & Vitaminas', amount: 24.30, category: 'health', date: new Date().toISOString() },
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('supermarket');

  useEffect(() => {
    localStorage.setItem('nexo_family_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('nexo_monthly_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Por favor introduza um título e valor válidos.', 'error');
      return;
    }

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      category,
      date: new Date().toISOString(),
    };

    setExpenses([newItem, ...expenses]);
    setTitle('');
    setAmount('');
    setIsAdding(false);
    showToast(`Despesa "${newItem.title}" registada! (${parsedAmount.toFixed(2)}€)`, 'success');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    showToast('Despesa removida.', 'info');
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const percentUsed = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

  const categoryIcons: Record<ExpenseItem['category'], { icon: React.ReactNode; label: string; bg: string }> = {
    supermarket: { icon: <ShoppingBag size={14} />, label: 'Supermercado', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
    housing: { icon: <Home size={14} />, label: 'Habitação & Serviços', bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
    health: { icon: <Heart size={14} />, label: 'Saúde', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
    leisure: { icon: <PartyPopper size={14} />, label: 'Lazer & Restauração', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
    other: { icon: <DollarSign size={14} />, label: 'Outros', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  };

  return (
    <Card variant="default" padding="md" className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <PieChart size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Gestão de Gastos & Orçamento Familiar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Controlo mensal de compras, faturas e despesas da casa
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          Nova Despesa
        </Button>
      </div>

      {/* Orçamento Limite Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-emerald-500" />
            Total Gasto no Mês: <strong className="text-slate-900 dark:text-white text-sm">{totalSpent.toFixed(2)} €</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Limite:</span>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value) || 1000)}
              className="w-20 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right font-bold"
            />
            <span className="text-slate-500">€</span>
          </div>
        </div>

        <Progress value={percentUsed} color={percentUsed >= 85 ? 'warning' : 'success'} />

        {percentUsed >= 80 && (
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 mt-1">
            <AlertTriangle size={14} className="shrink-0" />
            Alerta: Já utilizou {percentUsed}% do orçamento mensal definido ({monthlyBudget}€).
          </div>
        )}
      </div>

      {/* Form de Nova Despesa */}
      {isAdding && (
        <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-fade-in">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Adicionar Nova Despesa</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Descrição *"
              placeholder="Ex: Supermercado, Luz, Água"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Valor (€) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="supermarket">🛒 Supermercado</option>
                <option value="housing">🏠 Habitação & Serviços</option>
                <option value="health">❤️ Saúde</option>
                <option value="leisure">🎉 Lazer & Restauração</option>
                <option value="other">📌 Outros</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Registar
            </Button>
          </div>
        </form>
      )}

      {/* Lista de Despesas */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {expenses.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma despesa registada este mês.</p>
        ) : (
          expenses.map((item) => {
            const cat = categoryIcons[item.category] || categoryIcons.other;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${cat.bg}`}>
                    {cat.icon}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white truncate block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.date).toLocaleDateString('pt-PT')} • {cat.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {item.amount.toFixed(2)} €
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </Card>
  );
};

export default FamilyFinanceTracker;
