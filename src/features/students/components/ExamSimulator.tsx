import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, RotateCcw, FileText, Zap, BookOpen } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { knowledgeReuseService, VERIFIED_EXAM_TEMPLATES, ExamTemplate } from '../../../services/knowledgeReuseService';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const ExamSimulator: React.FC = () => {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const sampleQuestions: Question[] = VERIFIED_EXAM_TEMPLATES[0].questions;

  const handleSelectTemplate = (template: ExamTemplate) => {
    setInputText(template.description);
    setQuestions(template.questions);
    setSelectedAnswers({});
    setIsSubmitted(false);
    knowledgeReuseService.recordTokenSavings(1200);
    showToast(`⚡ Exame "${template.title}" carregado instantaneamente (0 Tokens gastos)!`, 'success');
  };

  const handleGenerateExam = () => {
    if (!inputText.trim()) {
      showToast('Por favor insira ou cole os seus apontamentos de estudo.', 'error');
      return;
    }

    const matchedTemplate = knowledgeReuseService.findMatchingExamTemplate(inputText);
    if (matchedTemplate) {
      handleSelectTemplate(matchedTemplate);
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setQuestions(sampleQuestions);
      setSelectedAnswers({});
      setIsSubmitted(false);
      knowledgeReuseService.recordTokenSavings(1200);
      showToast('🎉 Exame Simulado gerado com sucesso!', 'success');
    }, 1200);
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitExam = () => {
    if (!questions) return;
    if (Object.keys(selectedAnswers).length < questions.length) {
      showToast('Por favor responda a todas as questões antes de submeter.', 'error');
      return;
    }

    setIsSubmitted(true);
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) correctCount++;
    });

    const score20 = ((correctCount / questions.length) * 20).toFixed(1);
    showToast(`🎓 Exame Concluído! Nota: ${score20} / 20 Valores (+${correctCount * 30} XP)`, 'success');
  };

  const handleResetExam = () => {
    setQuestions(null);
    setInputText('');
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 shadow-inner">
            <FileText size={32} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Gerador de Exames Simulados por IA</h3>
            <p className="text-xs text-indigo-200 mt-1">
              Cole os teus apontamentos e gera exames de teste com correção automática e explicações.
            </p>
          </div>
        </div>
      </div>

      {!questions ? (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Cole aqui os apontamentos, resumos ou matérias da cadeira:
          </label>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ex: O Teorema do Valor Médio estabelece que se uma função for contínua num intervalo fechado..."
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
          />

          {/* Atalhos Rápidos de Exames Pré-Verificados */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap size={13} className="text-amber-400" />
                <span>Exames Modelo Prontos (0 Tokens):</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ⚡ Instantâneo
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {VERIFIED_EXAM_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen size={13} className="text-indigo-500" />
                  <span>{tmpl.subject}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerateExam}
              disabled={isGenerating || !inputText.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={16} className="text-amber-300" />
              <span>{isGenerating ? 'A gerar questões...' : 'Gerar Exame Simulado'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                    Questão {idx + 1} de {questions.length}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {q.question}
                </h4>

                <div className="space-y-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    const isCorrect = q.correctAnswer === optIdx;

                    let btnStyle = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                    if (isSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                        {isSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                    <span className="font-extrabold block">💡 Explicação do Tutor:</span>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitExam}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-xl hover:scale-[1.02] transition-all"
              >
                Submeter e Corrigir Exame
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-amber-400">
                  Exame Concluído!
                </span>
                <button
                  onClick={handleResetExam}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  <span>Novo Exame Simulado</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
