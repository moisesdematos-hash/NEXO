import React, { useState, useEffect } from 'react';
import { Trophy, Star, CheckCircle2, Lock, Zap, RotateCcw, ChevronUp, Gift } from 'lucide-react';
import { useStudentXP, XP_ACTIONS, XP_LEVELS } from '../hooks/useStudentXP';

// ─── Badge definitions ───────────────────────────────────────────────────────
interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  /** returns 0–100 progress */
  calcProgress: (counts: Record<string, number>, totalXP: number) => number;
}

const BADGES: BadgeItem[] = [
  {
    id: 'b-pomodoro',
    title: 'Maratonista Pomodoro',
    description: 'Concluiu 10 sessões Pomodoro de 25 min.',
    icon: '⏱️',
    xpReward: 100,
    calcProgress: (c) => Math.min(100, Math.round(((c['pomodoro'] ?? 0) / 10) * 100)),
  },
  {
    id: 'b-flashcard',
    title: 'Mestre dos Flashcards',
    description: 'Completou 20 revisões de Flashcards.',
    icon: '🧠',
    xpReward: 80,
    calcProgress: (c) => Math.min(100, Math.round(((c['flashcard'] ?? 0) / 20) * 100)),
  },
  {
    id: 'b-exam',
    title: 'Sobrevivente de Exames',
    description: 'Completou 3 simuladores de exame IA.',
    icon: '🎓',
    xpReward: 150,
    calcProgress: (c) => Math.min(100, Math.round(((c['exam_complete'] ?? 0) / 3) * 100)),
  },
  {
    id: 'b-mentor',
    title: 'Pioneiro da Mentoria IA',
    description: 'Consultou mentores IA 5 vezes distintas.',
    icon: '🤖',
    xpReward: 100,
    calcProgress: (c) => Math.min(100, Math.round(((c['mentor_chat'] ?? 0) / 5) * 100)),
  },
  {
    id: 'b-schedule',
    title: 'Organizador Supremo',
    description: 'Adicionou 5 aulas ao Horário Semanal.',
    icon: '📅',
    xpReward: 75,
    calcProgress: (c) => Math.min(100, Math.round(((c['schedule_add'] ?? 0) / 5) * 100)),
  },
  {
    id: 'b-sound',
    title: 'Maestro do Foco',
    description: 'Ativou sessões de Som Binaural 3 vezes.',
    icon: '🎵',
    xpReward: 60,
    calcProgress: (c) => Math.min(100, Math.round(((c['sound_session'] ?? 0) / 3) * 100)),
  },
  {
    id: 'b-note',
    title: 'Colega Exemplar',
    description: 'Partilhou 5 resumos no Chat de Estudo.',
    icon: '💬',
    xpReward: 90,
    calcProgress: (c) => Math.min(100, Math.round(((c['note_shared'] ?? 0) / 5) * 100)),
  },
  {
    id: 'b-calc',
    title: 'Calculador Estratégico',
    description: 'Usou a Calculadora de Nota Mínima 5 vezes.',
    icon: '🧮',
    xpReward: 50,
    calcProgress: (c) => Math.min(100, Math.round(((c['calc_used'] ?? 0) / 5) * 100)),
  },
  {
    id: 'b-level5',
    title: 'Académico Confirmado',
    description: 'Atingiu o Nível 5 – Liga Ouro.',
    icon: '🥇',
    xpReward: 200,
    calcProgress: (_, xp) => Math.min(100, Math.round((xp / 1750) * 100)),
  },
  {
    id: 'b-level7',
    title: 'Estudante de Distinção',
    description: 'Atingiu o Nível 7 – Liga Platina.',
    icon: '💎',
    xpReward: 500,
    calcProgress: (_, xp) => Math.min(100, Math.round((xp / 4000) * 100)),
  },
  {
    id: 'b-level10',
    title: 'Grande Académico',
    description: 'Atingiu o Nível 10 – Liga Diamante.',
    icon: '🌟',
    xpReward: 1000,
    calcProgress: (_, xp) => Math.min(100, Math.round((xp / 10000) * 100)),
  },
  {
    id: 'b-all',
    title: 'Enciclopédia Viva',
    description: 'Desbloqueou todas as outras 11 conquistas.',
    icon: '📚',
    xpReward: 2000,
    calcProgress: () => 0, // computed dynamically below
  },
];

