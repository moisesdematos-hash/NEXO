import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, AlertCircle, RefreshCw, CheckCircle2, Trash2, Mic, MicOff, Volume2, VolumeX, Headphones, Paperclip, FileText, Brain, Check, Sparkles } from 'lucide-react';
import { aiService, AIMessage } from '../../services/aiService';
import { aiToolExecutor } from '../../services/aiToolExecutor';
import { tasksService } from '../../services/tasksService';
import { eventsService } from '../../services/eventsService';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { processFileAttachment, AIAttachment } from '../../utils/fileAttachmentHelper';
import { aiMemoryService, AIMemoryItem } from '../../services/aiMemoryService';
import { useToast } from '../../components/ui/Toast';

const INITIAL_WELCOME: AIMessage = {
  id: 'welcome',
  sender: 'assistant',
  content: 'Olá! Sou o assistente NEXO. Como posso ajudar com as tuas tarefas, agenda, listas ou metas hoje?',
  timestamp: new Date().toISOString(),
};

const SLASH_COMMANDS = [
  { cmd: '/tarefa', desc: 'Criar uma nova tarefa', prompt: 'Cria uma tarefa para ' },
  { cmd: '/evento', desc: 'Agendar compromisso na agenda', prompt: 'Agenda um compromisso para ' },
  { cmd: '/meta', desc: 'Definir novo objetivo ou meta', prompt: 'Cria uma meta para ' },
  { cmd: '/curso', desc: 'Gerar curso na aba Aprender', prompt: 'Cria um curso completo sobre ' },
  { cmd: '/dia', desc: 'Organizar o dia (Piloto Automático)', prompt: 'Organiza o meu dia de hoje com tarefas e compromissos' },
  { cmd: '/semana', desc: 'Planear a semana toda', prompt: 'Planear a minha semana toda com tarefas, agenda e metas' },
  { cmd: '/memoria', desc: 'Abrir perfil e memória da IA', action: 'memoria' },
  { cmd: '/voz', desc: 'Ativar modo chamada hands-free', action: 'voz' },
  { cmd: '/limpar', desc: 'Apagar histórico do chat', action: 'limpar' },
];

