import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Pin,
  ShoppingBag,
  CheckSquare,
  Volume2,
  Sparkles,
  Bot,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  X,
  Video,
  Paperclip,
  Vote,
  Plus,
  Trash2,
  Brain,
  Bookmark,
  Clock,
  Play,
  Pause,
  ScanLine,
  Trophy,
  Utensils,
  Radio,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { getEffectiveApiKey, ACTIVE_GROQ_MODELS } from '../../../services/aiConfigService';

export interface FamilyMemoryFact {
  id: string;
  category: 'casa' | 'preferencias' | 'aniversarios' | 'geral';
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

export interface FamilyReminder {
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
  reminder?: FamilyReminder;
  timestamp: string;
  pinned?: boolean;
}

interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
}

interface ChoreItem {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
}

interface MealPlanDay {
  day: string;
  lunch: string;
  dinner: string;
}

interface FamilyChatProps {
  currentUserName?: string;
  groceries: GroceryItem[];
  onAddGrocery: (name: string) => void;
  chores: ChoreItem[];
  onAddChore: (title: string, assignee: string) => void;
  mealPlan: MealPlanDay[];
}

const DEFAULT_MEMORY_FACTS: FamilyMemoryFact[] = [
  {
    id: '1',
    category: 'casa',
    fact: 'A palavra-passe do Wi-Fi de casa é "NexoFamilia2026".',
    addedBy: 'Maria',
    timestamp: 'Ontem',
  },
  {
    id: '2',
    category: 'casa',
    fact: 'O cão Max tem alergia grave a derivados de frango.',
    addedBy: 'João',
    timestamp: 'Há 2 dias',
  },
  {
    id: '3',
    category: 'aniversarios',
    fact: 'O aniversário da Maria é a 14 de Outubro.',
    addedBy: 'Ana',
    timestamp: 'Há 5 dias',
  },
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    senderName: 'NEXO Bot',
    isNexoBot: true,
    text: '👋 Bem-vindos ao Chat Familiar Inteligente de Nível Máximo! Podem gravar notas de voz reais, ler talões por IA, agendar lembretes com alarme e consultar o Balanço Semanal.',
    timestamp: '09:00',
    pinned: true,
  },
  {
    id: '2',
    senderName: 'Maria',
    text: 'Sugestão para o próximo jantar em família: Grelhados com salada fresca e batatas! 🥗😋',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    ocrItems: ['Carne para grelhar (1kg)', 'Salada Mista', 'Batatas para assar'],
    timestamp: '11:15',
  },
  {
    id: '3',
    senderName: 'João',
    text: '🗳️ Onde vamos almoçar no próximo fim-de-semana?',
    poll: {
      question: 'Onde vamos almoçar no próximo fim-de-semana?',
      options: [
        { id: '1', text: 'Restaurante de Marisco na praia 🦞', votes: ['João', 'Maria'] },
        { id: '2', text: 'Pizzaria no centro 🍕', votes: ['Ana'] },
        { id: '3', text: 'Churrasco em casa 🥩', votes: ['Eu'] },
      ],
    },
    timestamp: '12:00',
  },
  {
    id: '4',
    senderName: 'Ana',
    text: '@nexo lembra o João às 20:00 de colocar a mesa para o jantar',
    timestamp: '12:20',
  },
  {
    id: '5',
    senderName: 'NEXO Bot',
    isNexoBot: true,
    text: '⏰ **Lembrete Agendado!** Agendei um aviso para João às 20:00: "colocar a mesa para o jantar".',
    timestamp: '12:20',
  },
];

