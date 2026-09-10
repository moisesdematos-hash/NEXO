import React, { useState } from 'react';
import { Calculator, Award, CheckCircle2 } from 'lucide-react';

export const FinalGradeCalculator: React.FC = () => {
  const [continuousGrade, setContinuousGrade] = useState<number>(14.5);
  const [continuousWeight, setContinuousWeight] = useState<number>(40);
  const [targetFinalGrade, setTargetFinalGrade] = useState<number>(16.0);
  const examWeight = 100 - continuousWeight;

  // Formula: FinalGrade = (Continuous * WeightCont + Exam * WeightExam) / 100
  // Exam = (FinalGrade * 100 - Continuous * WeightCont) / WeightExam
  const requiredExamForTarget = ((targetFinalGrade * 100 - continuousGrade * continuousWeight) / examWeight).toFixed(2);
  const requiredExamToPass = ((10.0 * 100 - continuousGrade * continuousWeight) / examWeight).toFixed(2);

  const numRequiredTarget = parseFloat(requiredExamForTarget);
  const numRequiredPass = parseFloat(requiredExamToPass);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator size={20} className="text-amber-500" />
          <span>Calculadora "Quanto Preciso de Tirar no Exame Final?"</span>
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Insira as tuas notas contínuas e descobre a nota exata necessária no exame para aprovação ou meta desejada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Inputs */}
        <div className="md:col-span-6 space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Nota da Avaliação Contínua (Trabalhos/Testes)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{continuousGrade} / 20</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={continuousGrade}
              onChange={(e) => setContinuousGrade(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Peso da Avaliação Contínua (%)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{continuousWeight}% (Exame = {examWeight}%)</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={continuousWeight}
              onChange={(e) => setContinuousWeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Nota Final Desejada (Meta de Cadeira)</span>
              <span className="text-amber-500 font-bold">{targetFinalGrade} / 20</span>
            </div>
            <input
              type="range"
              min={10}
              max={20}
              step={0.5}
              value={targetFinalGrade}
              onChange={(e) => setTargetFinalGrade(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {/* Right Output Display */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white space-y-4 border border-indigo-500/30 shadow-xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
            Resultado dos Cálculos Académicos
          </span>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-200 block font-semibold">Nota Exigida no Exame Final (para Meta {targetFinalGrade}):</span>
              <div className="text-3xl font-black text-amber-400 mt-1">
                {numRequiredTarget > 20 ? 'Impossível (>20)' : numRequiredTarget < 0 ? 'Já Garantida! (0.0)' : `${requiredExamForTarget} Valores`}
              </div>
            </div>
            <Award size={32} className="text-amber-400 shrink-0" />
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-200 block font-semibold">Nota Mínima Absoluta para Passar (Média 10.0):</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {numRequiredPass <= 0 ? 'Já Aprovado sem Exame!' : `${requiredExamToPass} Valores`}
              </div>
            </div>
            <CheckCircle2 size={28} className="text-emerald-400 shrink-0" />
          </div>
        </div>

      </div>

    </div>
  );
};