// ─── League color helpers ────────────────────────────────────────────────────
const LEAGUE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  Bronze:   { bg: 'bg-amber-900/20', border: 'border-amber-700/40', text: 'text-amber-600' },
  Prata:    { bg: 'bg-slate-400/10', border: 'border-slate-400/30', text: 'text-slate-400' },
  Ouro:     { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  Platina:  { bg: 'bg-cyan-400/10',  border: 'border-cyan-400/30',  text: 'text-cyan-400'  },
  Diamante: { bg: 'bg-violet-400/10',border: 'border-violet-400/30',text: 'text-violet-400'},
};

// ─── Component ───────────────────────────────────────────────────────────────
export const AcademicBadges: React.FC = () => {
  const {
    totalXP, currentLevel, nextLevel, progressPct, xpToNext,
    earnXP, resetXP, setTotalXP, isCoolingDown, actionCount,
  } = useStudentXP();

  const [lastGain, setLastGain] = useState<number | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [manualXP, setManualXP] = useState('');
  const [prevLevel, setPrevLevel] = useState(currentLevel.level);
  const [levelUpAnim, setLevelUpAnim] = useState(false);

  // detect level-up
  useEffect(() => {
    if (currentLevel.level > prevLevel) {
      setLevelUpAnim(true);
      setPrevLevel(currentLevel.level);
      setTimeout(() => setLevelUpAnim(false), 2500);
    }
  }, [currentLevel.level, prevLevel]);

  const actionCounts: Record<string, number> = {};
  XP_ACTIONS.forEach(a => { actionCounts[a.id] = actionCount(a.id); });

  // Compute badge progress dynamically
  const badgeProgress = BADGES.map((b) => {
    if (b.id === 'b-all') {
      // count how many of the other badges are unlocked
      const otherUnlocked = BADGES.slice(0, BADGES.length - 1).filter((_, j) => {
        const prog = BADGES[j].calcProgress(actionCounts, totalXP);
        return prog >= 100;
      }).length;
      return Math.round((otherUnlocked / (BADGES.length - 1)) * 100);
    }
    return b.calcProgress(actionCounts, totalXP);
  });

  const leagueStyle = LEAGUE_STYLES[currentLevel.league] ?? LEAGUE_STYLES['Bronze'];

  const handleEarnXP = (actionId: string) => {
    const gained = earnXP(actionId);
    if (gained > 0) {
      setLastGain(gained);
      setTimeout(() => setLastGain(null), 1800);
    }
  };

  const handleManualAdd = () => {
    const n = parseInt(manualXP, 10);
    if (!isNaN(n) && n > 0) {
      setTotalXP(totalXP + n);
      setLastGain(n);
      setTimeout(() => setLastGain(null), 1800);
      setManualXP('');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Level-Up Banner ── */}
      {levelUpAnim && (
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-4 shadow-xl animate-bounce">
          <ChevronUp size={22} />
          <span className="font-black text-lg">🎉 Subiu para Nível {currentLevel.level} — {currentLevel.name}!</span>
          <ChevronUp size={22} />
        </div>
      )}

      {/* ── XP Card ── */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl border ${leagueStyle.border} shadow-xl p-6 sm:p-8`}>
        {/* Floating +XP animation */}
        {lastGain !== null && (
          <div className="absolute top-4 right-6 animate-bounce pointer-events-none z-10">
            <span className="text-emerald-400 font-black text-xl">+{lastGain} XP</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: icon + level info */}
          <div className="flex items-center gap-5">
            <div className="text-5xl select-none">{currentLevel.icon}</div>
            <div>
              <div className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${leagueStyle.text}`}>
                Liga {currentLevel.league}
              </div>
              <h3 className="text-2xl font-black text-white">Nível {currentLevel.level} — {currentLevel.name}</h3>
              <p className="text-sm text-slate-400 mt-0.5">
                {nextLevel
                  ? <>{xpToNext} XP para o <span className="text-white font-bold">Nível {nextLevel.level}</span></>
                  : <span className="text-amber-400 font-bold">🏆 Nível máximo atingido!</span>
                }
              </p>
            </div>
          </div>

          {/* Right: total XP pill */}
          <div className={`flex items-center gap-2 ${leagueStyle.bg} border ${leagueStyle.border} px-4 py-2 rounded-2xl`}>
            <Star size={18} fill="currentColor" className={leagueStyle.text} />
            <span className={`font-black text-lg ${leagueStyle.text}`}>{totalXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Progresso para Nível {nextLevel?.level ?? currentLevel.level}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                currentLevel.league === 'Diamante' ? 'bg-gradient-to-r from-violet-500 to-pink-500' :
                currentLevel.league === 'Platina'  ? 'bg-gradient-to-r from-cyan-400 to-blue-500'   :
                currentLevel.league === 'Ouro'     ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                'bg-gradient-to-r from-slate-400 to-slate-300'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>{currentLevel.minXP.toLocaleString()} XP</span>
            <span>{nextLevel ? (currentLevel.maxXP + 1).toLocaleString() : '∞'} XP</span>
          </div>
        </div>

        {/* Level roadmap pills */}
        <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {XP_LEVELS.map(l => (
            <div
              key={l.level}
              className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                l.level < currentLevel.level
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : l.level === currentLevel.level
                  ? `${leagueStyle.bg} ${leagueStyle.border} ${leagueStyle.text} ring-1 ring-offset-1 ring-offset-slate-900 ring-amber-500`
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <span>{l.icon}</span>
              <span>Nv.{l.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── +XP Actions ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Zap size={18} className="text-amber-500" />
          Ganhar XP — Registe as suas actividades
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {XP_ACTIONS.map(a => {
            const cooling = isCoolingDown(a.id);
            const count = actionCount(a.id);
            return (
              <button
                key={a.id}
                onClick={() => handleEarnXP(a.id)}
                disabled={cooling}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                  cooling
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:shadow-md hover:border-indigo-400 active:scale-95'
                }`}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="leading-tight">{a.label}</span>
                <span className={`text-[10px] font-black ${cooling ? 'text-slate-400' : 'text-emerald-500'}`}>
                  {cooling ? '⏳ Cooldown' : `+${a.xp} XP`}
                </span>
                {count > 0 && (
                  <span className="text-[9px] text-slate-400">×{count} total</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Manual XP input */}
        <div className="mt-4 flex gap-2 items-center">
          <Gift size={16} className="text-violet-400 shrink-0" />
          <input
            type="number"
            min={1}
            value={manualXP}
            onChange={e => setManualXP(e.target.value)}
            placeholder="XP manual (ex: 500)"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleManualAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* ── Badges Grid ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            Conquistas ({badgeProgress.filter(p => p >= 100).length}/{BADGES.length} desbloqueadas)
          </h4>
          <button
            onClick={() => setShowReset(r => !r)}
            className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} />
            Resetar
          </button>
        </div>

        {showReset && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
            <span className="text-xs text-red-400 font-bold">Apagar todo o progresso XP?</span>
            <div className="flex gap-2">
              <button onClick={() => setShowReset(false)} className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">Cancelar</button>
              <button onClick={() => { resetXP(); setShowReset(false); }} className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Resetar</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES.map((b, i) => {
            const prog = badgeProgress[i];
            const unlocked = prog >= 100;
            return (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  unlocked
                    ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-indigo-950 border-amber-500/30 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 opacity-75'
                }`}
              >
                <div className={`text-3xl p-2.5 rounded-2xl shrink-0 border ${unlocked ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-800/60 border-slate-700'}`}>
                  {b.icon}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className={`font-extrabold text-sm leading-tight truncate ${unlocked ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {b.title}
                    </h5>
                    {unlocked
                      ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      : <Lock size={15} className="text-slate-500 shrink-0" />
                    }
                  </div>
                  <p className={`text-xs leading-relaxed ${unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                    {b.description}
                  </p>
                  <p className={`text-[10px] font-black ${unlocked ? 'text-amber-400' : 'text-slate-500'}`}>
                    +{b.xpReward} XP ao desbloquear
                  </p>

                  {!unlocked && (
                    <div className="pt-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span>Progresso</span>
                        <span>{prog}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${prog}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
