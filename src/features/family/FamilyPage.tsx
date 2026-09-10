import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  UserCheck,
  Copy,
  Check,
  LogOut,
  Lock,
  Key,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ShoppingBag,
  CheckSquare,
  Square,
  Utensils,
  MessageSquare,
  Mic,
  MicOff,
  SlidersHorizontal,
  X,
  Award,
  PhoneCall,
  Gift,
  Heart,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { useFamily } from '../../hooks/useFamily';
import { FamilyFinanceTracker } from './components/FamilyFinanceTracker';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { CreateFamilyModal } from './components/CreateFamilyModal';
import { JoinFamilyModal } from './components/JoinFamilyModal';
import { FamilyChat } from './components/FamilyChat';

interface FamilyPreferences {
  showBriefing: boolean;
  showChat: boolean;
  showGroceries: boolean;
  showChores: boolean;
  showMealPlanner: boolean;
  showRecados: boolean;
  showSuggestions: boolean;
  showEmergencyContacts: boolean;
  showWishlist: boolean;
  showMembers: boolean;
}

const DEFAULT_FAMILY_PREFS: FamilyPreferences = {
  showBriefing: true,
  showChat: true,
  showGroceries: true,
  showChores: true,
  showMealPlanner: true,
  showRecados: true,
  showSuggestions: true,
  showEmergencyContacts: true,
  showWishlist: true,
  showMembers: true,
};

const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: '1', name: 'Dra. Maria (Pediatra)', role: 'Saúde Infantil', phone: '+351 912 345 678' },
  { id: '2', name: 'Escola Central', role: 'Educação', phone: '+351 213 456 789' },
  { id: '3', name: 'Seguro da Casa (Apólice #482)', role: 'Emergência Casa', phone: '+351 800 123 456' },
];

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

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface WishlistItem {
  id: string;
  item: string;
  member: string;
}

interface FamilySuggestion {
  id: string;
  title: string;
  author: string;
  votesFor: number;
  votesAgainst: number;
  status: 'pending' | 'approved' | 'rejected';
  userVoted?: 'for' | 'against' | null;
}

