import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Check if URL has OAuth callback parameters
  const hasOAuthTokens = typeof window !== 'undefined' && (
    window.location.hash.includes('access_token') ||
    window.location.search.includes('code=') ||
    window.location.hash.includes('type=recovery')
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (hasOAuthTokens && !user) {
      // Safety timeout: if OAuth exchange doesn't resolve in 4.5 seconds, unblock
      timer = setTimeout(() => {
        setHasTimedOut(true);
        // Clean URL params to prevent re-triggering loop
        if (typeof window !== 'undefined' && window.history) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 4500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hasOAuthTokens, user]);

  // If timed out and still no user, show clean recovery screen instead of hanging
  if (hasTimedOut && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              A autenticação demorou a responder
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              O Google ou o Supabase não concluíram a troca de chaves a tempo. Por favor tente iniciar sessão novamente.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate('/login')}
              type="button"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Voltar e Tentar Novamente</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state with a safety fallback
  if (loading || (hasOAuthTokens && !user && !hasTimedOut)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {hasOAuthTokens ? 'A autenticar com Google...' : 'A carregar NEXO...'}
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
