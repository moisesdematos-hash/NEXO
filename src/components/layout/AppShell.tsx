import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Sparkles, Type, ArrowLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { SidebarNav } from './SidebarNav';
import { BottomNav } from './BottomNav';
import { ConnectivityBanner } from './ConnectivityBanner';
import { PWAInstallBanner } from './PWAInstallBanner';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { ToastProvider } from '../ui/Toast';
import { useSupabaseRealtime } from '../../hooks/useSupabaseRealtime';
import { syncEngine } from '../../services/syncEngine';
import { aiToolExecutor } from '../../services/aiToolExecutor';
import { AIChatDrawer } from '../../features/ai/AIChatDrawer';

export const AppShell: React.FC = () => {
  const { theme, toggleTheme, isSimpleMode, toggleSimpleMode } = useTheme();
  const { increaseFontScale, resetFontScale } = useAccessibility();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const isSubRoute = location.pathname !== '/app' && location.pathname !== '/app/';

  // Enable selective Supabase Realtime updates
  useSupabaseRealtime();

  useEffect(() => {
    syncEngine.setQueryClient(queryClient);
    aiToolExecutor.setQueryClient(queryClient);

    // Initial sync trigger on shell mount if online
    if (navigator.onLine) {
      syncEngine.syncPendingMutations();
    }
  }, [queryClient]);

  return (
    <ToastProvider>
      <ConnectivityBanner />
      <PWAInstallBanner />
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        
        {/* Desktop Sidebar Navigation */}
        <SidebarNav />

        {/* Main Content & Top Control Bar */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          
          {/* Top Control Bar (Quick Accessibility & Controls) */}
          <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            
            {/* Mobile Brand Title / Voltar */}
            <div className="flex items-center gap-2">
              {isSubRoute && (
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400 font-extrabold text-xs transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
                  title="Voltar para a página anterior"
                  aria-label="Voltar"
                >
                  <ArrowLeft size={16} />
                  <span>Voltar</span>
                </button>
              )}

              <div className="lg:hidden flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2" title="Ir para a Página de Boas-Vindas">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                    N
                  </div>
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white">NEXO</span>
                </Link>
              </div>
            </div>

            {/* Desktop Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Link to="/app" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                NEXO Hub
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white capitalize">
                {location.pathname.replace('/app/', '').replace('/app', 'Painel Principal')}
              </span>
            </div>

            {/* Accessibility & Theme Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                  aria-label="Alternar Tema Escuro e Claro"
                >
                  {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
                </button>

                <button
                  onClick={toggleSimpleMode}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                    isSimpleMode
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                  title="Modo Simplificado"
                  aria-label="Alternar Modo Simplificado"
                >
                  <Sparkles size={16} />
                  <span className="hidden sm:inline">Simples</span>
                </button>

                <button
                  onClick={increaseFontScale}
                  onDoubleClick={resetFontScale}
                  className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="Aumentar Fonte (+A)"
                  aria-label="Aumentar Fonte"
                >
                  <Type size={18} />
                </button>
              </div>
            </div>

          </header>

          {/* Dynamic Page Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </main>

        </div>

        {/* Mobile Fixed Bottom Navigation */}
        <BottomNav />

        {/* AI Chat Drawer & Floating Assistant */}
        <AIChatDrawer />

      </div>
    </ToastProvider>
  );
};

export default AppShell;