export const FamilyPage: React.FC = () => {
  const navigate = useNavigate();
  const { family, members, isLoading, isError, refetch, leaveFamily } = useFamily();
  const { showToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Voice Briefing state
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);

  // Quick voice input state for notes
  const [recadoText, setRecadoText] = useState('');
  const [recadosList, setRecadosList] = useState<string[]>([
    'Saí para as compras da semana, regresso por volta das 18:30.',
    'Lembrar de levar a carrinha à revisão na quinta-feira.',
  ]);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // Grocery List state
  const [newGrocery, setNewGrocery] = useState('');
  const [groceries, setGroceries] = useState<GroceryItem[]>([
    { id: '1', name: 'Leite meio gordo (2L)', completed: false },
    { id: '2', name: 'Pão fresco de cereais', completed: true },
    { id: '3', name: 'Fruta (Maçãs e Bananas)', completed: false },
    { id: '4', name: 'Detergente para a loiça', completed: false },
  ]);

  // Family Chores state
  const [chores, setChores] = useState<ChoreItem[]>([
    { id: '1', title: 'Lavar e arrumar a loiça', assignee: 'João', completed: true },
    { id: '2', title: 'Passear o cão ao fim da tarde', assignee: 'Maria', completed: false },
    { id: '3', title: 'Regar as plantas da varanda', assignee: 'Ana', completed: false },
    { id: '4', title: 'Levar o lixo e reciclagem', assignee: 'João', completed: false },
  ]);

  // Weekly Meal Planner state
  const [mealPlan] = useState<MealPlanDay[]>([
    { day: 'Segunda', lunch: 'Sopa de Legumes & Grelhados', dinner: 'Massa com Atum e Salada' },
    { day: 'Terça', lunch: 'Arroz de Frango', dinner: 'Peixe Assado no Forno' },
    { day: 'Quarta', lunch: 'Quiche de Espinafres', dinner: 'Hambúrgueres Caseiros' },
    { day: 'Quinta', lunch: 'Salmão com Batata Doce', dinner: 'Sopa & Tostas Mistas' },
    { day: 'Sexta', lunch: 'Bifes de Perú com Cogumelos', dinner: 'Noite da Pizza em Família 🍕' },
    { day: 'Sábado', lunch: 'Bacalhau com Natas', dinner: 'Churrasco de Fim de Semana' },
    { day: 'Domingo', lunch: 'Assado de Domingo', dinner: 'Jantar Leve & Fruta' },
  ]);

  // Emergency Contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_family_emergency_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_EMERGENCY_CONTACTS;
    } catch {
      return DEFAULT_EMERGENCY_CONTACTS;
    }
  });
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Wishlist state
  const [newWishItem, setNewWishItem] = useState('');
  const [newWishMember, setNewWishMember] = useState('');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    { id: '1', item: 'Livro de Aventuras para o Aniversário', member: 'João' },
    { id: '2', item: 'Sapatilhas de Corrida Tam. 38', member: 'Maria' },
  ]);

  // Family Suggestions & Voting state
  const [newSuggestion, setNewSuggestion] = useState('');
  const [suggestions, setSuggestions] = useState<FamilySuggestion[]>([
    {
      id: '1',
      title: 'Passeio de bicicleta em família no próximo sábado de manhã',
      author: 'Maria',
      votesFor: 3,
      votesAgainst: 0,
      status: 'approved',
      userVoted: 'for',
    },
    {
      id: '2',
      title: 'Instituir a Sexta-feira como Noite Oficial de Jogos de Tabuleiro',
      author: 'João',
      votesFor: 2,
      votesAgainst: 1,
      status: 'pending',
      userVoted: null,
    },
  ]);

  // Preferences
  const [familyPrefs, setFamilyPrefs] = useState<FamilyPreferences>(() => {
    try {
      const saved = localStorage.getItem('nexo_family_widgets');
      return saved ? { ...DEFAULT_FAMILY_PREFS, ...JSON.parse(saved), showChat: true } : DEFAULT_FAMILY_PREFS;
    } catch {
      return DEFAULT_FAMILY_PREFS;
    }
  });

  const updateFamilyPref = (key: keyof FamilyPreferences, value: boolean) => {
    const updated = { ...familyPrefs, [key]: value };
    setFamilyPrefs(updated);
    try {
      localStorage.setItem('nexo_family_widgets', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save family prefs', e);
    }
  };

  // Clean up speech
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 🌟 1. Voice Briefing for Family
  const speakFamilyBriefing = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Síntese de voz não suportada neste navegador.', 'error');
      return;
    }

    if (isPlayingBriefing) {
      window.speechSynthesis.cancel();
      setIsPlayingBriefing(false);
      return;
    }

    const familyName = family ? family.name : 'Família';
    const pendingGroceries = groceries.filter((g) => !g.completed).length;
    const pendingChores = chores.filter((c) => !c.completed).length;
    const todayMeal = mealPlan[0];

    let text = `Olá! Aqui está o resumo diário do grupo ${familyName}. `;
    text += `Temos ${members.length} membros no grupo. `;
    text += `Existem ${pendingGroceries} itens pendentes na lista de compras e ${pendingChores} tarefas domésticas por concluir hoje. `;
    if (todayMeal) {
      text += `Para o jantar de hoje está planeado: ${todayMeal.dinner}. `;
    }
    text += `Tenham um excelente dia em família!`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlayingBriefing(false);
    utterance.onerror = () => setIsPlayingBriefing(false);

    window.speechSynthesis.cancel();
    setIsPlayingBriefing(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyInviteCode = () => {
    if (!family?.invite_code) return;
    navigator.clipboard.writeText(family.invite_code);
    setCopied(true);
    showToast('Código de convite copiado!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLeaveFamily = async () => {
    if (!family) return;
    if (!window.confirm('Tem a certeza que deseja sair deste grupo familiar?')) return;
    try {
      await leaveFamily(family.id);
      showToast('Saiu do grupo familiar com sucesso.', 'info');
    } catch {
      showToast('Erro ao sair da família.', 'error');
    }
  };

  // Add Grocery
  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrocery.trim()) return;
    setGroceries([...groceries, { id: Date.now().toString(), name: newGrocery.trim(), completed: false }]);
    setNewGrocery('');
    showToast('Item adicionado à lista de compras!', 'success');
  };

  const handleAddGroceryDirect = (name: string) => {
    if (!name.trim()) return;
    setGroceries((prev) => [...prev, { id: Date.now().toString(), name: name.trim(), completed: false }]);
  };

  const handleAddChoreDirect = (title: string, assignee: string) => {
    if (!title.trim()) return;
    setChores((prev) => [...prev, { id: Date.now().toString(), title: title.trim(), assignee: assignee || 'Eu', completed: false }]);
  };

  // Toggle Grocery
  const toggleGrocery = (id: string) => {
    setGroceries(groceries.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  // Toggle Chore
  const toggleChore = (id: string) => {
    setChores(chores.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)));
  };

  // Add Note
  const handleAddRecado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recadoText.trim()) return;
    setRecadosList([recadoText.trim(), ...recadosList]);
    setRecadoText('');
    showToast('Recado publicado no mural da família!', 'success');
  };

  // Add Wishlist Item
  const handleAddWishItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishItem.trim()) return;
    setWishlist([
      ...wishlist,
      {
        id: Date.now().toString(),
        item: newWishItem.trim(),
        member: newWishMember.trim() || 'Alguém',
      },
    ]);
    setNewWishItem('');
    setNewWishMember('');
    showToast('Ideia de presente adicionada à Lista de Desejos!', 'success');
  };

  // Add Family Suggestion
  const handleAddSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;
    setSuggestions([
      ...suggestions,
      {
        id: Date.now().toString(),
        title: newSuggestion.trim(),
        author: 'Eu',
        votesFor: 1,
        votesAgainst: 0,
        status: 'pending',
        userVoted: 'for',
      },
    ]);
    setNewSuggestion('');
    showToast('Sugestão proposta à família!', 'success');
  };

  // Vote Suggestion
  const handleVoteSuggestion = (id: string, type: 'for' | 'against') => {
    setSuggestions(
      suggestions.map((s) => {
        if (s.id !== id) return s;
        let newFor = s.votesFor;
        let newAgainst = s.votesAgainst;
        let newVote: 'for' | 'against' | null = type;

        if (s.userVoted === type) {
          newVote = null;
          if (type === 'for') newFor -= 1;
          else newAgainst -= 1;
        } else {
          if (s.userVoted === 'for') newFor -= 1;
          if (s.userVoted === 'against') newAgainst -= 1;

          if (type === 'for') newFor += 1;
          else newAgainst += 1;
        }

        const totalMembers = Math.max(2, members.length);
        const newStatus = newFor >= Math.ceil(totalMembers / 2) ? 'approved' : 'pending';

        return {
          ...s,
          votesFor: newFor,
          votesAgainst: newAgainst,
          userVoted: newVote,
          status: newStatus,
        };
      })
    );
    showToast('Voto registado!', 'info');
  };

  // Emergency Contacts handlers
  const saveEmergencyContacts = (updated: EmergencyContact[]) => {
    setEmergencyContacts(updated);
    try {
      localStorage.setItem('nexo_family_emergency_contacts', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving emergency contacts', e);
    }
  };

  const handleStartAddContact = () => {
    setEditingContactId(null);
    setContactName('');
    setContactRole('');
    setContactPhone('');
    setIsAddingContact(true);
  };

  const handleStartEditContact = (contact: EmergencyContact) => {
    setIsAddingContact(false);
    setEditingContactId(contact.id);
    setContactName(contact.name);
    setContactRole(contact.role);
    setContactPhone(contact.phone);
  };

  const handleCancelContactForm = () => {
    setIsAddingContact(false);
    setEditingContactId(null);
    setContactName('');
    setContactRole('');
    setContactPhone('');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      showToast('Por favor preencha pelo menos o Nome e o Telefone.', 'error');
      return;
    }

    if (editingContactId) {
      const updated = emergencyContacts.map((c) =>
        c.id === editingContactId
          ? { ...c, name: contactName.trim(), role: contactRole.trim(), phone: contactPhone.trim() }
          : c
      );
      saveEmergencyContacts(updated);
      showToast('Contacto de emergência actualizado com sucesso!', 'success');
    } else {
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: contactName.trim(),
        role: contactRole.trim() || 'Emergência',
        phone: contactPhone.trim(),
      };
      saveEmergencyContacts([...emergencyContacts, newContact]);
      showToast('Novo contacto de emergência adicionado!', 'success');
    }

    handleCancelContactForm();
  };

  const handleDeleteContact = (id: string) => {
    const updated = emergencyContacts.filter((c) => c.id !== id);
    saveEmergencyContacts(updated);
    showToast('Contacto de emergência eliminado.', 'info');
  };

  // Voice dictation for notes
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Reconhecimento de voz não suportado neste navegador.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListeningVoice(true);
    recognition.onend = () => setIsListeningVoice(false);
    recognition.onerror = () => setIsListeningVoice(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setRecadoText(transcript);
      }
    };

    recognition.start();
  };

  if (isLoading) return <LoadingState label="A carregar dados da família..." />;
  if (isError) return <ErrorState message="Não foi possível carregar o grupo familiar." onRetry={() => refetch()} />;

  const roleBadges: Record<string, { variant: 'primary' | 'warning' | 'default'; label: string }> = {
    owner: { variant: 'primary', label: 'Proprietário (Owner)' },
    admin: { variant: 'warning', label: 'Administrador' },
    member: { variant: 'default', label: 'Membro' },
    viewer: { variant: 'default', label: 'Leitura' },
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Grupo Familiar & Casa
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {family ? family.name : 'Organize a sua vida familiar mantendo a privacidade dos seus dados.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="md"
            leftIcon={<ArrowLeft size={18} />}
          >
            Voltar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizeOpen(true)}
            leftIcon={<SlidersHorizontal size={15} />}
            className="text-xs"
          >
            Personalizar
          </Button>

          {!family && (
            <>
              <Button onClick={() => setIsJoinOpen(true)} variant="outline" size="md">
                Inserir Código
              </Button>
              <Button onClick={() => setIsCreateOpen(true)} variant="primary" size="md" leftIcon={<Plus size={20} />}>
                Criar Família
              </Button>
            </>
          )}
        </div>
      </div>

      {!family ? (
        <EmptyState
          icon={<Users size={28} />}
          title="Não pertence a nenhum grupo familiar"
          description="Crie o seu grupo familiar para ser o Proprietário (Owner) ou junte-se a um grupo existente através de um código de convite."
          actionLabel="+ Criar Grupo Familiar"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* 🌟 1. [CHAVE DE OURO] 🎙️ BRIEFING FAMILIAR POR VOZ & QUADRO CENTRAL */}
          {familyPrefs.showBriefing && (
            <Card
              variant="default"
              padding="lg"
              className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white border-none shadow-xl relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-400/20 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      NEXO Family Hub
                    </span>
                    <span className="text-xs text-slate-400">· Central da Casa</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Quadro Familiar do Dia: {family.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Grupo ativo com <span className="text-purple-300 font-bold">{members.length} membros</span>. 
                    Temos <span className="text-amber-300 font-bold">{groceries.filter((g) => !g.completed).length} compras pendentes</span> e 
                    <span className="text-emerald-300 font-bold"> {chores.filter((c) => !c.completed).length} tarefas domésticas</span> para hoje.
                  </p>
                </div>

                {/* Botão de Áudio Briefing */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 space-y-3 min-w-[220px]">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-200 uppercase tracking-wider">
                    {isPlayingBriefing ? (
                      <>
                        <Volume2 size={16} className="text-emerald-400 animate-pulse" />
                        <span>A Ler Resumo...</span>
                      </>
                    ) : (
                      <>
                        <VolumeX size={16} className="text-slate-400" />
                        <span>Resumo por Voz</span>
                      </>
                    )}
                  </div>

                  <Button
                    variant={isPlayingBriefing ? 'secondary' : 'primary'}
                    size="md"
                    onClick={speakFamilyBriefing}
                    className="w-full text-xs font-bold"
                    leftIcon={isPlayingBriefing ? <Pause size={16} /> : <Play size={16} />}
                  >
                    {isPlayingBriefing ? 'Pausar Áudio' : '▶ Ouvir Resumo Familiar'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 📊 GESTÃO DE GASTOS & ORÇAMENTO FAMILIAR */}
          <FamilyFinanceTracker />

          {/* 💬 CHAT FAMILIAR INTELIGENTE DA CASA */}
          {familyPrefs.showChat && (
            <FamilyChat
              currentUserName="Eu"
              groceries={groceries}
              onAddGrocery={handleAddGroceryDirect}
              chores={chores}
              onAddChore={handleAddChoreDirect}
              mealPlan={mealPlan}
            />
          )}

          {/* 💡 SUGESTÕES & VOTAÇÃO FAMILIAR */}
          {familyPrefs.showSuggestions && (
            <Card variant="default" padding="lg" className="space-y-4 border-indigo-200 dark:border-indigo-900">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <span>Propostas & Votação Familiar ("Assembleia da Casa")</span>
                </div>
                <Badge variant="warning" size="sm">
                  {suggestions.filter((s) => s.status === 'pending').length} em votação
                </Badge>
              </div>

              {/* Formulário de Proposta */}
              <form onSubmit={handleAddSuggestion} className="flex gap-2">
                <Input
                  placeholder="Propor uma nova ideia para a família... Ex: Passeio no próximo domingo"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  className="text-xs min-h-[40px]"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!newSuggestion.trim()} className="shrink-0">
                  + Propor Ideia
                </Button>
              </form>

              {/* Lista de Sugestões em Votação */}
              <div className="space-y-3 pt-1">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{s.title}</span>
                        {s.status === 'approved' ? (
                          <Badge variant="success" size="sm">✅ Aprovado em Família</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">⏳ Em Votação</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Proposto por: {s.author}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVoteSuggestion(s.id, 'for')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          s.userVoted === 'for'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                        }`}
                      >
                        <ThumbsUp size={14} />
                        <span>Aprovar ({s.votesFor})</span>
                      </button>

                      <button
                        onClick={() => handleVoteSuggestion(s.id, 'against')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          s.userVoted === 'against'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-100 dark:hover:bg-rose-950/60'
                        }`}
                      >
                        <ThumbsDown size={14} />
                        <span>({s.votesAgainst})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 💬 MURAL DE RECADOS DA FAMÍLIA */}
          {familyPrefs.showRecados && (
            <Card variant="default" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-sm">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span>Mural de Recados da Casa</span>
                </div>
                <span className="text-xs text-slate-400">Texto ou Voz</span>
              </div>

              <form onSubmit={handleAddRecado} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Deixar um recado rápido para a família..."
                    value={recadoText}
                    onChange={(e) => setRecadoText(e.target.value)}
                    className="pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={startVoiceInput}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-purple-600 transition-colors ${
                      isListeningVoice ? 'text-rose-500 animate-pulse' : ''
                    }`}
                    title="Ditado por Voz"
                  >
                    {isListeningVoice ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                </div>
                <Button type="submit" variant="primary" size="sm" disabled={!recadoText.trim()} leftIcon={<Plus size={16} />}>
                  Publicar
                </Button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {recadosList.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2">
                    <span className="text-purple-500 font-bold shrink-0">📌</span>
                    <span className="font-semibold leading-relaxed">{note}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 🛒 COMPRAS & 🧹 TAREFAS DOMÉSTICAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Compras */}
            {familyPrefs.showGroceries && (
              <Card variant="default" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                    <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Lista de Compras da Casa</span>
                  </div>
                  <Badge variant="primary" size="sm">
                    {groceries.filter((g) => !g.completed).length} pendentes
                  </Badge>
                </div>

                <form onSubmit={handleAddGrocery} className="flex gap-2">
                  <Input
                    placeholder="Adicionar item (Ex: Ovos, Azeite)..."
                    value={newGrocery}
                    onChange={(e) => setNewGrocery(e.target.value)}
                    className="min-h-[40px] text-xs"
                  />
                  <Button type="submit" variant="secondary" size="sm" className="shrink-0 min-h-[40px]">
                    + Item
                  </Button>
                </form>

                <div className="space-y-2">
                  {groceries.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleGrocery(item.id)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-2.5 text-xs font-semibold">
                        {item.completed ? (
                          <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                        <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                          {item.name}
                        </span>
                      </div>
                      {item.completed && <Badge variant="success" size="sm">Comprado</Badge>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Tarefas Domésticas */}
            {familyPrefs.showChores && (
              <Card variant="default" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Tarefas Domésticas & Distribuição</span>
                  </div>
                  <Badge variant="warning" size="sm">
                    {chores.filter((c) => !c.completed).length} para fazer
                  </Badge>
                </div>

                <div className="space-y-2">
                  {chores.map((chore) => (
                    <div
                      key={chore.id}
                      onClick={() => toggleChore(chore.id)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-2.5 text-xs font-semibold">
                        {chore.completed ? (
                          <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                        <span className={chore.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                          {chore.title}
                        </span>
                      </div>
                      <Badge variant={chore.completed ? 'success' : 'default'} size="sm">
                        👤 {chore.assignee}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* 🍲 PLANIFICADOR DE REFEIÇÕES DA SEMANA */}
          {familyPrefs.showMealPlanner && (
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                  <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Planificador de Refeições da Semana ("O que vamos jantar?")</span>
                </div>
                <Badge variant="primary" size="sm">Menu Semanal</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {mealPlan.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block border-b border-slate-200 dark:border-slate-700 pb-1">
                      {m.day}
                    </span>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Almoço</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={m.lunch}>{m.lunch}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Jantar</span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 truncate" title={m.dinner}>{m.dinner}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ☎️ CONTACTOS DE EMERGÊNCIA & 🎁 LISTA DE DESEJOS DA FAMÍLIA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contactos de Emergência */}
            {familyPrefs.showEmergencyContacts && (
              <Card variant="default" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                    <PhoneCall className="w-5 h-5 text-rose-500" />
                    <span>Contactos Rápidos de Emergência da Casa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartAddContact}
                      leftIcon={<Plus size={14} />}
                      className="text-xs"
                    >
                      + Contacto
                    </Button>
                  </div>
                </div>

                {/* Formulário de Adicionar / Editar Contacto */}
                {(isAddingContact || editingContactId) && (
                  <form onSubmit={handleSaveContact} className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3">
                    <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      {editingContactId ? '✏️ Editar Contacto de Emergência' : '➕ Novo Contacto de Emergência'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Nome (Ex: Dra. Maria)"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="text-xs min-h-[36px]"
                        required
                      />
                      <Input
                        placeholder="Função (Ex: Pediatra)"
                        value={contactRole}
                        onChange={(e) => setContactRole(e.target.value)}
                        className="text-xs min-h-[36px]"
                      />
                      <Input
                        placeholder="Telefone (Ex: +351 912 345 678)"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="text-xs min-h-[36px]"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelContactForm}
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" variant="primary" size="sm" className="text-xs bg-rose-600 hover:bg-rose-700 text-white">
                        Guardar Contacto
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">{contact.name}</span>
                        <span className="text-[10px] text-slate-500 block">{contact.role}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${contact.phone}`}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <PhoneCall size={12} />
                          <span>{contact.phone}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleStartEditContact(contact)}
                          className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors"
                          title="Editar número"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-300 transition-colors"
                          title="Eliminar contacto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Lista de Desejos & Presentes */}
            {familyPrefs.showWishlist && (
              <Card variant="default" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                    <Gift className="w-5 h-5 text-purple-500" />
                    <span>Lista de Desejos & Presentes</span>
                  </div>
                  <Badge variant="primary" size="sm">Ideias</Badge>
                </div>

                <form onSubmit={handleAddWishItem} className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Membro (Ex: João)"
                    value={newWishMember}
                    onChange={(e) => setNewWishMember(e.target.value)}
                    className="text-xs min-h-[38px]"
                  />
                  <Input
                    placeholder="Ideia de presente..."
                    value={newWishItem}
                    onChange={(e) => setNewWishItem(e.target.value)}
                    className="col-span-2 text-xs min-h-[38px]"
                  />
                  <Button type="submit" variant="secondary" size="sm" className="col-span-3 min-h-[36px] text-xs">
                    + Adicionar Ideia de Presente
                  </Button>
                </form>

                <div className="space-y-2">
                  {wishlist.map((wish) => (
                    <div
                      key={wish.id}
                      className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Heart size={14} className="text-purple-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{wish.item}</span>
                      </div>
                      <Badge variant="primary" size="sm">Para: {wish.member}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Card com Detalhes do Grupo & Convite */}
          <Card variant="default" padding="lg" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Grupo Familiar Activo
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{family.name}</h2>
              </div>

              <Button onClick={handleLeaveFamily} variant="danger" size="sm" leftIcon={<LogOut size={16} />}>
                Sair do Grupo
              </Button>
            </div>

            {/* Código de Convite Real */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Key size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Código Único de Convite</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Partilhe este código para convidar novos membros.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xl font-mono font-extrabold tracking-widest text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  {family.invite_code}
                </span>
                <Button onClick={handleCopyInviteCode} variant="primary" size="sm">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Lista de Membros & Permissões */}
          {familyPrefs.showMembers && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span>Membros da Família ({members.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((m) => {
                  const badge = roleBadges[m.role] || roleBadges.member;
                  const name = m.profiles?.full_name || 'Membro da Família';

                  return (
                    <Card key={m.id} variant="default" padding="md" className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={name} src={m.profiles?.avatar_url} size="md" />
                        <div className="truncate">
                          <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                            {name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block">
                            Aderiu em {new Intl.DateTimeFormat('pt-PT').format(new Date(m.joined_at))}
                          </span>
                        </div>
                      </div>

                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Banner Informativo sobre Isolamento RLS */}
          <Card variant="flat" padding="md" className="bg-slate-100 dark:bg-slate-800/80 space-y-2 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Lock size={18} />
              <span>Garantia de Isolamento de Dados Privados (PostgreSQL RLS)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O facto de pertencer a um grupo familiar <strong>não concede acesso automático aos seus dados privados</strong>. Apenas registos explicitamente marcados como partilhados são acessíveis aos restantes membros da família.
            </p>
          </Card>
        </div>
      )}

      {/* MODAL DE PERSONALIZAÇÃO DA FAMÍLIA */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                <SlidersHorizontal size={18} className="text-purple-600 dark:text-purple-400" />
                <span>Personalizar Visibilidade da Família</span>
              </div>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {[
                { id: 'showBriefing', label: '🎙️ Resumo Familiar por Voz & Quadro Central' },
                { id: 'showChat', label: '💬 Chat & Conversas Inteligentes da Casa (@nexo)' },
                { id: 'showSuggestions', label: '💡 Propostas & Votação Familiar ("Assembleia")' },
                { id: 'showRecados', label: '💬 Mural de Recados da Casa' },
                { id: 'showGroceries', label: '🛒 Lista de Compras da Casa' },
                { id: 'showChores', label: '🧹 Tarefas Domésticas & Atribuições' },
                { id: 'showMealPlanner', label: '🍲 Planificador de Refeições da Semana' },
                { id: 'showEmergencyContacts', label: '☎️ Contactos Rápidos de Emergência' },
                { id: 'showWishlist', label: '🎁 Lista de Desejos & Presentes' },
                { id: 'showMembers', label: '👥 Membros da Família & Permissões' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={(familyPrefs as any)[item.id]}
                    onChange={(e) => updateFamilyPref(item.id as keyof FamilyPreferences, e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                  />
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setIsCustomizeOpen(false)}
              >
                Sair
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setIsCustomizeOpen(false)}
              >
                Guardar Preferências
              </Button>
            </div>
          </div>
        </div>
      )}

      <CreateFamilyModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinFamilyModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};

export default FamilyPage;
