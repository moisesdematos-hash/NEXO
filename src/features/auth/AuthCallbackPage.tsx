import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;

        if (hash.includes('error=') || search.includes('error=')) {
          const params = new URLSearchParams(search || (hash.startsWith('#') ? hash.substring(1) : hash));
          const desc = params.get('error_description') || params.get('error') || 'Erro na autenticação com o Google.';
          if (mounted) setErrorMsg(desc);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          await refreshProfile();
          if (mounted) navigate('/app', { replace: true });
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            await refreshProfile();
            if (mounted) {
              subscription.unsubscribe();
              navigate('/app', { replace: true });
            }
          }
        });

        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession?.user) {
            if (mounted) navigate('/app', { replace: true });
          } else if (mounted) {
            navigate('/login', { replace: true });
          }
        }, 3500);
      } catch (err: any) {
        if (mounted) setErrorMsg(err?.message || 'Erro ao processar login.');
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, refreshProfile]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-red-200 dark:border-red-800 space-y-4 text-center">
          <h2 className="text-lg font-bold text-red-600">Erro na Autenticação Google</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          A concluir autenticação com o Google...
        </span>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
