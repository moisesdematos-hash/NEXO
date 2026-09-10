import React, { useState } from 'react';
import { 
  Activity, Users, Zap, Cpu, HardDrive, 
  TrendingUp, FileText, CheckCircle2, Clock
} from 'lucide-react';

export const SystemMetricsTab: React.FC = () => {
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  const logs = [
    { id: '1', level: 'info', time: '03:07:42', service: 'AI Router', message: 'Prompt processado com sucesso via GPT-4o-mini (142 ms, 320 tokens)' },
    { id: '2', level: 'info', time: '03:06:15', service: 'Calendar Sync', message: 'Ficheiro .ics gerado para utilizador ID #9821' },
    { id: '3', level: 'warn', time: '03:04:10', service: 'Family Finance', message: 'Aviso de teto orçamental atingido (85% do limite definido)' },
    { id: '4', level: 'info', time: '03:01:00', service: 'PWA ServiceWorker', message: 'Cache offline atualizada com sucesso (Versão v2.5.0)' },
    { id: '5', level: 'error', time: '02:58:30', service: 'Speech Synth', message: 'Voz offline temporariamente indisponível no Safari iOS - Fallback ativado' },
  ];

  const filteredLogs = logs.filter((l) => logFilter === 'all' || l.level === logFilter);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 text-emerald-300 shadow-inner">
            <Activity size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white">Monitorização de Desempenho &amp; Saúde do Sistema</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Métricas de servidor, latência em tempo real, consumo de tokens de IA e auditoria de erros.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-mono">
          <Clock size={14} className="text-indigo-400" />
          <span>Uptime: 99.99% (32 dias)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
            <span>Utilizadores Ativos Hoje</span>
            <Users size={18} className="text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">1,482</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
            <TrendingUp size={12} />
            <span>+14% vs semana anterior</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
            <span>Prompts IA Processados</span>
            <Zap size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">28,490</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <span>Média: 140ms por prompt</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
            <span>Carga de CPU &amp; RAM</span>
            <Cpu size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">18% / 42%</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
            <CheckCircle2 size={12} />
            <span>Excelente estabilidade</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
            <span>Armazenamento DB</span>
            <HardDrive size={18} className="text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">1.2 GB</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <span>PostgreSQL Supabase Cloud</span>
          </div>
        </div>

      </div>

      {/* System Audit Logs Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              <span>Logs de Auditoria do Sistema em Tempo Real</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registo cronológico de solicitações de IA, sincronizações de agenda e exceções.
            </p>
          </div>

          {/* Log Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setLogFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                logFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setLogFilter('info')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                logFilter === 'info' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setLogFilter('warn')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                logFilter === 'warn' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Avisos
            </button>
            <button
              onClick={() => setLogFilter('error')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                logFilter === 'error' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Erros
            </button>
          </div>
        </div>

        {/* Log Entries */}
        <div className="space-y-2.5 font-mono text-xs">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-bold shrink-0">{log.time}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                    log.level === 'info'
                      ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      : log.level === 'warn'
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                  }`}
                >
                  {log.level}
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  [{log.service}]
                </span>
                <span className="text-slate-800 dark:text-slate-200">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
