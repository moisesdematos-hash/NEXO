import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles, ShieldCheck, Lock, FileText } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { NexoLogo } from '../../../components/ui/NexoLogo';

export const FooterSection: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      
      {/* Final Irresistible High-Converting Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-indigo-500/40 relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-white/15">
            <Sparkles size={14} className="animate-pulse" /> Experimente Hoje Mesmo
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto text-white">
            Pronto para transformar o seu dia a dia e da sua família?
          </h2>

          <p className="text-sm sm:text-base text-indigo-200/80 max-w-xl mx-auto">
            Junte-se à nova era da organização pessoal e familiar. Sem complicações, 100% gratuito.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
            {user ? (
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-base shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Entrar no meu Painel NEXO</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-base shadow-xl transition-all flex items-center justify-center gap-2 border border-white/20"
                >
                  <span>Criar Conta Grátis</span>
                  <ArrowRight size={18} className="text-amber-300" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-base transition-all flex items-center justify-center gap-2"
                >
                  <span>Iniciar Sessão</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Links & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 border-t border-slate-900 pt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <NexoLogo variant="full" size="md" />
          </Link>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#precos" className="hover:text-white transition-colors">Planos Grátis</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Calculadora ROI</a>
            <Link to="/app/family" className="hover:text-white transition-colors">Orçamento Família</Link>
            <Link to="/app/help" className="hover:text-white transition-colors">Ajuda &amp; FAQ</Link>
            <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1">
              <ShieldCheck size={14} />
              <span>Política de Privacidade</span>
            </Link>
            <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1">
              <FileText size={14} />
              <span>Termos de Serviço</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-400">Sistemas 100% Operacionais</span>
            </div>
            <span>•</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Lock size={12} className="text-emerald-400" /> Criptografia AES-256 / SSL
            </span>
          </div>
          <p>© {new Date().getFullYear()} NEXO Hub Digital. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Criado para simplificar a tua vida</span>
            <Heart size={14} className="text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>

    </footer>
  );
};
