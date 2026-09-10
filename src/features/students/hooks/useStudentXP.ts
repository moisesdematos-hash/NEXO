import { useState, useCallback, useEffect } from 'react';

// ─── XP Levels ─────────────────────────────────────────────────────────────
export interface XPLevel {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  league: string;
  leagueColor: string; // tailwind color key prefix
  icon: string;
}

export const XP_LEVELS: XPLevel[] = [
  { level: 1,  name: 'Caloiro',           minXP: 0,     maxXP: 249,    league: 'Bronze',   leagueColor: 'amber-700',  icon: '🥉' },
  { level: 2,  name: 'Estudante',         minXP: 250,   maxXP: 499,    league: 'Bronze',   leagueColor: 'amber-700',  icon: '🥉' },
  { level: 3,  name: 'Dedicado',          minXP: 500,   maxXP: 999,    league: 'Prata',    leagueColor: 'slate-400',  icon: '🥈' },
  { level: 4,  name: 'Estudante Focado',  minXP: 1000,  maxXP: 1749,   league: 'Prata',    leagueColor: 'slate-400',  icon: '🥈' },
  { level: 5,  name: 'Académico',         minXP: 1750,  maxXP: 2749,   league: 'Ouro',     leagueColor: 'amber-500',  icon: '🥇' },
  { level: 6,  name: 'Scholar',           minXP: 2750,  maxXP: 3999,   league: 'Ouro',     leagueColor: 'amber-500',  icon: '🥇' },
  { level: 7,  name: 'Distinção',         minXP: 4000,  maxXP: 5499,   league: 'Platina',  leagueColor: 'cyan-400',   icon: '💎' },
  { level: 8,  name: 'Summa Cum Laude',   minXP: 5500,  maxXP: 7499,   league: 'Platina',  leagueColor: 'cyan-400',   icon: '💎' },
  { level: 9,  name: 'PhD Candidate',     minXP: 7500,  maxXP: 9999,   league: 'Diamante', leagueColor: 'violet-400', icon: '🏆' },
  { level: 10, name: 'Grande Académico',  minXP: 10000, maxXP: 99999,  league: 'Diamante', leagueColor: 'violet-400', icon: '🌟' },
];

// ─── XP Actions ─────────────────────────────────────────────────────────────
export interface XPAction {
  id: string;
  label: string;
  xp: number;
  icon: string;
  cooldownMs?: number; // ms before action can be repeated
}

export const XP_ACTIONS: XPAction[] = [
  { id: 'pomodoro',        label: 'Sessão Pomodoro completa',      xp: 50,  icon: '⏱️',  cooldownMs: 30 * 60 * 1000 },
  { id: 'flashcard',       label: 'Revisão de Flashcard',          xp: 10,  icon: '🧠',  cooldownMs: 5 * 60 * 1000  },
  { id: 'exam_complete',   label: 'Simulador de Exame concluído',  xp: 80,  icon: '📝',  cooldownMs: 60 * 60 * 1000 },
  { id: 'mentor_chat',     label: 'Consultou Mentor IA',           xp: 20,  icon: '🤖',  cooldownMs: 10 * 60 * 1000 },
  { id: 'schedule_add',    label: 'Aula adicionada ao Horário',    xp: 15,  icon: '📅',  cooldownMs: 0              },
  { id: 'sound_session',   label: 'Sessão de Som Binaural ativa',  xp: 25,  icon: '🎵',  cooldownMs: 20 * 60 * 1000 },
  { id: 'note_shared',     label: 'Resumo partilhado no Chat',     xp: 30,  icon: '💬',  cooldownMs: 15 * 60 * 1000 },
  { id: 'calc_used',       label: 'Calculadora de Nota usada',     xp: 10,  icon: '🧮',  cooldownMs: 5 * 60 * 1000  },
];

// ─── Storage ─────────────────────────────────────────────────────────────────
const XP_STORAGE_KEY = 'nexo_student_xp';
const COOLDOWNS_KEY   = 'nexo_student_xp_cooldowns';

interface XPStorage {
  totalXP: number;
  actionCounts: Record<string, number>;
}

function loadXP(): XPStorage {
  try {
    const raw = localStorage.getItem(XP_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { totalXP: 1250, actionCounts: {} }; // default: start at level 4
}

function saveXP(data: XPStorage) {
  try { localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function loadCooldowns(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COOLDOWNS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveCooldowns(data: Record<string, number>) {
  try { localStorage.setItem(COOLDOWNS_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useStudentXP() {
  const [xpData, setXpData] = useState<XPStorage>(loadXP);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>(loadCooldowns);

  const totalXP = xpData.totalXP;

  const currentLevel: XPLevel = [...XP_LEVELS].reverse().find((l: XPLevel) => totalXP >= l.minXP) ?? XP_LEVELS[0];

  const nextLevel: XPLevel | undefined = XP_LEVELS[currentLevel.level]; // next index

  const progressPct = nextLevel
    ? Math.round(((totalXP - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP + 1)) * 100)
    : 100;

  const xpToNext = nextLevel ? nextLevel.minXP - totalXP : 0;

  /** Earn XP for a given action. Returns the XP earned (0 if on cooldown). */
  const earnXP = useCallback((actionId: string, customXP?: number): number => {
    const action = XP_ACTIONS.find(a => a.id === actionId);
    const xpGain = customXP ?? action?.xp ?? 10;

    if (action?.cooldownMs) {
      const lastUsed = cooldowns[actionId] ?? 0;
      if (Date.now() - lastUsed < action.cooldownMs) return 0;
    }

    const newCooldowns = { ...cooldowns, [actionId]: Date.now() };
    setCooldowns(newCooldowns);
    saveCooldowns(newCooldowns);

    setXpData(prev => {
      const next: XPStorage = {
        totalXP: prev.totalXP + xpGain,
        actionCounts: {
          ...prev.actionCounts,
          [actionId]: (prev.actionCounts[actionId] ?? 0) + 1,
        },
      };
      saveXP(next);
      return next;
    });

    return xpGain;
  }, [cooldowns]);

  /** Remove XP (for debug/reset) */
  const resetXP = useCallback(() => {
    const reset: XPStorage = { totalXP: 0, actionCounts: {} };
    saveXP(reset);
    setXpData(reset);
    setCooldowns({});
    saveCooldowns({});
  }, []);

  /** Directly set XP (for migration/import) */
  const setTotalXP = useCallback((xp: number) => {
    const next: XPStorage = { totalXP: Math.max(0, xp), actionCounts: xpData.actionCounts };
    saveXP(next);
    setXpData(next);
  }, [xpData.actionCounts]);

  const isCoolingDown = useCallback((actionId: string): boolean => {
    const action = XP_ACTIONS.find(a => a.id === actionId);
    if (!action?.cooldownMs) return false;
    return Date.now() - (cooldowns[actionId] ?? 0) < action.cooldownMs;
  }, [cooldowns]);

  const actionCount = useCallback((actionId: string) => xpData.actionCounts[actionId] ?? 0, [xpData.actionCounts]);

  // Expose a ticker so UI can refresh cooldown displays
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  return {
    totalXP,
    currentLevel,
    nextLevel,
    progressPct,
    xpToNext,
    earnXP,
    resetXP,
    setTotalXP,
    isCoolingDown,
    actionCount,
    tick,
  };
}