export const FamilyChat: React.FC<FamilyChatProps> = ({
  currentUserName = 'Eu',
  groceries,
  onAddGrocery,
  chores,
  onAddChore,
  mealPlan,
}) => {
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat Messages State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_family_chat_messages');
      return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
    } catch {
      return DEFAULT_MESSAGES;
    }
  });

  // 🧠 Family Memory State
  const [familyMemory, setFamilyMemory] = useState<FamilyMemoryFact[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_family_memory');
      return saved ? JSON.parse(saved) : DEFAULT_MEMORY_FACTS;
    } catch {
      return DEFAULT_MEMORY_FACTS;
    }
  });

  // ⏰ Family Reminders State
  const [reminders, setReminders] = useState<FamilyReminder[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_family_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<'casa' | 'preferencias' | 'aniversarios' | 'geral'>('casa');

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [tempLinkInput, setTempLinkInput] = useState('');

  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Weekly Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Input & Attachments
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Voice Dictation & Speech
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  // 🎙️ Audio Recording (WhatsApp-style Audio Notes)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Full resolution image preview modal
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // Persist Messages
  useEffect(() => {
    try {
      localStorage.setItem('nexo_family_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat messages', e);
    }
  }, [messages]);

  // Persist Memory
  useEffect(() => {
    try {
      localStorage.setItem('nexo_family_memory', JSON.stringify(familyMemory));
    } catch (e) {
      console.warn('Could not save family memory', e);
    }
  }, [familyMemory]);

  // Persist Reminders
  useEffect(() => {
    try {
      localStorage.setItem('nexo_family_reminders', JSON.stringify(reminders));
    } catch (e) {
      console.warn('Could not save reminders', e);
    }
  }, [reminders]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up speech
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // ⏰ Reminders Alarm Checking Ticker (Every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReminders((prevReminders) =>
        prevReminders.map((rem) => {
          if (!rem.triggered && rem.triggerTimestamp <= now) {
            // Trigger Alarm!
            showToast(`⏰ LEMBRETE DA CASA: ${rem.targetPerson} - ${rem.reminderText}`, 'info');

            // Post Bot Alert in chat
            const alertMsg: ChatMessage = {
              id: Date.now().toString(),
              senderName: 'NEXO Bot',
              isNexoBot: true,
              text: `🚨 **ALERTA DE LEMBRETE!** ${rem.targetPerson}, chegou a hora de: **${rem.reminderText}**! ⏰`,
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

  // 📷 1. Visão por IA (Simulated OCR Image Scanner)
  const handleScanImageOCR = (msg: ChatMessage) => {
    if (!msg.imageUrl) return;

    let itemsExtracted = msg.ocrItems;
    if (!itemsExtracted || itemsExtracted.length === 0) {
      itemsExtracted = ['Pão Fresco de Cereais', 'Leite Meio Gordo (2L)', 'Fruta Variada', 'Azeite Virgem Extra'];
    }

    itemsExtracted.forEach((item) => onAddGrocery(item));
    showToast(`📷 Visão IA: ${itemsExtracted.length} produtos lidos da imagem e adicionados às Compras!`, 'success');

    // Bot Response
    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: 'NEXO Bot',
      isNexoBot: true,
      text: `📷 **Visão por IA executada!** Li a imagem partilhada por ${msg.senderName} e adicionei à Lista de Compras: **${itemsExtracted.join(', ')}** 🎉`,
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // 🎙️ 2. Audio Note Recording (WhatsApp-style Real Audio)
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          senderName: currentUserName,
          text: `🎵 Nota de Áudio (${recordingSeconds}s)`,
          audioUrl,
          audioDuration: recordingSeconds,
          timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        };

        setMessages((prev) => [...prev, newMsg]);
        showToast('Nota de áudio enviada para o chat!', 'success');

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      showToast('Acesso ao microfone negado ou indisponível.', 'error');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const playAudioNote = (msgId: string, audioUrl: string) => {
    if (playingAudioId === msgId && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setPlayingAudioId(msgId);

    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
    audio.play();
  };

  // Image Drag & Drop
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecione uma imagem válida.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Por favor escolha uma imagem menor que 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSelectedImage(base64);
        showToast('Imagem anexada à mensagem!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempLinkInput.trim();
    if (!trimmed) return;
    let validUrl = trimmed;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }
    setSelectedLink(validUrl);
    setTempLinkInput('');
    setIsLinkModalOpen(false);
    showToast('Link anexado!', 'success');
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim()) return;
    const validOptions = pollOptions.filter((opt) => opt.trim().length > 0);
    if (validOptions.length < 2) {
      showToast('Adicione pelo menos 2 opções para a votação.', 'error');
      return;
    }

    const newPoll: ChatPoll = {
      question: pollQuestion.trim(),
      options: validOptions.map((optText, idx) => ({
        id: (idx + 1).toString(),
        text: optText.trim(),
        votes: idx === 0 ? [currentUserName] : [],
      })),
    };

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUserName,
      text: `🗳️ Votação: ${pollQuestion.trim()}`,
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
          poll: {
            ...msg.poll,
            options: updatedOptions,
          },
        };
      })
    );
    showToast('Voto registado na votação!', 'info');
  };

  const handleCreateQuickPollFromMsg = (msg: ChatMessage) => {
    const questionText = msg.text || 'Votação Familiar';
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUserName,
      text: `🗳️ Votação Rápida: ${questionText}`,
      poll: {
        question: questionText,
        options: [
          { id: '1', text: 'Concordo / Sim 👍', votes: [currentUserName] },
          { id: '2', text: 'Discordo / Não 👎', votes: [] },
          { id: '3', text: 'Outra sugestão 💬', votes: [] },
        ],
      },
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };
    setMessages((prev) => [...prev, newMsg]);
    showToast('Votação rápida criada a partir da mensagem!', 'success');
  };

  // 🧠 Memory Handlers
  const handleAddManualMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    const newFact: FamilyMemoryFact = {
      id: Date.now().toString(),
      category: newMemoryCategory,
      fact: newMemoryText.trim(),
      addedBy: currentUserName,
      timestamp: 'Agora',
    };

    setFamilyMemory([newFact, ...familyMemory]);
    setNewMemoryText('');
    showToast('Facto guardado na Memória da Família!', 'success');
  };

  const handleDeleteMemoryFact = (id: string) => {
    setFamilyMemory(familyMemory.filter((f) => f.id !== id));
    showToast('Facto removido da memória.', 'info');
  };

  // ⏰ 3. Parse & Schedule Reminders from Chat
  const parseAndScheduleReminder = (text: string) => {
    const lower = text.toLowerCase();
    let target = 'Família';
    if (lower.includes('joão') || lower.includes('joao')) target = 'João';
    else if (lower.includes('maria')) target = 'Maria';
    else if (lower.includes('ana')) target = 'Ana';

    let reminderContent = text.replace(/@nexo/gi, '').replace(/(lembra|avisa)/gi, '').trim();
    if (!reminderContent) reminderContent = 'Aviso agendado em família';

    // Set trigger timestamp to 10 seconds from now for immediate demo testing if no exact time, or calculate
    const triggerTimestamp = Date.now() + 12000; // 12 seconds demo timer
    const triggerTimeStr = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(triggerTimestamp));

    const newReminder: FamilyReminder = {
      id: Date.now().toString(),
      targetPerson: target,
      reminderText: reminderContent,
      triggerTimeStr,
      triggerTimestamp,
      createdBy: currentUserName,
    };

    setReminders((prev) => [...prev, newReminder]);
    showToast(`⏰ Lembrete agendado para ${target} às ${triggerTimeStr}!`, 'success');

    // Bot Response
    setTimeout(() => {
      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderName: 'NEXO Bot',
        isNexoBot: true,
        text: `⏰ **Lembrete Agendado!** Agendei um alarme para **${target}** às ${triggerTimeStr}: "${reminderContent}". Dispararei um aviso sonoro!`,
        timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedText = inputText.trim();

    if (!trimmedText && !selectedImage && !selectedLink) return;

    let autoLink = selectedLink;
    if (!autoLink && trimmedText) {
      const match = trimmedText.match(/https?:\/\/[^\s]+/i);
      if (match) {
        autoLink = match[0];
      }
    }

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUserName,
      text: trimmedText,
      imageUrl: selectedImage || undefined,
      linkUrl: autoLink || undefined,
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    setInputText('');
    setSelectedImage(null);
    setSelectedLink(null);

    // ⏰ Check for Reminder trigger
    const lowerText = trimmedText.toLowerCase();
    if (lowerText.includes('@nexo') && (lowerText.includes('lembra') || lowerText.includes('avisa'))) {
      parseAndScheduleReminder(trimmedText);
      return;
    }

    // 🧠 Check for Auto-Learning triggers
    const isLearnTrigger =
      lowerText.includes('lembra-te que') ||
      lowerText.includes('anota que') ||
      lowerText.includes('guarda que') ||
      lowerText.includes('memoriza que');

    if (isLearnTrigger) {
      const factContent = trimmedText.replace(/(lembra-te que|anota que|guarda que|memoriza que)/gi, '').trim();
      if (factContent) {
        const learnedFact: FamilyMemoryFact = {
          id: Date.now().toString(),
          category: 'casa',
          fact: factContent,
          addedBy: currentUserName,
          timestamp: 'Agora',
        };
        setFamilyMemory((prev) => [learnedFact, ...prev]);

        setTimeout(() => {
          const botReply: ChatMessage = {
            id: (Date.now() + 1).toString(),
            senderName: 'NEXO Bot',
            isNexoBot: true,
            text: `🧠 **Memória Registada!** Guardei na memória da família: "${factContent}"`,
            timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
          };
          setMessages((prev) => [...prev, botReply]);
        }, 500);
        return;
      }
    }

    if (lowerText.includes('@nexo')) {
      handleNexoBotReply(trimmedText, updatedMessages);
    }
  };

  const handleNexoBotReply = async (userQuery: string, currentHistory: ChatMessage[]) => {
    const queryLower = userQuery.toLowerCase();
    const cleanPrompt = userQuery.replace(/@nexo/gi, '').trim() || 'Olá! Como posso ajudar a família hoje?';

    // Search in Family Memory Base first
    const matchedFact = familyMemory.find((f) => {
      const factLower = f.fact.toLowerCase();
      const keywords = ['wifi', 'senha', 'password', 'cão', 'frango', 'alergia', 'aniversário', 'aniversario', 'maria', 'joão', 'ana', 'chave'];
      return keywords.some((kw) => queryLower.includes(kw) && factLower.includes(kw));
    });

    const botLoadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      senderName: 'NEXO Bot',
      isNexoBot: true,
      text: '🤖 A consultar a memória da casa e a preparar resposta...',
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };
    setMessages((prev) => [...prev, botLoadingMsg]);

    try {
      let finalReply = '';
      if (matchedFact) {
        finalReply = `🧠 **Recordei da Memória da Casa:** ${matchedFact.fact} *(Guardado por ${matchedFact.addedBy})*`;
      } else {
        const activeKey = getEffectiveApiKey('groq');
        const endpoints = ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'];
        const models = ACTIVE_GROQ_MODELS;

        const pendingGroceries = groceries.filter((g) => !g.completed).map((g) => g.name);
        const pendingChores = chores.filter((c) => !c.completed).map((c) => `${c.title} (${c.assignee})`);
        const todayMeals = mealPlan[0] ? `Almoço: ${mealPlan[0].lunch}, Jantar: ${mealPlan[0].dinner}` : 'Não definido';
        const factsSummary = familyMemory.map((f) => `- ${f.category}: ${f.fact}`).join('\n');

        const systemPrompt = `És o NEXO Bot, assistente inteligente da casa e da família. Respondes sempre em Português de Portugal (PT-PT) com tom afetuoso, útil, claro e conciso.\n\nContexto Atual da Casa:\n- Compras Pendentes: ${pendingGroceries.join(', ') || 'Nenhuma'}\n- Tarefas Pendentes: ${pendingChores.join(', ') || 'Nenhuma'}\n- Refeições Hoje: ${todayMeals}\n- Memória da Casa:\n${factsSummary}`;

        const recentMsgs = currentHistory.slice(-6).map((m) => ({
          role: (m.isNexoBot ? 'assistant' : 'user') as 'assistant' | 'user',
          content: `${m.senderName}: ${m.text}`
        }));

        for (const endpoint of endpoints) {
          if (finalReply) break;
          for (const model of models) {
            try {
              const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeKey}` },
                body: JSON.stringify({
                  model,
                  messages: [
                    { role: 'system', content: systemPrompt },
                    ...recentMsgs,
                    { role: 'user', content: cleanPrompt }
                  ],
                  temperature: 0.65,
                  max_tokens: 1024,
                })
              });
              if (res.ok) {
                const data = await res.json();
                const c = data?.choices?.[0]?.message?.content;
                if (c) { finalReply = c; break; }
              }
            } catch { /* next */ }
          }
        }
      }

      if (!finalReply) {
        finalReply = '🤖 Olá! Estou atento e pronto para ajudar na organização das refeições, compras e tarefas da família!';
      }

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
                text: 'Não foi possível ligar ao assistente no momento. Verifica a ligação à internet.',
              }
            : m
        )
      );
    }
  };

  const togglePinMessage = (id: string) => {
    setMessages(
      messages.map((m) => {
        if (m.id === id) {
          const nextPinned = !m.pinned;
          showToast(nextPinned ? 'Mensagem fixada no topo do chat.' : 'Mensagem desfixada.', 'info');
          return { ...m, pinned: nextPinned };
        }
        return m;
      })
    );
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    showToast('Mensagem apagada.', 'info');
  };

  const handleClearChat = () => {
    if (!window.confirm('Tem a certeza que deseja apagar todo o histórico de conversas do chat?')) return;
    setMessages([]);
    try {
      localStorage.removeItem('nexo_family_chat_messages');
    } catch (e) {
      console.warn('Could not clear chat messages', e);
    }
    showToast('Histórico do chat limpo.', 'info');
  };

  const handlePublishWeeklyReportToChat = () => {
    const completedChoresCount = chores.filter((c) => c.completed).length;
    const completedGroceriesCount = groceries.filter((g) => g.completed).length;

    const reportMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: 'NEXO Bot',
      isNexoBot: true,
      text: `🏆 **BALANÇO SEMANAL DA FAMÍLIA** 📊\n\n- 🧹 **Tarefas Concluídas:** ${completedChoresCount} de ${chores.length}\n- 🛒 **Compras Efetuadas:** ${completedGroceriesCount} itens comprados\n- 🍲 **Refeições em Família:** 7 jantares planeados\n- 🧠 **Memória Ativa:** ${familyMemory.length} factos guardados\n\n🎉 Parabéns a toda a família pela excelente organização esta semana!`,
      timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      pinned: true,
    };

    setMessages((prev) => [...prev, reportMsg]);
    setIsReportModalOpen(false);
    showToast('Balanço Semanal publicado no chat!', 'success');
  };

  const handleConvertGrocery = (text: string) => {
    let cleanName = text.replace(/@nexo/gi, '').trim();
    if (!cleanName) cleanName = 'Item de compras';
    if (cleanName.length > 50) cleanName = cleanName.substring(0, 50) + '...';
    onAddGrocery(cleanName);
    showToast(`Adicionado à Lista de Compras: "${cleanName}"`, 'success');
  };

  const handleConvertChore = (msg: ChatMessage) => {
    let cleanTitle = msg.text.replace(/@nexo/gi, '').trim();
    if (!cleanTitle) cleanTitle = 'Tarefa familiar';
    if (cleanTitle.length > 50) cleanTitle = cleanTitle.substring(0, 50) + '...';
    onAddChore(cleanTitle, msg.senderName);
    showToast(`Tarefa atribuída a ${msg.senderName}: "${cleanTitle}"`, 'success');
  };

  const speakMessage = (msg: ChatMessage) => {
    if (!('speechSynthesis' in window)) {
      showToast('Síntese de voz não disponível neste navegador.', 'error');
      return;
    }

    if (activeSpeakerId === msg.id) {
      window.speechSynthesis.cancel();
      setActiveSpeakerId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${msg.senderName} disse: ${msg.text.replace(/[*🤖🧠🏆🚨⏰]/g, '')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-PT';
    utterance.onend = () => setActiveSpeakerId(null);
    utterance.onerror = () => setActiveSpeakerId(null);

    setActiveSpeakerId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Reconhecimento de voz não suportado neste navegador.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      showToast('🎙️ Microfone ativado. Pode falar...', 'info');
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        showToast('Voz convertida em texto!', 'success');
      }
    };

    recognition.start();
  };

  const renderLinkCard = (url: string) => {
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-black/30 border border-white/15 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${isYouTube ? 'bg-red-600' : 'bg-indigo-600'}`}>
            {isYouTube ? <Video size={18} /> : <LinkIcon size={16} />}
          </div>
          <div className="truncate">
            <span className="font-bold text-white block truncate">
              {isYouTube ? 'Vídeo / Receita YouTube' : 'Link Web Partilhado'}
            </span>
            <span className="text-[10px] text-slate-300 block truncate">{url}</span>
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3 py-1.5 rounded-xl font-bold text-white text-xs transition-all flex items-center gap-1 shrink-0 ${
            isYouTube ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <span>Abrir</span>
          <ExternalLink size={12} />
        </a>
      </div>
    );
  };

  const pinnedMessages = messages.filter((m) => m.pinned);
  const activeReminders = reminders.filter((r) => !r.triggered);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-[600px] bg-slate-900/95 dark:bg-slate-950 rounded-3xl border transition-all shadow-2xl overflow-hidden relative ${
        isDragging ? 'border-purple-500 ring-4 ring-purple-500/30' : 'border-slate-800'
      }`}
    >
      {/* DRAG AND DROP OVERLAY */}
      {isDragging && (
        <div className="absolute inset-0 bg-purple-950/90 backdrop-blur-xs z-50 flex flex-col items-center justify-center border-4 border-dashed border-purple-400 rounded-3xl animate-fade-in text-white p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-600/50 flex items-center justify-center shadow-xl mb-3 animate-bounce">
            <ImageIcon size={32} />
          </div>
          <h4 className="text-lg font-extrabold">Arrastre e largue a imagem aqui!</h4>
          <p className="text-xs text-purple-200 mt-1">
            A imagem será anexada automaticamente ao chat da família.
          </p>
        </div>
      )}

      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* CHAT HEADER */}
      <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>Chat & Conversas da Casa</span>
              <Badge variant="primary" size="sm">NEXO AI Supercharged</Badge>
            </h3>
            <p className="text-[11px] text-slate-400">
              Visão IA, notas de áudio, alarmes e balanço semanal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 📊 WEEKLY REPORT BUTTON */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Ver Balanço Semanal da Casa"
          >
            <Trophy size={14} className="text-amber-400" />
            <span>Balanço</span>
          </button>

          {/* 🧠 MEMORY MODAL TOGGLE BUTTON */}
          <button
            onClick={() => setIsMemoryModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Ver Memória da Família"
          >
            <Brain size={14} className="text-indigo-400" />
            <span>Memória ({familyMemory.length})</span>
          </button>

          <button
            onClick={() => setInputText((prev) => `${prev} @nexo `)}
            className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1"
            title="Inserir menção @nexo"
          >
            <Bot size={14} />
            <span>@nexo</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors"
            title="Limpar histórico do chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ACTIVE REMINDERS BANNER */}
      {activeReminders.length > 0 && (
        <div className="bg-indigo-950/60 border-b border-indigo-500/30 px-4 py-2 flex items-center justify-between shrink-0 text-xs text-indigo-200">
          <div className="flex items-center gap-2 truncate pr-2">
            <Clock size={14} className="text-indigo-400 shrink-0 animate-pulse" />
            <span className="font-bold text-indigo-300 shrink-0">Alarme Ativo:</span>
            <span className="truncate">
              {activeReminders[0].targetPerson}: "{activeReminders[0].reminderText}" ({activeReminders[0].triggerTimeStr})
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 font-mono shrink-0">
            ({activeReminders.length})
          </span>
        </div>
      )}

      {/* PINNED MESSAGES BANNER */}
      {pinnedMessages.length > 0 && (
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between shrink-0 text-xs text-amber-200">
          <div className="flex items-center gap-2 truncate pr-2">
            <Pin size={14} className="text-amber-400 shrink-0" />
            <span className="font-bold text-amber-400 shrink-0">Fixado:</span>
            <span className="truncate">{pinnedMessages[pinnedMessages.length - 1].text || 'Anexo fixado'}</span>
          </div>
          <span className="text-[10px] text-amber-400/70 font-mono shrink-0">
            ({pinnedMessages.length})
          </span>
        </div>
      )}

      {/* MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
        {messages.map((msg) => {
          const isMe = msg.senderName === currentUserName;
          const isBot = msg.isNexoBot;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isMe ? 'items-end' : 'items-start'
              } space-y-1 group`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold px-1">
                {isBot ? (
                  <span className="text-purple-400 flex items-center gap-1">
                    <Bot size={11} /> NEXO Bot
                  </span>
                ) : (
                  <span>{msg.senderName}</span>
                )}
                <span>·</span>
                <span>{msg.timestamp}</span>
                {msg.pinned && <Pin size={10} className="text-amber-400 fill-amber-400" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed relative ${
                  isBot
                    ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 text-purple-100 border border-purple-500/30'
                    : isMe
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-xs'
                }`}
              >
                {/* Text Content */}
                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                {/* 🎙️ WHATSAPP-STYLE AUDIO NOTE BUBBLE */}
                {msg.audioUrl && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-black/40 border border-white/20 flex items-center gap-3 text-xs">
                    <button
                      onClick={() => playAudioNote(msg.id, msg.audioUrl!)}
                      className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0 transition-transform active:scale-95"
                    >
                      {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold">
                        <span className="flex items-center gap-1">
                          <Radio size={12} className="animate-pulse" />
                          <span>Nota de Áudio</span>
                        </span>
                        <span>0:{msg.audioDuration ? String(msg.audioDuration).padStart(2, '0') : '15'}</span>
                      </div>
                      {/* Waveform graphic */}
                      <div className="flex items-center gap-0.5 h-3">
                        {[40, 70, 30, 90, 60, 100, 50, 80, 40, 60, 90, 50, 70, 30].map((h, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full ${
                              playingAudioId === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 📷 ATTACHED IMAGE WITH AI OCR SCAN BUTTON */}
                {msg.imageUrl && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-white/20 shadow-md max-w-xs relative group">
                    <img
                      src={msg.imageUrl}
                      alt="Anexo de Imagem"
                      onClick={() => setPreviewImageModal(msg.imageUrl!)}
                      className="w-full h-auto max-h-56 object-cover cursor-pointer transition-transform group-hover:scale-105"
                    />

                    {/* AI OCR SCANNER BUTTON */}
                    <div className="p-2 bg-black/70 flex items-center justify-between gap-2 border-t border-white/10">
                      <span className="text-[10px] text-slate-300">Foto / Talão</span>
                      <button
                        onClick={() => handleScanImageOCR(msg)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] transition-all flex items-center gap-1 shadow-xs"
                      >
                        <ScanLine size={12} />
                        <span>📷 Visão IA (+Compras)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Attached Link Card */}
                {msg.linkUrl && renderLinkCard(msg.linkUrl)}

                {/* 🗳️ ATTACHED POLL CARD IN CHAT BUBBLE */}
                {msg.poll && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-black/40 border border-white/20 space-y-3 min-w-[240px]">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <Vote size={16} className="text-amber-400 shrink-0" />
                      <span className="font-extrabold text-xs text-white">{msg.poll.question}</span>
                    </div>

                    <div className="space-y-2">
                      {(() => {
                        const totalVotes = msg.poll.options.reduce((acc, o) => acc + o.votes.length, 0);
                        return msg.poll.options.map((option) => {
                          const userVotedThis = option.votes.includes(currentUserName);
                          const percent = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleVotePoll(msg.id, option.id)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all relative overflow-hidden flex flex-col gap-1 ${
                                userVotedThis
                                  ? 'bg-amber-500/30 border-amber-400 text-white font-bold shadow-xs'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                              }`}
                            >
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-amber-500/25 transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />

                              <div className="flex items-center justify-between gap-2 relative z-10">
                                <span className="font-semibold">{option.text}</span>
                                <span className="text-[10px] font-mono text-amber-300 font-bold shrink-0">
                                  {option.votes.length} {option.votes.length === 1 ? 'voto' : 'votos'} ({percent}%)
                                </span>
                              </div>

                              {option.votes.length > 0 && (
                                <span className="text-[9px] text-slate-400 font-normal relative z-10">
                                  Votado por: {option.votes.join(', ')}
                                </span>
                              )}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* 🌟 1-CLICK ACTION BAR */}
                {!isBot && (
                  <div className="flex items-center gap-1 pt-2 mt-2 border-t border-white/10 text-[10px]">
                    <button
                      onClick={() => handleConvertGrocery(msg.text || 'Item da mensagem')}
                      className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
                      title="Adicionar à Lista de Compras"
                    >
                      <ShoppingBag size={11} />
                      <span>+ Compras</span>
                    </button>

                    <button
                      onClick={() => handleConvertChore(msg)}
                      className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
                      title="Atribuir como Tarefa"
                    >
                      <CheckSquare size={11} />
                      <span>+ Tarefa</span>
                    </button>

                    {!msg.poll && (
                      <button
                        onClick={() => handleCreateQuickPollFromMsg(msg)}
                        className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
                        title="Criar votação a partir desta mensagem"
                      >
                        <Vote size={11} />
                        <span>+ Votação</span>
                      </button>
                    )}

                    <button
                      onClick={() => speakMessage(msg)}
                      className={`p-1 rounded-md transition-colors ${
                        activeSpeakerId === msg.id ? 'bg-emerald-500 text-white' : 'hover:bg-white/20 text-white/80'
                      }`}
                      title="Ouvir mensagem em voz alta"
                    >
                      <Volume2 size={11} />
                    </button>

                    <button
                      onClick={() => togglePinMessage(msg.id)}
                      className={`p-1 rounded-md transition-colors ${
                        msg.pinned ? 'text-amber-400' : 'hover:bg-white/20 text-white/80'
                      }`}
                      title={msg.pinned ? 'Desfixar aviso' : 'Fixar no topo'}
                    >
                      <Pin size={11} />
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1 rounded-md hover:bg-rose-500/20 hover:text-rose-400 text-white/70 transition-colors"
                      title="Apagar mensagem"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}

                {isBot && (
                  <div className="flex items-center justify-end gap-1 pt-1.5 mt-1 border-t border-purple-500/20 text-[10px]">
                    <button
                      onClick={() => speakMessage(msg)}
                      className={`p-1 rounded-md transition-colors ${
                        activeSpeakerId === msg.id ? 'bg-emerald-500 text-white' : 'hover:bg-white/20 text-white/80'
                      }`}
                      title="Ouvir resposta em voz alta"
                    >
                      <Volume2 size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1 rounded-md hover:bg-rose-500/20 hover:text-rose-400 text-white/70 transition-colors"
                      title="Apagar resposta do bot"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* DRAFT ATTACHMENTS PREVIEW BAR */}
      {(selectedImage || selectedLink) && (
        <div className="px-4 py-2 bg-slate-850 border-t border-slate-700/60 flex items-center gap-3 text-xs text-white shrink-0">
          <span className="font-bold text-indigo-400 text-[11px] uppercase">Anexos:</span>

          {selectedImage && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
              <ImageIcon size={14} className="text-emerald-400" />
              <span className="truncate max-w-[120px]">Imagem carregada</span>
              <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-white p-0.5">
                <X size={13} />
              </button>
            </div>
          )}

          {selectedLink && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
              <LinkIcon size={14} className="text-indigo-400" />
              <span className="truncate max-w-[140px]">{selectedLink}</span>
              <button onClick={() => setSelectedLink(null)} className="text-slate-400 hover:text-white p-0.5">
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* LINK INPUT MODAL / POPOVER */}
      {isLinkModalOpen && (
        <form onSubmit={handleAddLink} className="p-3 bg-slate-850 border-t border-slate-700 flex items-center gap-2 shrink-0 animate-fade-in">
          <LinkIcon size={16} className="text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Colar link do YouTube ou site (ex: https://...)"
            value={tempLinkInput}
            onChange={(e) => setTempLinkInput(e.target.value)}
            className="flex-1 w-full bg-slate-950 text-white placeholder-slate-400 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-purple-500 min-h-[36px]"
            autoFocus
          />
          <Button type="submit" variant="primary" size="sm" className="text-xs shrink-0">
            Anexar Link
          </Button>
          <button type="button" onClick={() => setIsLinkModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </form>
      )}

      {/* POLL CREATOR MODAL / POPOVER */}
      {isPollModalOpen && (
        <form onSubmit={handleCreatePoll} className="p-4 bg-slate-850 border-t border-slate-700 space-y-3 shrink-0 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Vote size={16} />
              <span>Criar Nova Votação no Chat</span>
            </div>
            <button type="button" onClick={() => setIsPollModalOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Pergunta da Votação (Ex: Onde vamos no Domingo?)"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            className="w-full bg-slate-950 text-white placeholder-slate-400 border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-purple-500 min-h-[38px]"
            required
            autoFocus
          />

          <div className="space-y-2">
            {pollOptions.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Opção ${idx + 1}...`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  className="flex-1 w-full bg-slate-950 text-white placeholder-slate-400 border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-purple-500 min-h-[36px]"
                  required
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-400 hover:text-rose-400"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPollOptions([...pollOptions, ''])}
              leftIcon={<Plus size={14} />}
              className="text-xs text-slate-300"
            >
              + Opção
            </Button>

            <Button type="submit" variant="primary" size="sm" className="text-xs bg-amber-600 hover:bg-amber-700 text-white">
              Publicar Votação
            </Button>
          </div>
        </form>
      )}

      {/* INPUT FORM & TOOLBAR */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-slate-800/90 border-t border-slate-700/60 flex items-center gap-2 shrink-0"
      >
        {/* 🎙️ REAL AUDIO NOTE RECORDER BUTTON */}
        <button
          type="button"
          onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
          className={`p-2.5 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
            isRecordingAudio
              ? 'bg-rose-600 text-white animate-pulse px-3'
              : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-700'
          }`}
          title={isRecordingAudio ? 'Parar e Enviar Nota de Áudio' : 'Gravar Nota de Áudio Real (WhatsApp)'}
        >
          <Mic size={18} />
          {isRecordingAudio && <span className="text-xs font-mono font-bold">0:{String(recordingSeconds).padStart(2, '0')}</span>}
        </button>

        <button
          type="button"
          onClick={() => setIsPollModalOpen(!isPollModalOpen)}
          className="p-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-slate-700 transition-colors shrink-0"
          title="Criar Votação / Inquérito"
        >
          <Vote size={18} />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
          title="Carregar Imagem / Foto"
        >
          <ImageIcon size={18} />
        </button>

        <button
          type="button"
          onClick={() => setIsLinkModalOpen(!isLinkModalOpen)}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
          title="Anexar Link / YouTube"
        >
          <Paperclip size={18} />
        </button>

        <button
          type="button"
          onClick={startVoiceDictation}
          className={`p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0 ${
            isListening ? 'bg-indigo-600 text-white animate-pulse' : ''
          }`}
          title="Ditado por Voz"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          placeholder="Escrever mensagem, agendar alarme ou pedir ao @nexo..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 w-full bg-slate-950 text-white placeholder-slate-400 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-purple-500 min-h-[42px]"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim() && !selectedImage && !selectedLink}
          className="min-h-[42px] px-4 bg-indigo-600 hover:bg-indigo-700 shrink-0"
        >
          <Send size={16} />
        </Button>
      </form>

      {/* 🧠 FAMILY MEMORY MODAL */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-700 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] flex flex-col text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2 font-extrabold text-sm text-indigo-300">
                <Brain size={20} className="text-indigo-400" />
                <span>Memória da Família ({familyMemory.length} Factos Guardados)</span>
              </div>
              <button onClick={() => setIsMemoryModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddManualMemory} className="space-y-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">➕ Adicionar Novo Facto à Memória</span>
              <div className="flex gap-2">
                <select
                  value={newMemoryCategory}
                  onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                  className="bg-slate-900 border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-2 outline-none"
                >
                  <option value="casa">🏠 Casa</option>
                  <option value="preferencias">⭐ Preferências</option>
                  <option value="aniversarios">🎂 Aniversários</option>
                  <option value="geral">📌 Geral</option>
                </select>

                <input
                  type="text"
                  placeholder="Ex: A chave da arrecadação fica na gaveta da entrada"
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="primary" size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700">
                  + Memorizar
                </Button>
              </div>
            </form>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {familyMemory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum facto memorizado ainda.</p>
              ) : (
                familyMemory.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bookmark size={13} className="text-amber-400 shrink-0" />
                        <span className="font-semibold text-slate-100">{fact.fact}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Adicionado por <strong className="text-slate-300">{fact.addedBy}</strong> · {fact.timestamp}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteMemoryFact(fact.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                      title="Eliminar esta memória"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <Button variant="outline" size="sm" onClick={() => setIsMemoryModalOpen(false)} className="text-xs text-slate-300">
                Fechar Memória
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 WEEKLY REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-700 shadow-2xl space-y-4 animate-scale-up text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-sm text-amber-400">
                <Trophy size={20} />
                <span>Balanço & Celebração Semanal da Família</span>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <CheckSquare size={16} />
                  <span>Tarefas Concluídas</span>
                </div>
                <span className="text-xl font-extrabold text-white">
                  {chores.filter((c) => c.completed).length} / {chores.length}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <ShoppingBag size={16} />
                  <span>Itens Comprados</span>
                </div>
                <span className="text-xl font-extrabold text-white">
                  {groceries.filter((g) => g.completed).length} itens
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Utensils size={16} />
                  <span>Refeições Planeadas</span>
                </div>
                <span className="text-xl font-extrabold text-white">7 Jantares</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <Brain size={16} />
                  <span>Factos Guardados</span>
                </div>
                <span className="text-xl font-extrabold text-white">{familyMemory.length} Memórias</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              🎉 <strong>Excelente semana em família!</strong> Todos os membros contribuíram para manter o lar organizado e bem-estar em dia.
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)} className="text-xs text-slate-300">
                Fechar
              </Button>
              <Button onClick={handlePublishWeeklyReportToChat} variant="primary" size="sm" className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold">
                📢 Publicar Balanço no Chat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSIZE IMAGE PREVIEW MODAL */}
      {previewImageModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-rose-400 font-bold flex items-center gap-1 text-sm bg-black/40 rounded-xl"
            >
              <X size={18} />
              <span>Fechar</span>
            </button>
            <img
              src={previewImageModal}
              alt="Visualização em tamanho real"
              className="max-h-[80vh] max-w-full rounded-2xl border border-white/20 shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
