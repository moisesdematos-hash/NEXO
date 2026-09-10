import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  ShieldCheck, Bot, Globe, Activity, Users, Sliders, 
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AiManagementTab } from './components/AiManagementTab';
import { ApiIntegrationsTab } from './components/ApiIntegrationsTab';
import { SystemMetricsTab } from './components/SystemMetricsTab';
import { UserManagementTab } from './components/UserManagementTab';
import { FeatureFlagsTab } from './components/FeatureFlagsTab';

type AdminTab = 'ai' | 'apis' | 'metrics' | 'users' | 'flags';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('ai');
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Top Header with Universal Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1"
              title="Voltar ao Painel Principal"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Painel de Administração Global
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-12">
            Centro de controlo avançado para gestão de Inteligências Artificiais, APIs externas, métricas e utilizadores.
          </p>
        </div>

        <div className="flex items-center gap-2 pl-12 sm:pl-0">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Admin Master Autenticado
          </span>
        </div>
      </div>

      {/* Admin Tab Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bot size={18} />
          <span>Gestão de IAs &amp; LLMs</span>
        </button>

        <button
          onClick={() => setActiveTab('apis')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'apis'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe size={18} />
          <span>APIs &amp; Integrações</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'metrics'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity size={18} />
          <span>Métricas &amp; Saúde</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users size={18} />
          <span>Utilizadores</span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'flags'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders size={18} />
          <span>Feature Flags</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="pt-2">
        {activeTab === 'ai' && <AiManagementTab />}
        {activeTab === 'apis' && <ApiIntegrationsTab />}
        {activeTab === 'metrics' && <SystemMetricsTab />}
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'flags' && <FeatureFlagsTab />}
      </div>

    </div>
  );
};

export default AdminPage;
