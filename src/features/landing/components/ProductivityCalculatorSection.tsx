import React, { useState } from 'react';
import { Calculator, Clock, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductivityCalculatorSection: React.FC = () => {
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(6);
  const [familyMembers, setFamilyMembers] = useState<number>(2);

  // Calculations
  const hoursSavedPerYear = Math.round(hoursPerWeek * 52 * 0.65);
  const moneySavedPerYear = Math.round(familyMembers * 15 * 12);
  const tasksAutomated = Math.round(hoursPerWeek * 18);

  return (
    <section id="calculadora" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator size={14} />
            <span>Simulador de Poupança &amp; Impacto Real</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Quanto tempo e dinheiro vais poupar com o NEXO?
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
            Muda os valores abaixo e calcula o impacto imediato da centralização no teu dia a dia.
          </p>
        </div>

        {/* Calculator Widget Card */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 border border-indigo-500/40 shadow-2xl text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Controls Left Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Slider 1: Hours spent organizing */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-indigo-200">
                    Horas gastas por semana a organizar rotinas/gastos:
                  </label>
                  <span className="text-xl font-extrabold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-xl border border-blue-500/30">
                    {hoursPerWeek}h / sem
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>1h (Mínimo)</span>
                  <span>10h (Médio)</span>
                  <span>20h+ (Muito caos)</span>
                </div>
              </div>

              {/* Slider 2: Family members */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-indigo-200">
                    Pessoas/Membros na casa ou equipa:
                  </label>
                  <span className="text-xl font-extrabold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-xl border border-purple-500/30">
                    {familyMembers} {familyMembers === 1 ? 'Pessoa' : 'Pessoas'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>1 Pessoa</span>
                  <span>3 Pessoas</span>
                  <span>6+ Família Numerosa</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
                <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  O NEXO reduz em <strong>65%</strong> o tempo gasto a procurar mensagens soltas, criar listas duplicadas e calcular orçamentos em folhas de cálculo manuais.
                </span>
              </div>
            </div>

            {/* Results Right Column */}
            <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-5">
              <h4 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                Resultado Estimado de Poupança Anual
              </h4>

              {/* Stat 1: Hours Saved */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="p-3 rounded-xl bg-blue-600 text-white shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">
                    +{hoursSavedPerYear} Horas
                  </div>
                  <div className="text-xs font-medium text-blue-300">
                    Tempo livre recuperado por ano para a tua vida
                  </div>
                </div>
              </div>

              {/* Stat 2: Money Saved */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="p-3 rounded-xl bg-emerald-600 text-white shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">
                    ~{moneySavedPerYear}€ / ano
                  </div>
                  <div className="text-xs font-medium text-emerald-300">
                    Poupados ao eliminar subscrições pagas de apps dispersas
                  </div>
                </div>
              </div>

              {/* Stat 3: Tasks Automated */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="p-3 rounded-xl bg-purple-600 text-white shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">
                    {tasksAutomated} Ações
                  </div>
                  <div className="text-xs font-medium text-purple-300">
                    Tarefas e sincronizações de agenda simplificadas por mês
                  </div>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-center text-sm shadow-md transition-all block"
              >
                Recuperar Este Tempo Agora no NEXO
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
