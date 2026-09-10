import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Sparkles, Type, Menu, X, LogIn, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { NexoLogo } from '../ui/NexoLogo';

export const HeaderNav: React.FC = () => {
  const { theme, toggleTheme, isSimpleMode, toggleSimpleMode } = useTheme();
  const { increaseFontScale, resetFontScale } = useAccessibility();
  const { user, isGuest, signInAsGuest, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const navigate = useNavigate();

  const handleGuestEntry = async () => {
    setGuestLoading(true);
    const { error } = await signInAsGuest();
    setGuestLoading(false);
    if (!error) {
      navigate('/app');
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-2" aria-label="NEXO Páginal Inicial">
          <NexoLogo variant="full" size="md" />
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => scrollToSection('recursos')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
          >
            Recursos
          </button>
          <button
            onClick={() => scrollToSection('como-funciona')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
          >
            Como Funciona
          </button>
          <button
            onClick={() => scrollToSection('testemunhos')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
          >
            Testemunhos
          </button>
          <button
            onClick={() => scrollToSection('precos')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 flex items-center gap-1"
          >
            <span>Planos</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              Grátis
            </span>
          </button>
          <button
            onClick={() => scrollToSection('calculadora')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
          >
            Calculadora ROI
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
          >
            FAQ
          </button>
        </nav>

        {/* Desktop Controls & Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Accessibility & Theme Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title="Modo Simplificado (Legibilidade Ampliada)"
              aria-label="Alternar Modo Simplificado"
            >
              <Sparkles size={16} />
              <span className="hidden xl:inline">Simples</span>
            </button>

            <button
              onClick={increaseFontScale}
              onDoubleClick={resetFontScale}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Aumentar Fonte (+A)"
              aria-label="Aumentar Tamanho de Fonte"
            >
              <Type size={18} />
            </button>
          </div>

          {/* Auth Action Buttons */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/app"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <UserCheck size={18} />
                <span>Entrar no NEXO {isGuest && '(Convidado)'}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGuestEntry}
                disabled={guestLoading}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs lg:text-sm transition-colors flex items-center gap-1.5"
              >
                {guestLoading ? (
                  'A carregar...'
                ) : (
                  <>
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>Convidado (Sem Registo)</span>
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors flex items-center gap-1"
              >
                <LogIn size={16} />
                <span>Entrar</span>
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1 group"
              >
                <span>Criar Conta</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200"
            aria-label="Alternar Tema"
          >
            {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Abrir Menu Principal"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-4 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-2 font-medium text-slate-700 dark:text-slate-200 text-sm">
            <button
              onClick={() => scrollToSection('recursos')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Recursos Principais
            </button>
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection('testemunhos')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Testemunhos
            </button>
            <button
              onClick={() => scrollToSection('precos')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
            >
              <span>Planos & Preços</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">
                Grátis
              </span>
            </button>
            <button
              onClick={() => scrollToSection('calculadora')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Calculadora ROI
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Perguntas Frequentes
            </button>
          </nav>

          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Acessibilidade:</span>
            <div className="flex gap-2">
              <button
                onClick={toggleSimpleMode}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  isSimpleMode ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                Modo Simples
              </button>
              <button
                onClick={increaseFontScale}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700"
              >
                + Fonte
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {user ? (
              <>
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-base shadow"
                >
                  Entrar no NEXO
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
                >
                  Sair da Conta
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-base shadow"
                >
                  Criar Conta Gratuitamente
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleGuestEntry();
                  }}
                  disabled={guestLoading}
                  className="w-full text-center py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium text-base flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span>{guestLoading ? 'A carregar...' : 'Experimentar como Convidado'}</span>
                </button>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-medium text-base"
                >
                  Já tenho conta (Entrar)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
