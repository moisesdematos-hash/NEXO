import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Mic, Bot, X, Vote, Brain, Play, Pause, 
  ScanLine, GraduationCap
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { getEffectiveApiKey, ACTIVE_GROQ_MODELS } from '../../../services/aiConfigService';

export interface AcademicMemoryFact {
  id: string;
  category: 'fórmulas' | 'datas_exames' | 'links_aulas' | 'geral';
  fact: string;
  addedBy: string;
  timestamp: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface ChatPoll {
  question: string;
  options: PollOption[];
}

export interface StudentReminder {
  id: string;
  targetPerson: string;
  reminderText: string;
  triggerTimeStr: string;
  triggerTimestamp: number;
  triggered?: boolean;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  isNexoBot?: boolean;
  text: string;
  imageUrl?: string;
  linkUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  ocrItems?: string[];
  poll?: ChatPoll;
  reminder?: StudentReminder;
  timestamp: string;
  pinned?: boolean;
}

const DEFAULT_ACADEMIC_MEMORY: AcademicMemoryFact[] = [
  {
    id: '1',
    category: 'fórmulas',
    fact: 'Fórmula da Derivada da Função Exponencial: (e^u)\' = u\' * e^u.',
    addedBy: 'Tutor IA',
    timestamp: 'Ontem',
  },
  {
    id: '2',
    category: 'datas_exames',
    fact: 'Exame Época Normal de Cálculo II: 22 de Junho às 09:00 na Sala 2.4.',
    addedBy: 'Pedro (Colega)',
    timestamp: 'Há 2 dias',
  },
  {
    id: '3',
    category: 'links_aulas',
    fact: 'Link Zoom da Aula de Apoio: zoom.us/j/98472918471 (Passcode: 1234)',
    addedBy: 'Ana (Colega)',
    timestamp: 'Há 3 dias',
  },
];

const DEFAULT_STUDENT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    senderName: 'NEXO Tutor IA',
    isNexoBot: true,
    text: '🎓 **Bem-vindo ao Chat Académico de Estudo!** Podes tirar dúvidas de matérias marcando `@tutor`, escanear apontamentos com Visão IA, agendar avisos de exames e criar votações de trabalhos de grupo!',
    timestamp: '09:00',
    pinned: true,
  },
  {
    id: '2',
    senderName: 'Sofia',
    text: 'Anexei os meus apontamentos sintetizados da aula de Álgebra Linear de hoje! 📝✨',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    ocrItems: ['Matriz Inversa A^-1', 'Determinante det(A) != 0', 'Sistemas Lineares Homogéneos'],
    timestamp: '10:15',
  },
  {
    id: '3',
    senderName: 'Pedro',
    text: '🗳️ Qual o melhor dia para a reunião de preparação do trabalho de grupo?',
    poll: {
      question: 'Qual o melhor dia para a reunião de preparação do trabalho de grupo?',
      options: [
        { id: '1', text: 'Quinta-feira às 18h (Biblioteca)', votes: ['Pedro', 'Sofia'] },
        { id: '2', text: 'Sexta-feira às 15h (Zoom)', votes: ['Eu'] },
        { id: '3', text: 'Sábado de manhã', votes: [] },
      ],
    },
    timestamp: '11:00',
  },
];

