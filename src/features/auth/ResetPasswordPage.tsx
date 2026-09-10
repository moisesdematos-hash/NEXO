import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HeaderNav } from '../../components/layout/HeaderNav';

export const ResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor introduza o seu email.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setErrorMsg(`Erro ao enviar email de recuperação: ${error.message}`);
    } else {
      setSuccessMsg('Enviámos um link de recuperação para o seu email. Verifique a sua caixa de entrada.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <HeaderNav />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="space-y-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Login</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Recuperar Password
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Introduza o seu email registado para receber um link de redefinição.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reset-email"
                  type="email"
                  placeholder="o.teu.email@exemplo.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <Send size={18} />
              <span>{loading ? 'A enviar...' : 'Enviar Link de Recuperação'}</span>
            </button>
          </form>

        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
