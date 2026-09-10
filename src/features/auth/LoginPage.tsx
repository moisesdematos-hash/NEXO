import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HeaderNav } from '../../components/layout/HeaderNav';
import { PhoneOTPModal } from './PhoneOTPModal';

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor preencha o email e a password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const { error } = await signInWithEmail(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg('Credenciais inválidas. Verifique o seu email e a password.');
    } else {
      navigate('/app');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setGoogleLoading(false);
      setErrorMsg(`Erro ao iniciar sessão com Google: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <HeaderNav />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Header da Página */}
          <div className="space-y-2 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2"
            >
              <ArrowLeft size={14} />
              <span>Voltar à Página Inicial</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Entrar no NEXO
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aceda ao seu hub digital pessoal e familiar.
            </p>
          </div>

          {/* Erro Feedback */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulário de Email + Password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="o.teu.email@exemplo.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/reset-password"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Esqueceu-se da password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              <span>{loading ? 'A autenticar...' : 'Entrar'}</span>
            </button>
          </form>

          {/* Divisor */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
            <span className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-400 font-medium uppercase absolute">
              ou
            </span>
          </div>

          {/* Métodos Alternativos de Autenticação */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              type="button"
              className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer shadow-xs"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.0 10.04.0 12s.47 3.8 1.29 5.42l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? 'A redirecionar para o Google...' : 'Continuar com Google'}</span>
            </button>

            <button
              onClick={() => setPhoneModalOpen(true)}
              type="button"
              className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-3"
            >
              <Phone size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Entrar com Telefone (SMS OTP)</span>
            </button>
          </div>

          {/* Footer de Registo */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
            Ainda não tem conta?{' '}
            <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Criar conta gratuitamente
            </Link>
          </p>

        </div>
      </main>

      <PhoneOTPModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onSuccess={() => {
          setPhoneModalOpen(false);
          navigate('/app');
        }}
      />
    </div>
  );
};

export default LoginPage;