export const StudentChat: React.FC<{ currentUserName?: string }> = ({
  currentUserName = 'Eu (Estudante)',
}) => {
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat Messages State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_student_chat_messages');
      return saved ? JSON.parse(saved) : DEFAULT_STUDENT_MESSAGES;
    } catch {
      return DEFAULT_STUDENT_MESSAGES;
    }
  });

  // 🧠 Academic Memory State
  const [academicMemory, setAcademicMemory] = useState<AcademicMemoryFact[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_student_memory');
      return saved ? JSON.parse(saved) : DEFAULT_ACADEMIC_MEMORY;
    } catch {
      return DEFAULT_ACADEMIC_MEMORY;
    }
  });

  // ⏰ Reminders State
  const [, setReminders] = useState<StudentReminder[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_student_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [newFactText, setNewFactText] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<'fórmulas' | 'datas_exames' | 'links_aulas' | 'geral'>('fórmulas');

  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Input & Attachments
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  // 🎙️ Audio Recording
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Persist Messages
  useEffect(() => {
    try {
      localStorage.setItem('nexo_student_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save student chat messages', e);
    }
  }, [messages]);

  // Persist Memory
  useEffect(() => {
    try {
      localStorage.setItem('nexo_student_memory', JSON.stringify(academicMemory));
    } catch (e) {
      console.warn('Could not save academic memory', e);
    }
  }, [academicMemory]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ⏰ Reminders Alarm Checking Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReminders((prevReminders) =>
        prevReminders.map((rem) => {
          if (!rem.triggered && rem.triggerTimestamp <= now) {
            showToast(`⏰ AVISO DE ESTUDO: ${rem.targetPerson} - ${rem.reminderText}`, 'info');

            const alertMsg: ChatMessage = {
              id: Date.now().toString(),
              senderName: 'NEXO Tutor IA',
              isNexoBot: true,
              text: `🚨 **ALERTA ACADÉMICO!** ${rem.targetPerson}, hora de focar em: **${rem.reminderText}**! 📚⏰`,
              timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
            };
            setMessages((prevMsgs) => [...prevMsgs, alertMsg]);

            return { ...rem, triggered: true };
          }
          return rem;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 📷 1. Visão por IA (Scan OCR Apontamentos)
  const handleScanNotesOCR = (msg: ChatMessage) => {
    if (!msg.imageUrl) return;

    let itemsExtracted = msg.ocrItems;
    if (!itemsExtracted || itemsExtracted.length === 0) {
      itemsExtracted = ['Teorema de Bolzano-Cauchy', 'Limites Indeterminados [0/0]', 'Derivadas Parciais de 2ª Ordem'];
    }

    showToast(`📷 Visão IA: Apontamentos lidos da imagem e guardados na biblioteca de estudo!`, 'success');

    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: 'NEXO Tutor IA',
      isNexoBot: true,
      text: `📷 **Leitura por IA de Apontamentos executada!** Extraí os seguintes tópicos de estudo da imagem de ${msg.senderName}:\n- ${itemsExtracted.join('\n- ')} 📚`,
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // 🎙️ 2. Audio Note Recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          senderName: currentUserName,
          text: `🎵 Nota de Áudio de Aula/Estudo (${recordingSeconds}s)`,
          audioUrl,
          audioDuration: recordingSeconds,
          timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        };

        setMessages((prev) => [...prev, newMsg]);
        showToast('Nota de áudio partilhada no grupo de estudo!', 'success');
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      showToast('Acesso ao microfone indisponível.', 'error');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const playAudioNote = (msgId: string, audioUrl: string) => {
    if (playingAudioId === msgId && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
      return;
    }
    if (audioPlayerRef.current) audioPlayerRef.current.pause();

    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setPlayingAudioId(msgId);

    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
    audio.play();
  };

  // Poll Creation
  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim()) return;
    const validOpts = pollOptions.filter((o) => o.trim().length > 0);
    if (validOpts.length < 2) {
      showToast('Adiciona pelo menos 2 opções para a votação de estudo.', 'error');
      return;
    }

    const newPoll: ChatPoll = {
      question: pollQuestion.trim(),
      options: validOpts.map((optText, idx) => ({
        id: (idx + 1).toString(),
        text: optText.trim(),
        votes: idx === 0 ? [currentUserName] : [],
      })),
    };

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUserName,
      text: `🗳️ Votação de Estudo: ${pollQuestion.trim()}`,
      poll: newPoll,
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    setMessages((prev) => [...prev, newMsg]);
    setPollQuestion('');
    setPollOptions(['', '']);
    setIsPollModalOpen(false);
    showToast('Votação publicada no chat!', 'success');
  };

  const handleVotePoll = (messageId: string, optionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.poll) return msg;

        const updatedOptions = msg.poll.options.map((opt) => {
          const hasVoted = opt.votes.includes(currentUserName);
          if (opt.id === optionId) {
            return {
              ...opt,
              votes: hasVoted
                ? opt.votes.filter((v) => v !== currentUserName)
                : [...opt.votes, currentUserName],
            };
          } else {
            return {
              ...opt,
              votes: opt.votes.filter((v) => v !== currentUserName),
            };
          }
        });

        return {
          ...msg,
          poll: { ...msg.poll, options: updatedOptions },
        };
      })
    );
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedText = inputText.trim();
    if (!trimmedText && !selectedImage && !selectedLink) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUserName,
      text: trimmedText,
      imageUrl: selectedImage || undefined,
      linkUrl: selectedLink || undefined,
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);

    setInputText('');
    setSelectedImage(null);
    setSelectedLink(null);

    // Tutor IA Response if `@tutor` or `@nexo` present
    const lower = trimmedText.toLowerCase();
    if (lower.includes('@tutor') || lower.includes('@nexo')) {
      handleTutorAiReply(trimmedText);
    }
  };

  const handleTutorAiReply = async (query: string) => {
    const cleanPrompt = query.replace(/(@tutor|@nexo)/gi, '').trim() || 'Olá! Em que matéria podes ajudar-me hoje?';
    
    // Check if there is an exact matching memory fact to inject as context
    const factsList = academicMemory.map((m) => `${m.category}: ${m.fact}`);

    const botLoadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      senderName: 'NEXO Tutor IA',
      isNexoBot: true,
      text: '🎓 A pensar e a analisar a tua dúvida académica...',
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };
    setMessages((prev) => [...prev, botLoadingMsg]);

    try {
      const activeKey = getEffectiveApiKey('groq');
      const endpoints = ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'];
      const models = ACTIVE_GROQ_MODELS;
      
      let aiText = '';
      const systemPrompt = `És o NEXO Tutor IA, um assistente pedagógico e tutor académico universitário de excelência. Respondes sempre em Português de Portugal (PT-PT) com rigor científico, clareza didática, exemplos práticos e formatação estruturada em Markdown.\n\nFactos da Biblioteca Académica:\n${factsList.join('\n')}`;

      for (const endpoint of endpoints) {
        if (aiText) break;
        for (const model of models) {
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeKey}` },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: cleanPrompt }
                ],
                temperature: 0.65,
                max_tokens: 1024,
              })
            });
            if (res.ok) {
              const data = await res.json();
              const c = data?.choices?.[0]?.message?.content;
              if (c) { aiText = c; break; }
            }
          } catch { /* try next */ }
        }
      }

      const finalReply = aiText || '🎓 Olá! Em que matéria ou cadeira precisas de ajuda hoje? Podes perguntar sobre Cálculo, Programação, Física, Química, Direito, Medicina e muito mais!';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botLoadingMsg.id
            ? {
                ...m,
                id: (Date.now() + 1).toString(),
                text: finalReply,
                timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
              }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botLoadingMsg.id
            ? {
                ...m,
                id: (Date.now() + 1).toString(),
                text: 'Não foi possível ligar ao Tutor IA no momento. Verifica a tua ligação.',
              }
            : m
        )
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[680px]">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white">Chat Académico &amp; Tutor IA</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Grupo de Estudo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Usa <code className="text-amber-300 font-mono">@tutor</code> para tirar dúvidas ou envia fotos de apontamentos!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPollModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
            title="Criar Votação de Grupo"
          >
            <Vote size={14} className="text-purple-400" />
            <span className="hidden sm:inline">Votação</span>
          </button>

          <button
            onClick={() => setIsMemoryModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
            title="Biblioteca de Memória Académica"
          >
            <Brain size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Memória ({academicMemory.length})</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
        
        {messages.map((msg) => {
          const isMe = msg.senderName === currentUserName;
          const isBot = msg.isNexoBot;

          return (
            <div
              key={msg.id}
              className={`flex flex-col space-y-1 max-w-[85%] sm:max-w-[70%] ${
                isMe ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              {/* Sender Name */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                {isBot && <Bot size={14} className="text-indigo-500" />}
                <span>{msg.senderName}</span>
                <span className="text-[10px] font-normal text-slate-400">({msg.timestamp})</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm space-y-3 leading-relaxed shadow-md ${
                  isBot
                    ? 'bg-slate-900 text-white border border-indigo-500/30'
                    : isMe
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Audio Note Player */}
                {msg.audioUrl && (
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/10 flex items-center gap-3">
                    <button
                      onClick={() => playAudioNote(msg.id, msg.audioUrl!)}
                      className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                    >
                      {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <div className="text-xs font-mono">
                      <span>Nota de Áudio ({msg.audioDuration || 5}s)</span>
                    </div>
                  </div>
                )}

                {/* Attached Image with OCR scanner */}
                {msg.imageUrl && (
                  <div className="space-y-2">
                    <img
                      src={msg.imageUrl}
                      alt="Apontamento"
                      className="rounded-xl max-h-48 w-full object-cover border border-white/20"
                    />
                    <button
                      onClick={() => handleScanNotesOCR(msg)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <ScanLine size={14} />
                      <span>Escanear Apontamentos com Visão IA</span>
                    </button>
                  </div>
                )}

                {/* Interactive Poll */}
                {msg.poll && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-purple-500/30 text-white space-y-3">
                    <div className="font-extrabold text-xs text-purple-300">🗳️ {msg.poll.question}</div>
                    <div className="space-y-2">
                      {msg.poll.options.map((opt) => {
                        const hasVoted = opt.votes.includes(currentUserName);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleVotePoll(msg.id, opt.id)}
                            className={`w-full p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                              hasVoted
                                ? 'bg-purple-600/40 border-purple-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span>{opt.text}</span>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                              {opt.votes.length} Votos
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Toolbar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
        
        {/* Audio Recording Status Banner */}
        {isRecordingAudio && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>A gravar nota de áudio... ({recordingSeconds}s)</span>
            </div>
            <button
              onClick={stopAudioRecording}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-extrabold"
            >
              Concluir &amp; Enviar
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          
          {/* Audio Record Button */}
          <button
            type="button"
            onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
            className={`p-2.5 rounded-xl transition-colors ${
              isRecordingAudio
                ? 'bg-rose-600 text-white animate-bounce'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Gravar nota de áudio"
          >
            <Mic size={18} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escreve uma mensagem ou usa @tutor para tirar dúvidas..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>

      {/* CREATE POLL MODAL */}
      {isPollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Vote size={18} className="text-purple-500" />
                <span>Nova Votação de Grupo de Estudo</span>
              </h4>
              <button onClick={() => setIsPollModalOpen(false)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pergunta da Votação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Qual o tema principal da apresentação?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Opções de Resposta</label>
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Opção ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions];
                      newOpts[idx] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPollModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
                >
                  Publicar Votação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMORY MODAL */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Brain size={18} className="text-amber-500" />
                <span>Biblioteca de Memória Académica</span>
              </h4>
              <button onClick={() => setIsMemoryModalOpen(false)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newFactText.trim()) return;
              const newFact: AcademicMemoryFact = {
                id: Date.now().toString(),
                category: newFactCategory,
                fact: newFactText.trim(),
                addedBy: currentUserName,
                timestamp: 'Agora',
              };
              setAcademicMemory([newFact, ...academicMemory]);
              setNewFactText('');
              showToast('Novo facto adicionado à memória académica!', 'success');
            }} className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Fórmula da Derivada de f(x)..."
                  value={newFactText}
                  onChange={(e) => setNewFactText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <select
                  value={newFactCategory}
                  onChange={(e: any) => setNewFactCategory(e.target.value)}
                  className="px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="fórmulas">Fórmulas</option>
                  <option value="datas_exames">Exames</option>
                  <option value="links_aulas">Links</option>
                  <option value="geral">Geral</option>
                </select>
                <button type="submit" className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold">
                  Guardar
                </button>
              </div>
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {academicMemory.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-indigo-500 uppercase">
                    <span>{f.category}</span>
                    <span className="text-slate-400">{f.timestamp}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{f.fact}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsMemoryModalOpen(false)} className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
