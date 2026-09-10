import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, Moon, Sun, Eye, Volume2, Bell, Database, 
  Download, Trash2, LogOut, Check, Sparkles, Smartphone, VolumeX, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { offlineStore } from '../../lib/offlineStore';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isGuest, signOut, refreshProfile } = useAuth();
  const { theme, toggleTheme, isSimpleMode, toggleSimpleMode } = useTheme();
  const { fontScale, increaseFontScale, decreaseFontScale, resetFontScale } = useAccessibility();
  const { showToast } = useToast();

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Settings state in LocalStorage
  const [voiceRate, setVoiceRate] = useState<number>(() => {
    return Number(localStorage.getItem('nexo_global_voice_rate')) || 1.0;
  });

  const [soundEffects, setSoundEffects] = useState<boolean>(() => {
    return localStorage.getItem('nexo_sound_effects') !== 'false';
  });

  const [dailyReminder, setDailyReminder] = useState<boolean>(() => {
    return localStorage.getItem('nexo_daily_reminder') === 'true';
  });

  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    return localStorage.getItem('nexo_reduce_motion') === 'true';
  });

  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('nexo_accent_color') || 'indigo';
  });

  // Offline Pending Count
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  useEffect(() => {
    if (user?.id) {
      offlineStore.getPendingMutations(user.id).then((mutations) => {
        setPendingOfflineCount(mutations.length);
      }).catch(() => {});
    }
  }, [user]);

  // Update Profile Name
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Por favor introduza o seu nome.', 'error');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      if (user?.id) {
        const { error } = await (supabase as any)
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id);

        if (error) throw error;
        await refreshProfile();
        showToast('Perfil actualizado com sucesso!', 'success');
      } else {
        showToast('Perfil em modo visitante guardado localmente.', 'info');
      }
    } catch {
      showToast('Erro ao actualizar perfil.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Notification Permissions
  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      showToast('Notificações não são suportadas neste navegador.', 'error');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      showToast('Notificações ativadas com sucesso!', 'success');
      setDailyReminder(true);
      localStorage.setItem('nexo_daily_reminder', 'true');
    } else {
      showToast('Permissão de notificações negada.', 'info');
    }
  };

  // Export Data JSON
  const handleExportData = async () => {
    try {
      showToast('A preparar ficheiro de dados...', 'info');

      let userTasks = [];
      let userGoals = [];
      let userLists = [];

      if (user?.id) {
        const { data: tasks } = await (supabase as any).from('tasks').select('*');
        const { data: goals } = await (supabase as any).from('goals').select('*');
        const { data: lists } = await (supabase as any).from('lists').select('*');
        userTasks = tasks || [];
        userGoals = goals || [];
        userLists = lists || [];
      }

      const backupData = {
        app: 'NEXO App',
        version: '2.5.0',
        exportedAt: new Date().toISOString(),
        user: {
          id: user?.id,
          email: user?.email,
          fullName,
          isGuest,
        },
        data: {
          tasks: userTasks,
          goals: userGoals,
          lists: userLists,
          preferences: {
            theme,
            isSimpleMode,
            fontScale,
            accentColor,
            soundEffects,
            voiceRate,
          },
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexo-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Dados exportados com sucesso!', 'success');
    } catch {
      showToast('Erro ao exportar dados.', 'error');
    }
  };

  // Clear Local Cache
  const handleClearCache = async () => {
    if (!window.confirm('Tem a certeza que deseja limpar os dados em cache local?')) return;
    try {
      await offlineStore.clearAllOfflineData();
      setPendingOfflineCount(0);
      showToast('Cache local limpa com sucesso.', 'success');
    } catch {
      showToast('Erro ao limpar cache.', 'error');
    }
  };

  // Accent Colors list
  const accentColors = [
    { id: 'indigo', label: 'Índigo NEXO', bg: 'bg-indigo-600' },
    { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-600' },
    { id: 'violet', label: 'Violeta', bg: 'bg-violet-600' },
    { id: 'amber', label: 'Âmbar Sol', bg: 'bg-amber-600' },
    { id: 'rose', label: 'Rosa Vivo', bg: 'bg-rose-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30">
                NEXO System v2.5.0
              </Badge>
              {isGuest ? (
                <Badge variant="warning">Sessão Convidado</Badge>
              ) : (
                <Badge variant="success">Conta Ativa</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Definições & Acessibilidade
            </h1>

            <p className="text-sm text-indigo-200/80">
              Personalize o tema, voz do assistente, acessibilidade e gestão da sua conta
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft size={18} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold"
            >
              Voltar
            </Button>

            <Button
              onClick={signOut}
              variant="outline"
              size="md"
              leftIcon={<LogOut size={18} />}
              className="bg-white/10 hover:bg-rose-600 hover:border-rose-600 text-white border-white/20 transition-all"
            >
              Terminar Sessão
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de Secções de Definições */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coluna 1 & 2: Definições Principais */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Perfil do Utilizador */}
          <Card variant="default" padding="md" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <UserIcon size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Perfil de Utilizador
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerencie as suas informações pessoais de identificação.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Nome Completo"
                placeholder="O seu nome..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Associado
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || 'Sessão Convidado (Local)'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ID da Conta
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.id ? `${user.id.substring(0, 12)}...` : 'Local Guest'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isUpdatingProfile}
                  leftIcon={<Check size={16} />}
                >
                  Guardar Alterações do Perfil
                </Button>
              </div>
            </form>
          </Card>

          {/* 2. Aparência & Tema */}
          <Card variant="default" padding="md" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Aparência & Visual
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ajuste o modo escuro, contraste e paleta de cores.
                </p>
              </div>
            </div>

            {/* Dark Mode & Simple Mode Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Dark Mode Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    Modo Escuro (Dark Mode)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {theme === 'dark' ? 'Ativado' : 'Desativado'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 text-xs border ${
                    theme === 'dark'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                </button>
              </div>

              {/* Simple Mode Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    Modo Simples (Alto Contraste)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fontes grandes e alto contraste
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={isSimpleMode}
                  onChange={toggleSimpleMode}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>

            </div>

            {/* Paleta de Cores de Destaque */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Cor de Destaque Principal
              </label>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      setAccentColor(color.id);
                      localStorage.setItem('nexo_accent_color', color.id);
                      showToast(`Cor de destaque alterada para ${color.label}!`, 'info');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 border ${color.bg} ${
                      accentColor === color.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {accentColor === color.id && <Check size={14} />}
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </Card>

          {/* 3. Acessibilidade & Síntese de Voz */}
          <Card variant="default" padding="md" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Eye size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Acessibilidade & Voz do Assistente `@nexo`
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Escala de texto, velocidad da fala e redução de animações.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Escala de Fonte */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Tamanho do Texto Global ({Math.round(fontScale * 100)}%)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={decreaseFontScale} disabled={fontScale <= 0.85}>
                      A-
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetFontScale}>
                      100%
                    </Button>
                    <Button variant="outline" size="sm" onClick={increaseFontScale} disabled={fontScale >= 1.45}>
                      A+
                    </Button>
                  </div>
                </div>
              </div>

              {/* Velocidade da Voz */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Volume2 size={16} className="text-indigo-500" />
                    Velocidade de Fala da Voz IA ({voiceRate}x)
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (!('speechSynthesis' in window)) return;
                      const ut = new SpeechSynthesisUtterance("Esta é a velocidade de fala configurada no Nexo.");
                      ut.lang = 'pt-PT';
                      ut.rate = voiceRate;
                      window.speechSynthesis.speak(ut);
                    }}
                    className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Testar Voz 🔊
                  </button>
                </div>

                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.25"
                  value={voiceRate}
                  onChange={(e) => {
                    const rate = Number(e.target.value);
                    setVoiceRate(rate);
                    localStorage.setItem('nexo_global_voice_rate', rate.toString());
                  }}
                  className="w-full accent-indigo-600"
                />

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Lento (0.75x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Rápido (1.5x)</span>
                </div>
              </div>

              {/* Reduce Motion */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    Reduzir Animações & Efeitos Visuais
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ideal para economizar bateria e suavizar transições
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={(e) => {
                    setReduceMotion(e.target.checked);
                    localStorage.setItem('nexo_reduce_motion', String(e.target.checked));
                    showToast(e.target.checked ? 'Animações reduzidas.' : 'Animações ativadas.', 'info');
                  }}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>

            </div>
          </Card>

        </div>

        {/* Coluna 3: Notificações, Dados & Sistema */}
        <div className="space-y-6">

          {/* Notificações & Alertas */}
          <Card variant="default" padding="md" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Bell size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Notificações & Alertas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sons e avisos do sistema.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Efeitos Sonoros de Sucesso</span>
                <button
                  onClick={() => {
                    setSoundEffects(!soundEffects);
                    localStorage.setItem('nexo_sound_effects', String(!soundEffects));
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"
                >
                  {soundEffects ? <Volume2 size={18} className="text-indigo-600" /> : <VolumeX size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">Lembrete Diário no Navegador</span>
                <Button
                  onClick={handleRequestNotifications}
                  variant="outline"
                  size="sm"
                  leftIcon={<Smartphone size={14} />}
                >
                  {dailyReminder ? 'Ativado' : 'Ativar'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Dados & Armazenamento Offline */}
          <Card variant="default" padding="md" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Database size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Dados & Backup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exportação de dados e cache.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Alterações Pendentes Offline</span>
                  <Badge variant={pendingOfflineCount > 0 ? 'warning' : 'success'}>
                    {pendingOfflineCount} pendentes
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Os seus dados são sincronizados automaticamente assim que recuperar a ligação à Internet.
                </p>
              </div>

              <Button
                onClick={handleExportData}
                variant="secondary"
                size="md"
                leftIcon={<Download size={16} />}
                className="w-full justify-center font-bold"
              >
                Exportar Todos os Dados (JSON)
              </Button>

              <Button
                onClick={handleClearCache}
                variant="outline"
                size="sm"
                leftIcon={<Trash2 size={16} />}
                className="w-full justify-center text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900"
              >
                Limpar Cache Local
              </Button>
            </div>
          </Card>

          {/* Informações do Sistema */}
          <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
              <Sparkles size={16} className="text-indigo-500" />
              NEXO • Inteligência Familiar & Pessoal
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Versão 2.5.0 • Todos os direitos reservados.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
