import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Lightbulb,
  Check,
  RotateCcw,
  GraduationCap,
  Play,
  Square
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { learningService, LessonContent } from '../../../services/learningService';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  stageTitle: string;
  isCompleted: boolean;
  onToggleCompleted: (id: string, isCompleted: boolean) => void;
  onOpenTutorChat?: (prompt: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  courseTitle,
  stageTitle,
  isCompleted,
  onToggleCompleted,
  onOpenTutorChat,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'content' | 'examples' | 'quiz'>('content');
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioText, setCurrentAudioText] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [playingItemKey, setPlayingItemKey] = useState<string | null>(null);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && lessonTitle) {
      loadLessonContent();
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setActiveTab('content');
    } else {
      stopAudio();
    }
  }, [isOpen, lessonId, lessonTitle]);

  const loadLessonContent = async (forceRefresh = false) => {
    setIsLoading(true);
    stopAudio();
    try {
      const data = await learningService.generateLessonContent({
        lessonId,
        lessonTitle,
        courseTitle,
        stageTitle,
        forceRefresh,
      });
      setLesson(data);
    } catch {
      showToast('Erro ao carregar o conteúdo da aula.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setPlayingItemKey(null);
  };

  const cleanTextForSpeech = (rawText: string): string => {
    return rawText
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speakText = (text: string, preferredLang?: string, itemKey?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Síntese de voz não suportada neste dispositivo.', 'error');
      return;
    }

    stopAudio();

    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);

    // Language Detection
    const lowerCourse = (courseTitle + ' ' + lessonTitle).toLowerCase();
    const isEnglishCourse = lowerCourse.includes('ingl') || lowerCourse.includes('english');

    if (preferredLang) {
      utterance.lang = preferredLang;
    } else if (isEnglishCourse) {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'pt-PT';
    }

    utterance.rate = speechRate;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setPlayingItemKey(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setPlayingItemKey(null);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    setCurrentAudioText(clean);
    if (itemKey) setPlayingItemKey(itemKey);
  };

  const handlePlayFullLesson = () => {
    if (!lesson) return;
    if (isPlayingAudio && playingItemKey === 'full') {
      stopAudio();
      return;
    }

    const keyPointsText = lesson.keyPoints?.length
      ? `Pontos essenciais da matéria: ${lesson.keyPoints.join('. ')}.`
      : '';

    const examplesText = lesson.examples?.length
      ? `Exemplos práticos: ${lesson.examples.map((e, idx) => `Exemplo ${idx + 1}: ${e.concept}. ${e.explanation}.`).join(' ')}`
      : '';

    const fullScript = `Aula sobre ${lesson.title}. ${lesson.summary}. ${cleanTextForSpeech(lesson.explanation)}. ${keyPointsText} ${examplesText}`;
    speakText(fullScript, undefined, 'full');
    showToast('A reproduzir a narração completa da aula...', 'info');
  };

  const handlePlaySummary = () => {
    if (!lesson) return;
    if (isPlayingAudio && playingItemKey === 'summary') {
      stopAudio();
      return;
    }
    const summaryScript = lesson.audioSummary || lesson.summary || lesson.title;
    speakText(summaryScript, undefined, 'summary');
    showToast('A reproduzir o resumo da aula...', 'info');
  };

  const handlePlayExample = (idx: number, example: { concept: string; explanation: string; practicalTip?: string }) => {
    const key = `example-${idx}`;
    if (isPlayingAudio && playingItemKey === key) {
      stopAudio();
      return;
    }

    // If English course, speak the example phrase
    const lower = (courseTitle + ' ' + lessonTitle).toLowerCase();
    const isEnglish = lower.includes('ingl') || lower.includes('english');
    const textToSpeak = `${example.concept}. ${example.explanation}. ${example.practicalTip || ''}`;
    speakText(textToSpeak, isEnglish ? 'en-US' : 'pt-PT', key);
  };

  const handlePlayQuiz = () => {
    if (!lesson?.quiz) return;
    if (isPlayingAudio && playingItemKey === 'quiz') {
      stopAudio();
      return;
    }

    const optionsText = lesson.quiz.options.map((opt, i) => `Opção ${String.fromCharCode(65 + i)}: ${opt}`).join('. ');
    const quizScript = `Pergunta de teste: ${lesson.quiz.question}. ${optionsText}`;
    speakText(quizScript, 'pt-PT', 'quiz');
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    if (lesson && index === lesson.quiz.correctIndex) {
      showToast('🎉 Resposta Correta! Excelente trabalho.', 'success');
    } else {
      showToast('Resposta Incorreta. Reveja a explicação e tente novamente.', 'info');
    }
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  const handleCompleteAndClose = () => {
    if (!isCompleted) {
      onToggleCompleted(lessonId, false);
      showToast('Aula concluída com sucesso! Progresso atualizado.', 'success');
    }
    stopAudio();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { stopAudio(); onClose(); }} title="" size="xl">
      <div className="space-y-4 max-h-[84vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" size="sm" className="font-bold truncate max-w-[200px]">
                {courseTitle}
              </Badge>
              <span className="text-xs text-slate-400 font-medium truncate max-w-[220px]">
                {stageTitle}
              </span>
              {isCompleted && (
                <Badge variant="success" size="sm" className="flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Concluída</span>
                </Badge>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {lessonTitle}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => loadLessonContent(true)}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Regenerar aula com IA"
            >
              <RotateCcw size={15} className={isLoading ? 'animate-spin text-indigo-500' : ''} />
              <span className="hidden sm:inline text-xs font-semibold">Regenerar</span>
            </button>
            <button
              type="button"
              onClick={() => { stopAudio(); onClose(); }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 🎧 CENTRAL DE ÁUDIO & VOZ MULTI-FORMATO */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white shadow-lg space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                isPlayingAudio ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-indigo-600 text-white'
              }`}>
                {isPlayingAudio ? <Volume2 size={18} /> : <GraduationCap size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs sm:text-sm text-white">
                    {isPlayingAudio ? '🎧 A Narrar em Áudio...' : '🎙️ Estudo por Áudio & Voz'}
                  </span>
                  {isPlayingAudio && (
                    <span className="flex items-center gap-1 text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30 animate-pulse">
                      Voz Ativa ({speechRate}x)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  {isPlayingAudio
                    ? (playingItemKey === 'full' ? 'A reproduzir aula completa com exemplos' : 'A reproduzir narração')
                    : 'Ouça a aula completa, resumos e pronúncias de cada exemplo.'}
                </p>
              </div>
            </div>

            {/* Controlos de Reprodução */}
            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              {/* Seletor de Velocidade */}
              <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/80 text-[11px] font-bold">
                {[0.75, 1.0, 1.25].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setSpeechRate(rate);
                      if (isPlayingAudio) {
                        speakText(currentAudioText);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      speechRate === rate ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title={rate === 0.75 ? 'Velocidade Lenta (Ideal para fonética)' : rate === 1.0 ? 'Velocidade Normal' : 'Velocidade Rápida'}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Botão Resumo */}
              <button
                type="button"
                onClick={handlePlaySummary}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700/80 flex items-center gap-1.5 cursor-pointer"
                title="Ouvir Resumo de 1 Minuto"
              >
                <Volume2 size={13} className="text-indigo-400" />
                <span>Resumo</span>
              </button>

              {/* Botão Aula Completa */}
              <Button
                type="button"
                onClick={handlePlayFullLesson}
                variant={isPlayingAudio && playingItemKey === 'full' ? 'danger' : 'primary'}
                size="sm"
                leftIcon={isPlayingAudio && playingItemKey === 'full' ? <Square size={13} /> : <Play size={13} className="fill-current" />}
                className="text-xs font-extrabold shadow-md"
              >
                {isPlayingAudio && playingItemKey === 'full' ? 'Parar Áudio' : 'Ouvir Aula Completa'}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen size={14} />
            <span>📖 Teoria & Aula</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'examples'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Lightbulb size={14} />
            <span>💡 Exemplos Práticos ({lesson?.examples?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle size={14} />
            <span>🧠 Mini-Quiz de Fixação</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-[300px] custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Sparkles size={28} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                A gerar conteúdo completo e áudio com IA...
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                A estruturar a teoria, regras práticas, exemplos falados e exercícios interativos para "{lessonTitle}".
              </p>
            </div>
          ) : !lesson ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Não foi possível carregar a aula. Clique em Regenerar.
            </div>
          ) : (
            <>
              {/* TAB 1: CONTEÚDO & TEORIA */}
              {activeTab === 'content' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Resumo em Destaque com Botão de Áudio */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start justify-between gap-3">
                    <p className="text-xs text-indigo-950 dark:text-indigo-200 font-semibold leading-relaxed flex-1">
                      💡 <strong>Objetivo Rápido:</strong> {lesson.summary}
                    </p>
                    <button
                      type="button"
                      onClick={() => speakText(lesson.summary, undefined, 'summary-box')}
                      className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition-colors shrink-0 cursor-pointer"
                      title="Ouvir este resumo"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>

                  {/* Pontos Chave */}
                  {lesson.keyPoints && lesson.keyPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Pontos Chave da Matéria:
                        </span>
                        <button
                          type="button"
                          onClick={() => speakText(`Pontos chave: ${lesson.keyPoints.join('. ')}`, undefined, 'keypoints')}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 size={12} />
                          <span>Ouvir Pontos Chave</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {lesson.keyPoints.map((point, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2"
                          >
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explicação Detalhada */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Explicação Teórica Completa
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(lesson.explanation, undefined, 'explanation')}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Volume2 size={13} />
                        <span>Ouvir Teoria</span>
                      </button>
                    </div>

                    <div className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line pt-1">
                      {lesson.explanation}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXEMPLOS PRÁTICOS COM ÁUDIO INDIVIDUAL */}
              {activeTab === 'examples' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                    <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                      🔊 Clique no botão de áudio em cada exemplo para ouvir a pronúncia e entoação correta.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!lesson.examples?.length) return;
                        const allEx = lesson.examples.map((e, idx) => `Exemplo ${idx + 1}: ${e.concept}. ${e.explanation}.`).join(' ');
                        speakText(allEx, undefined, 'all-examples');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Volume2 size={12} />
                      <span>Ouvir Todos</span>
                    </button>
                  </div>

                  {lesson.examples && lesson.examples.length > 0 ? (
                    lesson.examples.map((ex, idx) => {
                      const isItemPlaying = isPlayingAudio && playingItemKey === `example-${idx}`;
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition-all space-y-2 shadow-xs ${
                            isItemPlaying
                              ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/30'
                              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-extrabold">
                                Exemplo #{idx + 1}
                              </span>
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {ex.concept}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => handlePlayExample(idx, ex)}
                              className={`p-1.5 px-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                isItemPlaying
                                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm animate-pulse'
                                  : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                              }`}
                              title="Ouvir pronúncia deste exemplo"
                            >
                              <Volume2 size={13} />
                              <span>{isItemPlaying ? 'A Ouvir...' : 'Ouvir'}</span>
                            </button>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            {ex.explanation}
                          </p>

                          {ex.practicalTip && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                              <span>💡 Dica Prática:</span>
                              <span>{ex.practicalTip}</span>
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-8">
                      Sem exemplos adicionais registados para esta aula.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 3: QUIZ INTERATIVO COM ÁUDIO */}
              {activeTab === 'quiz' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Pergunta de Fixação Rápida
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                          {lesson.quiz.question}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={handlePlayQuiz}
                        className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Ouvir pergunta e opções do Quiz"
                      >
                        <Volume2 size={14} />
                        <span className="hidden sm:inline">Ouvir Pergunta</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {lesson.quiz.options.map((option, idx) => {
                        const isCorrect = idx === lesson.quiz.correctIndex;
                        const isSelected = selectedOption === idx;

                        let buttonStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200';
                        if (isAnswerSubmitted) {
                          if (isCorrect) {
                            buttonStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-bold';
                          } else if (isSelected) {
                            buttonStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 line-through';
                          }
                        }

                        return (
                          <div key={idx} className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectOption(idx)}
                              disabled={isAnswerSubmitted}
                              className={`w-full text-left p-3 rounded-xl border transition-all text-xs sm:text-sm flex items-center justify-between gap-3 cursor-pointer ${buttonStyle}`}
                            >
                              <span className="flex-1">
                                <strong className="mr-2 text-indigo-600 dark:text-indigo-400">
                                  {String.fromCharCode(65 + idx)})
                                </strong>
                                {option}
                              </span>
                              {isAnswerSubmitted && isCorrect && (
                                <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => speakText(`Opção ${String.fromCharCode(65 + idx)}: ${option}`, 'pt-PT', `quiz-opt-${idx}`)}
                              className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                              title="Ouvir esta opção"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {isAnswerSubmitted && (
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            <strong>Explicação:</strong> {lesson.quiz.explanation}
                          </p>
                          <button
                            type="button"
                            onClick={() => speakText(`Explicação: ${lesson.quiz.explanation}`, 'pt-PT', 'quiz-expl')}
                            className="p-1 text-indigo-600 hover:text-indigo-500 cursor-pointer"
                            title="Ouvir explicação"
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleResetQuiz}
                          className="text-xs"
                        >
                          Tentar Novamente
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          {onOpenTutorChat && lesson && (
            <button
              type="button"
              onClick={() => {
                stopAudio();
                onClose();
                onOpenTutorChat(lesson.tutorPrompt || `Gostaria de aprofundar a aula: ${lessonTitle}`);
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Tirar Dúvidas com o Mentor no Chat</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { stopAudio(); onClose(); }}
              className="text-xs"
            >
              Fechar
            </Button>
            <Button
              type="button"
              variant={isCompleted ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleCompleteAndClose}
              leftIcon={<CheckCircle2 size={15} />}
              className="text-xs font-bold"
            >
              {isCompleted ? 'Fechar (Aula Concluída)' : 'Marcar Aula como Concluída'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
