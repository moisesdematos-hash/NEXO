import React from 'react';
import { ShieldCheck, Lock, Database, UserCheck } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 text-xs font-semibold mb-4">
            <ShieldCheck size={14} />
            <span>Segurança & Privacidade Nativa</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Os teus dados pertencem-te a ti. <br />
            Sem excepções.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            No NEXO, a privacidade não é uma promessa de marketing; é uma arquitectura de código. Utilizamos Row Level Security (RLS) directamente na base de dados PostgreSQL para isolar a tua informação pessoal.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Lock size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Isolamento Estricto RLS</h3>
            <p className="text-sm text-slate-300">
              As tuas tarefas privadas e notas são inacessíveis a terceiros, inclusive a membros do teu grupo familiar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Supabase Cloud Protegido</h3>
            <p className="text-sm text-slate-300">
              Infraestrutura PostgreSQL gerida com encriptação em trânsito (TLS/SSL) e em repouso.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Modo Convidado Transparente</h3>
            <p className="text-sm text-slate-300">
              Podes experimentar a aplicação sem criar conta e associar os teus dados a um perfil permanente quando quiseres.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
