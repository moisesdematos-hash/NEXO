import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Users,
  Target,
  ListChecks,
  Settings,
  HelpCircle,
  ShieldCheck,
  LogOut,
  Sparkles,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { NexoLogo } from '../ui/NexoLogo';

export const SidebarNav: React.FC = () => {
  const { profile, user, isGuest, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme, isSimpleMode, toggleSimpleMode } = useTheme();
  const navigate = useNavigate();

  const userName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Convidado');

  const mainNavItems = [
    { to: '/app', label: 'Início', icon: <LayoutDashboard size={20} />, end: true },
    { to: '/app/calendar', label: 'Agenda', icon: <Calendar size={20} /> },
    { to: '/app/learning', label: 'Aprender', icon: <GraduationCap size={20} /> },
    { to: '/app/students', label: 'Estudantes', icon: <BookOpen size={20} /> },
    { to: '/app/family', label: 'Família', icon: <Users size={20} /> },
    { to: '/app/goals', label: 'Objectivos', icon: <Target size={20} /> },
    { to: '/app/lists', label: 'Listas', icon: <ListChecks size={20} /> },
  ];

  const secondaryNavItems = [
    { to: '/app/manual', label: 'Manual de Uso', icon: <BookOpen size={20} /> },
    { to: '/app/help', label: 'Ajuda & FAQ', icon: <HelpCircle size={20} /> },
    { to: '/app/settings', label: 'Definições', icon: <Settings size={20} /> },
    ...(isAdmin ? [{ to: '/app/admin', label: 'Administração', icon: <ShieldCheck size={20} /> }] : []),
  ];

  const [pulsingTabs, setPulsingTabs] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const handlePulse = (e: any) => {
      const tabPath = e.detail?.tabPath;
      if (tabPath) {
        setPulsingTabs((prev) => ({ ...prev, [tabPath]: true }));
        setTimeout(() => {
          setPulsingTabs((prev) => ({ ...prev, [tabPath]: false }));
        }, 7000);
      }
    };
    window.addEventListener('nexo_pulse_tab', handlePulse);
    return () => window.removeEventListener('nexo_pulse_tab', handlePulse);
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 shrink-0 select-none">
      
      {/* Brand Header - Link para a Página de Boas-Vindas */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Link to="/" className="group flex items-center" title="Ir para a Página de Boas-Vindas">
          <NexoLogo variant="full" size="md" />
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Main Menu */}
        <div className="space-y-1">
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Organização
          </span>
          {mainNavItems.map((item) => {
            const isPulsing = pulsingTabs[item.to];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative ${
                    isPulsing
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-extrabold border-2 border-emerald-500 shadow-xl animate-pulse ring-4 ring-emerald-500/40 scale-105'
                      : isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isPulsing && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500 text-white animate-bounce">
                    Novo!
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Secondary Menu */}
        <div className="space-y-1">
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Preferências
          </span>
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-150 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar Modo Escuro / Claro"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-amber-400 shrink-0" />
            ) : (
              <Moon size={20} className="text-slate-600 dark:text-slate-400 shrink-0" />
            )}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button
            onClick={toggleSimpleMode}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
              isSimpleMode
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles size={20} className="text-amber-500 shrink-0" />
            <span>{isSimpleMode ? 'Modo Simples (On)' : 'Modo Simples'}</span>
          </button>
        </div>

      </div>

      {/* User Profile Card at Bottom of Sidebar */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar name={userName} src={profile?.avatar_url} size="md" />
            <div className="truncate">
              <span className="block font-bold text-sm text-slate-900 dark:text-white truncate">
                {userName}
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                {isGuest ? 'Convidado' : user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Terminar Sessão"
            aria-label="Terminar Sessão"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

    </aside>
  );
};
