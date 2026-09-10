import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Trophy, Clock } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export const PomodoroTimer: React.FC = () => {
  const { showToast } = useToast();
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(3);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'focus') {
        const nextSessions = sessionsCompleted + 1;
        setSessionsCompleted(nextSessions);
        showToast('🎉 Parabéns! Sessão de Foco Concluída! Ganhaste +50 XP de Estudo!', 'success');
        setMode('break');
        setSecondsLeft(5 * 60);
      } else {
        showToast('☕ Pausa Terminada! Hora de voltar ao foco.', 'info');
        setMode('focus');
        setSecondsLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, mode, sessionsCompleted]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progressPercent = mode === 'focus'
    ? ((25 * 60 - secondsLeft) / (25 * 60)) * 100
    : ((5 * 60 - secondsLeft) / (5 * 60)) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-indigo-500/40 text-white shadow-2xl space-y-6 text-center relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-xs border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} />
          <span>Temporizador Pomodoro Gamificado</span>
        </span>

        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
          <Trophy size={14} />
          <span>{sessionsCompleted} Sessões (+{sessionsCompleted * 50} XP)</span>
        </span>
      </div>

      {/* Mode Selector */}
      <div className="inline-flex p-1 rounded-2xl bg-slate-950 border border-slate-800">
        <button
          onClick={() => {
            setMode('focus');
            setIsRunning(false);
            setSecondsLeft(25 * 60);
          }}
          className={`px-5 py-2 rounded-xl font-extrabold text-xs transition-all ${
            mode === 'focus' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🎯 Foco Intenso (25 min)
        </button>
        <button
          onClick={() => {
            setMode('break');
            setIsRunning(false);
            setSecondsLeft(5 * 60);
          }}
          className={`px-5 py-2 rounded-xl font-extrabold text-xs transition-all ${
            mode === 'break' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          ☕ Pausa (5 min)
        </button>
      </div>

      {/* Timer Display */}
      <div className="space-y-4">
        <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
          {timeFormatted}
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              mode === 'focus' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={toggleTimer}
          className={`px-8 py-3.5 rounded-2xl font-extrabold text-base shadow-xl transition-all flex items-center gap-2 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
          }`}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          <span>{isRunning ? 'Pausar Sessão' : 'Iniciar Foco (+50 XP)'}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          title="Reiniciar Temporizador"
        >
          <RotateCcw size={20} />
        </button>
      </div>

    </div>
  );
};