const QUICK_COMMAND_CHIPS = [
  { label: '⚡ Organizar Dia', text: 'Organiza o meu dia de hoje com tarefas e compromissos', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  { label: '📅 Planear Semana', text: 'Planear a minha semana toda com tarefas, agenda e metas', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  { label: '🎓 Curso de IA', text: 'Cria um curso completo de Inteligência Artificial do zero ao avançado na aba Aprender', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { label: '🎯 Metas do Mês', text: 'Cria 3 metas estratégicas para este mês', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
  { label: '📝 Lista de Compras', text: 'Cria uma lista de compras para a semana com itens essenciais', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  { label: '🧠 Ver Memória', action: 'memoria', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200' },
  { label: '🎧 Modo Chamada', action: 'voz', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200' },
  { label: '📊 Resumo do Dia', text: 'Faz um resumo das minhas tarefas pendentes e em atraso', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { label: '💡 Dicas de Foco', text: 'Dá-me 3 técnicas práticas para manter o foco e aumentar a produtividade hoje', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300' },
];

export const AIChatDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(
            (m: AIMessage) => !m.id.startsWith('err-') && !m.content.includes('Não consegui responder')
          );
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    return [INITIAL_WELCOME];
  });

  const { showToast } = useToast();
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [statusState, setStatusState] = useState<'idle' | 'thinking' | 'executing' | 'error'>('idle');
  
  // --- VOICE INPUT & OUTPUT STATES ---
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const isHandsFreeModeRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const isProcessingHandsFreeRef = useRef(false);

  // --- MULTIMODAL ATTACHMENT STATES ---
  const [pendingAttachments, setPendingAttachments] = useState<AIAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      try {
        const att = await processFileAttachment(files[i]);
        setPendingAttachments((prev) => [...prev, att]);
      } catch (err) {
        console.warn('[File attachment error]', err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // --- LONG-TERM MEMORY MODAL STATE ---
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [userMemories, setUserMemories] = useState<AIMemoryItem[]>([]);
  const [newMemoryKey, setNewMemoryKey] = useState('');
  const [newMemoryVal, setNewMemoryVal] = useState('');

  const refreshMemories = () => {
    setUserMemories(aiMemoryService.getMemories());
  };

  useEffect(() => {
    if (showMemoryModal) {
      refreshMemories();
    }
  }, [showMemoryModal]);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey.trim() || !newMemoryVal.trim()) return;
    aiMemoryService.saveMemory({
      category: 'preference',
      key: newMemoryKey.trim(),
      value: newMemoryVal.trim(),
    });
    setNewMemoryKey('');
    setNewMemoryVal('');
    refreshMemories();
  };

  const handleDeleteMemory = (id: string) => {
    aiMemoryService.deleteMemory(id);
    refreshMemories();
  };

  // --- PROACTIVE PRODUCTIVITY INSIGHT STATE ---
  const [proactiveInsight, setProactiveInsight] = useState<{
    overdueCount: number;
    todayCount: number;
    upcomingEventTitle?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkProactiveInsights();
    }
  }, [isOpen]);

  const checkProactiveInsights = async () => {
    try {
      const tasks = await tasksService.getTasks().catch(() => []);
      const events = await eventsService.getEvents().catch(() => []);
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const pending = tasks.filter((t) => t.status !== 'completed');
      const overdue = pending.filter((t) => t.due_date && new Date(t.due_date) < startOfDay);
      const today = pending.filter((t) => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        return d >= startOfDay && d <= endOfDay;
      });

      const upcomingEvents = events.filter((e) => new Date(e.start_time) >= now);

      if (overdue.length > 0 || today.length > 0 || upcomingEvents.length > 0) {
        setProactiveInsight({
          overdueCount: overdue.length,
          todayCount: today.length,
          upcomingEventTitle: upcomingEvents[0]?.title,
        });
      }
    } catch (err) {
      console.warn('[Proactive Check Warning]', err);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOnline } = useNetworkStatus();

  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const [audioVolumeLevel, setAudioVolumeLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startAudioMeter = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!isListeningRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioVolumeLevel(Math.min(100, Math.round((average / 128) * 100)));
            if (isListeningRef.current) {
              requestAnimationFrame(updateVolume);
            }
          };
          updateVolume();
        }
      }
    } catch (err: any) {
      console.warn('[Microphone Access Warning]', err);
    }
  };

  const stopAudioMeter = () => {
    setAudioVolumeLevel(0);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => null);
      audioContextRef.current = null;
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;

        const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'pt-PT';
        rec.lang = browserLang && browserLang.startsWith('pt') ? browserLang : 'pt-PT';

        rec.onspeechstart = () => {
          setIsSpeechDetected(true);
        };

        rec.onspeechend = () => {
          setIsSpeechDetected(false);
        };

        rec.onresult = (event: any) => {
          setIsSpeechDetected(true);
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          const trimmed = currentTranscript.trim();
          if (trimmed) {
            setInputText(trimmed);

            if (isHandsFreeModeRef.current && !isProcessingHandsFreeRef.current) {
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (isHandsFreeModeRef.current && !isProcessingHandsFreeRef.current) {
                  isProcessingHandsFreeRef.current = true;
                  try {
                    if (recognitionRef.current) recognitionRef.current.stop();
                  } catch (e) {}
                  const formElement = document.getElementById('nexo-ai-chat-form') as HTMLFormElement;
                  if (formElement) {
                    formElement.requestSubmit();
                  }
                }
              }, 1600);
            }
          }
        };

        rec.onerror = (err: any) => {
          console.warn('[Speech Recognition Error]', err?.error);
          setIsSpeechDetected(false);
          if (err?.error === 'not-allowed' || err?.error === 'service-not-allowed') {
            isListeningRef.current = false;
            setIsListening(false);
            setIsHandsFreeMode(false);
            stopAudioMeter();
            showToast('Permissão de microfone negada. Permite o acesso ao microfone nas definições do navegador.', 'error');
          }
        };

        rec.onend = () => {
          setIsSpeechDetected(false);
          if (isListeningRef.current && !isProcessingHandsFreeRef.current) {
            setTimeout(() => {
              if (isListeningRef.current && recognitionRef.current && !isProcessingHandsFreeRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  // Ignore if already running
                }
              }
            }, 300);
          } else if (!isListeningRef.current) {
            setIsListening(false);
            stopAudioMeter();
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const resumeListeningAfterSpeech = async () => {
    isProcessingHandsFreeRef.current = false;
    if (!isHandsFreeModeRef.current) return;

    isListeningRef.current = true;
    setIsListening(true);
    await startAudioMeter();
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (e) {}
  };

  const toggleListening = async () => {
    const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SpeechRecognition && !recognitionRef.current) {
      showToast('O teu navegador não suporta reconhecimento de voz nativo (Web Speech API).', 'info');
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      stopAudioMeter();
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {}
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      await startAudioMeter();
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (e) {
        console.warn('[Speech Start Error]', e);
      }
    }
  };

  const toggleHandsFreeMode = async () => {
    const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SpeechRecognition && !recognitionRef.current) {
      showToast('O teu navegador não suporta reconhecimento de voz nativo (Web Speech API).', 'info');
      return;
    }

    const nextState = !isHandsFreeMode;
    setIsHandsFreeMode(nextState);
    isHandsFreeModeRef.current = nextState;

    if (nextState) {
      setIsVoiceOutputEnabled(true);
      if (!isListeningRef.current) {
        await resumeListeningAfterSpeech();
      }
    } else {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      isProcessingHandsFreeRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);
      stopAudioMeter();
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (currentlySpeakingId === msgId) {
      setCurrentlySpeakingId(null);
      return;
    }

    const cleanText = text.replace(/[\*\_~#`>\-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT';
    utterance.rate = 1.0;

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
      if (isHandsFreeModeRef.current) {
        setTimeout(() => {
          resumeListeningAfterSpeech();
        }, 400);
      }
    };
    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
      if (isHandsFreeModeRef.current) {
        resumeListeningAfterSpeech();
      }
    };

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Save messages to LocalStorage for persistence/memory (excluding error items)
  useEffect(() => {
    try {
      const cleanMessages = messages.filter(
        (m) => !m.id.startsWith('err-') && !m.content.includes('Não consegui responder')
      );
      localStorage.setItem('nexo_ai_chat_history', JSON.stringify(cleanMessages));
    } catch (e) {
      // Ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statusState]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClearChat = () => {
    if (window.confirm('Tens a certeza de que queres apagar o histórico de conversa?')) {
      setMessages([INITIAL_WELCOME]);
      localStorage.removeItem('nexo_ai_chat_history');
      setConversationId(undefined);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && pendingAttachments.length === 0) || statusState !== 'idle') return;

    if (!isOnline) {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          content: inputText.trim() || '[Ficheiro Anexado]',
          timestamp: new Date().toISOString(),
        },
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: 'A IA precisa de ligação à internet para responder.',
          timestamp: new Date().toISOString(),
        },
      ]);
      setInputText('');
      setPendingAttachments([]);
      return;
    }

    const textToSend = inputText.trim();
    const currentAttachments = [...pendingAttachments];
    setInputText('');
    setPendingAttachments([]);

    let fullPrompt = textToSend;
    if (currentAttachments.length > 0) {
      const attText = currentAttachments
        .map((att) => `📎 [Ficheiro: ${att.name}]\n${att.content || ''}`)
        .join('\n\n');
      fullPrompt = textToSend 
        ? `${textToSend}\n\n[CONTEÚDO DOS ANEXOS]:\n${attText}`
        : `Analisa o conteúdo do(s) seguinte(s) ficheiro(s) em anexo:\n\n${attText}`;
    }

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: textToSend || `[Enviado ${currentAttachments.length} ficheiro(s) em anexo]`,
      timestamp: new Date().toISOString(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setStatusState('thinking');

    try {
      let convId = conversationId;
      if (!convId) {
        const conv = await aiService.createConversation().catch(() => undefined);
        if (conv) {
          convId = conv.id;
          setConversationId(conv.id);
        }
      }

      const { replyMessage } = await aiService.sendMessage(convId || '', fullPrompt, updatedMessages);
      setMessages((prev) => [...prev, replyMessage]);
      setStatusState('idle');
      if (isVoiceOutputEnabled && replyMessage.content) {
        speakText(replyMessage.content, replyMessage.id);
      }
    } catch (err: any) {
      setStatusState('error');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'Não consegui responder agora. Tenta novamente.',
          timestamp: new Date().toISOString(),
        },
      ]);
      setTimeout(() => setStatusState('idle'), 3000);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir Assistente NEXO IA"
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center gap-2 font-semibold transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 cursor-pointer"
        >
          <Bot size={24} />
          <span className="hidden sm:inline">Assistente NEXO</span>
        </button>
      )}

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer / Floating Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Assistente Virtual NEXO"
          aria-modal="true"
          className="fixed bottom-0 right-0 w-full sm:w-[400px] h-[85vh] sm:h-[600px] sm:bottom-6 sm:right-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up"
        >
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">Assistente NEXO</h3>
                <span className="text-[11px] text-slate-400">Inteligência Pessoal</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowMemoryModal(true)}
                aria-label="Abrir Memória de Longo Prazo da IA"
                title="Memória de Longo Prazo e Perfil do Utilizador"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  showMemoryModal ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Brain size={18} />
              </button>
              <button
                onClick={toggleHandsFreeMode}
                aria-label={isHandsFreeMode ? 'Desativar Modo Chamada Hands-Free' : 'Ativar Modo Chamada Hands-Free'}
                title={isHandsFreeMode ? 'Modo Chamada Hands-Free Ativo' : 'Ativar Modo Chamada (Hands-Free)'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isHandsFreeMode ? 'bg-indigo-600 text-white animate-pulse' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Headphones size={18} />
              </button>
              <button
                onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
                aria-label={isVoiceOutputEnabled ? 'Desativar voz automática' : 'Ativar voz automática'}
                title={isVoiceOutputEnabled ? 'Voz Automática Activada' : 'Ativar Voz Automática'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isVoiceOutputEnabled ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {isVoiceOutputEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={handleClearChat}
                aria-label="Apagar conversa e memória do chat"
                title="Apagar conversa"
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar assistente"
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Hands-Free Mode Banner */}
          {isHandsFreeMode && (
            <div className="bg-indigo-600 text-white px-3 py-1.5 text-xs flex items-center justify-between font-medium shadow-inner animate-pulse">
              <div className="flex items-center gap-1.5">
                <Headphones size={14} />
                <span>Modo Chamada Hands-Free Ativo</span>
              </div>
              <span className="text-[10px] opacity-90">Fale a qualquer momento • Envio automático</span>
            </div>
          )}

          {/* Offline Warning Banner inside Chat */}
          {!isOnline && (
            <div className="bg-amber-500/10 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs flex items-center gap-2 border-b border-amber-500/20">
              <AlertCircle size={14} className="shrink-0" />
              <span>A IA requer ligação à internet.</span>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Proactive AI Insight Banner */}
            {proactiveInsight && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-slate-800 dark:text-slate-100 text-xs space-y-2 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between font-bold text-indigo-700 dark:text-indigo-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-500 animate-pulse" />
                    Insight Proativo NEXO
                  </span>
                  <button onClick={() => setProactiveInsight(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5">
                    <X size={14} />
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {proactiveInsight.overdueCount > 0 && `⚠️ Tens ${proactiveInsight.overdueCount} tarefa(s) em atraso. `}
                  {proactiveInsight.todayCount > 0 && `📋 ${proactiveInsight.todayCount} tarefa(s) para hoje. `}
                  {proactiveInsight.upcomingEventTitle && `📅 Próximo evento: "${proactiveInsight.upcomingEventTitle}".`}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('Organiza o meu dia de hoje com base nas minhas tarefas pendentes e agenda');
                      setProactiveInsight(null);
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] cursor-pointer transition-colors shadow-xs"
                  >
                    ⚡ Organizar Dia Agora
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  {msg.actionResult && (
                    <div className="mb-3 p-3 rounded-xl bg-slate-900/90 text-white dark:bg-slate-950/90 border border-indigo-500/30 shadow-md text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-[12px] text-emerald-400">
                        <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                        <span>{msg.actionResult.result_message}</span>
                      </div>

                      {msg.actionResult.data && (
                        <div className="pt-2 border-t border-slate-700/80 space-y-1.5">
                          {msg.actionResult.data.title && (
                            <div className="flex items-center justify-between font-semibold text-xs text-white">
                              <span className="truncate">📌 {msg.actionResult.data.title}</span>
                              {msg.actionResult.data.priority && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                                  {msg.actionResult.data.priority}
                                </span>
                              )}
                            </div>
                          )}

                          {msg.actionResult.data.due_date && (
                            <p className="text-[10px] text-slate-300">
                              📅 Limite: {new Date(msg.actionResult.data.due_date).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}

                          {msg.actionResult.data.start_time && (
                            <p className="text-[10px] text-slate-300">
                              🕒 Início: {new Date(msg.actionResult.data.start_time).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}

                          {/* Interactive Actions per Tool Type */}
                          {msg.actionResult.action_type === 'create_task' && msg.actionResult.data?.id && (
                            <button
                              type="button"
                              onClick={async () => {
                                await aiToolExecutor.executeTool('complete_task', { task_id: msg.actionResult!.data.id });
                                showToast('Tarefa concluída com sucesso!', 'success');
                              }}
                              className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Check size={14} />
                              <span>Concluir Tarefa Agora</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Message Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 space-y-1.5">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="p-2 rounded-lg bg-black/10 dark:bg-white/10 text-xs flex items-center gap-2 overflow-hidden border border-white/10">
                          {att.type === 'image' && att.dataUrl ? (
                            <img src={att.dataUrl} alt={att.name} className="w-10 h-10 object-cover rounded-md border border-white/20 shrink-0" />
                          ) : (
                            <FileText size={18} className="shrink-0 text-indigo-200" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-[11px]">{att.name}</p>
                            <p className="text-[10px] opacity-75">{Math.round(att.size / 1024)} KB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => speakText(msg.content, msg.id)}
                      title="Ouvir mensagem"
                      className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 cursor-pointer"
                    >
                      <Volume2 size={12} className={currentlySpeakingId === msg.id ? 'animate-pulse text-emerald-500' : ''} />
                      <span>{currentlySpeakingId === msg.id ? 'A falar...' : 'Ouvir'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {statusState === 'thinking' && (
              <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                <RefreshCw size={14} className="animate-spin text-indigo-600" />
                <span>NEXO a pensar...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Letreiro TV em Movimento (Quick Action Ticker Marquee) */}
          <div className="py-2 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden relative group">
            <div className="flex items-center gap-2 animate-marquee-tv">
              {[...QUICK_COMMAND_CHIPS, ...QUICK_COMMAND_CHIPS].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={statusState !== 'idle'}
                  onClick={() => {
                    if (chip.action === 'memoria') {
                      setShowMemoryModal(true);
                    } else if (chip.action === 'voz') {
                      toggleHandsFreeMode();
                    } else if (chip.text) {
                      setInputText(chip.text);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold ${chip.color} hover:scale-105 transition-all shrink-0 cursor-pointer shadow-xs border border-black/5 dark:border-white/5`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Mic Volume Level Meter when listening */}
          {isListening && (
            <div className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="font-medium text-[11px]">
                  {isSpeechDetected ? '🎙️ Voz detetada! A transcrever...' : '🎙️ A escutar... Fale para o microfone'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Mic:</span>
                <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex items-center">
                  <div
                    className="h-full rounded-full transition-all duration-75 bg-rose-500"
                    style={{ width: `${Math.max(8, audioVolumeLevel)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pending Attachment Chips Bar */}
          {pendingAttachments.length > 0 && (
            <div className="px-3 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border-t border-indigo-200 dark:border-indigo-900/50 flex items-center gap-2 overflow-x-auto">
              {pendingAttachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium shrink-0 shadow-xs">
                  {att.type === 'image' && att.dataUrl ? (
                    <img src={att.dataUrl} alt={att.name} className="w-4 h-4 object-cover rounded" />
                  ) : (
                    <FileText size={14} />
                  )}
                  <span className="max-w-[120px] truncate">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(idx)}
                    className="hover:text-rose-200 cursor-pointer ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Slash Commands Auto-Complete Popover */}
          {inputText.startsWith('/') && (
            <div className="px-2 py-2 bg-slate-900 text-white border-t border-slate-700 shadow-xl animate-slide-up">
              <div className="text-[10px] font-bold text-indigo-400 px-2 py-0.5 uppercase tracking-wider">⚡ Comandos Rápidos (Slash Commands)</div>
              <div className="max-h-40 overflow-y-auto space-y-0.5 mt-1">
                {SLASH_COMMANDS.filter((c) => c.cmd.startsWith(inputText.toLowerCase().trim())).map((item) => (
                  <button
                    key={item.cmd}
                    type="button"
                    onClick={() => {
                      if (item.action === 'memoria') {
                        setShowMemoryModal(true);
                        setInputText('');
                      } else if (item.action === 'voz') {
                        toggleHandsFreeMode();
                        setInputText('');
                      } else if (item.action === 'limpar') {
                        handleClearChat();
                        setInputText('');
                      } else if (item.prompt) {
                        setInputText(item.prompt);
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-indigo-600/60 flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-indigo-300">{item.cmd}</span>
                    <span className="text-[11px] text-slate-300">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form id="nexo-ai-chat-form" onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isOnline || statusState !== 'idle'}
              title="Anexar Imagem, PDF ou Documento de Texto"
              aria-label="Anexar ficheiro"
              className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Paperclip size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.txt,.csv,.json,.md"
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={toggleListening}
              disabled={!isOnline || statusState !== 'idle'}
              title={isListening ? 'A escutar... Clica para parar' : 'Falar por voz'}
              aria-label="Falar por voz"
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg ring-2 ring-rose-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                pendingAttachments.length > 0
                  ? `📎 ${pendingAttachments.length} anexo(s) pronto(s). Adicione uma mensagem ou envie...`
                  : isSpeechDetected
                  ? '🎙️ Voz detetada! A transcrever...'
                  : isListening
                  ? '🎙️ A escutar... Fale agora para o microfone'
                  : isOnline
                  ? 'Pergunta ou pede algo ao NEXO...'
                  : 'Sem ligação à internet'
              }
              disabled={!isOnline || statusState !== 'idle'}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-slate-900 dark:text-white"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && pendingAttachments.length === 0) || !isOnline || statusState !== 'idle'}
              aria-label="Enviar mensagem para IA"
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Long-Term Memory Manager Modal */}
      {showMemoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 overflow-hidden flex flex-col max-h-[85vh] animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600/10 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Memória de Longo Prazo</h3>
                  <p className="text-[11px] text-slate-500">Perfil e factos que o NEXO recorda sobre ti</p>
                </div>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1">
              {userMemories.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Nenhuma preferência guardada na memória.</p>
              ) : (
                userMemories.map((mem) => (
                  <div key={mem.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase">
                        {mem.category}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{mem.key}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{mem.value}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      title="Eliminar memória"
                      className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddMemory} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome (ex: Preferência)"
                  value={newMemoryKey}
                  onChange={(e) => setNewMemoryKey(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Valor (ex: Prefiro resumos)"
                  value={newMemoryVal}
                  onChange={(e) => setNewMemoryVal(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={!newMemoryKey.trim() || !newMemoryVal.trim()}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                + Adicionar Memória
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
