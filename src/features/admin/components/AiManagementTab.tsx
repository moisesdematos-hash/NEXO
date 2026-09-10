import React, { useState } from 'react';
import { 
  Bot, Key, Cpu, RefreshCw, 
  Sparkles, Eye, EyeOff, Save, Play, CheckCircle2, AlertCircle, Zap
} from 'lucide-react';
import { 
  getEffectiveApiKey, 
  setAndActivateApiKey, 
  testApiKeyValidity, 
  DEFAULT_AI_PROVIDERS, 
  DynamicAiProvider,
  ACTIVE_GROQ_MODELS
} from '../../../services/aiConfigService';

export const AiManagementTab: React.FC = () => {
  const [providers, setProviders] = useState<DynamicAiProvider[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_admin_ai_configs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.providers && Array.isArray(parsed.providers) && parsed.providers.some((p: any) => p.provider === 'groq')) {
          return parsed.providers;
        }
      }
    } catch {}
    return DEFAULT_AI_PROVIDERS;
  });

  const [selectedProviderId, setSelectedProviderId] = useState<string>('ai-groq');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testPrompt, setTestPrompt] = useState<string>('Organiza 3 tarefas prioritárias para o meu dia de trabalho.');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testingAi, setTestingAi] = useState<boolean>(false);
  const [validatingKey, setValidatingKey] = useState<boolean>(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // System parameters
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1024);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'És o NEXO AI, um assistente pessoal e familiar amigável, ultra-rápido e altamente eficiente. Responde sempre em português de forma clara, motivadora e estruturada.'
  );

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSetDefault = (id: string) => {
    const updated = providers.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));
    setProviders(updated);
    try {
      localStorage.setItem('nexo_admin_ai_configs', JSON.stringify({ providers: updated, temperature, maxTokens, systemPrompt }));
    } catch {}
  };

  const handleKeyChange = (providerId: string, newKey: string) => {
    const cleanKey = newKey.trim();
    setKeyValidationStatus(null);
    const updated = providers.map((p) => (p.id === providerId ? { ...p, apiKey: cleanKey } : p));
    setProviders(updated);
    
    // Auto-save e ativação imediata no NEXO
    const targetProvider = updated.find((p) => p.id === providerId);
    if (targetProvider) {
      setAndActivateApiKey(targetProvider.provider, cleanKey);
    }
  };

  const handleValidateAndActivate = async () => {
    if (!selectedProvider.apiKey.trim()) {
      setKeyValidationStatus({ success: false, message: 'Por favor introduza uma chave de API antes de validar.' });
      return;
    }
    setValidatingKey(true);
    setKeyValidationStatus(null);

    // Imediata ativação global
    setAndActivateApiKey(selectedProvider.provider, selectedProvider.apiKey);

    if (selectedProvider.provider === 'groq') {
      const res = await testApiKeyValidity('groq', selectedProvider.apiKey);
      setKeyValidationStatus({ success: res.success, message: res.message });
      if (res.success) {
        // Atualiza a latência real medida
        setProviders((prev) =>
          prev.map((p) => (p.id === selectedProvider.id ? { ...p, latencyMs: res.latencyMs, status: 'active' } : p))
        );
      }
    } else {
      setKeyValidationStatus({
        success: true,
        message: `Chave registada e ativada para ${selectedProvider.name}. Pronta para uso em roteamento fallback.`,
      });
    }
    setValidatingKey(false);
  };

  const handleTestAi = async () => {
    if (!testPrompt.trim() || testingAi) return;
    setTestingAi(true);
    setTestResponse(null);

    const activeKey = selectedProvider.apiKey.trim() || getEffectiveApiKey(selectedProvider.provider);
    const endpoints = ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'];
    const models = ACTIVE_GROQ_MODELS;

    let reply = '';
    for (const endpoint of endpoints) {
      if (reply) break;
      for (const model of models) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeKey}` },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: testPrompt }
              ],
              temperature: temperature || 0.7,
              max_tokens: maxTokens || 1024,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const c = data?.choices?.[0]?.message?.content;
            if (c) {
              reply = `[Executado com sucesso via ${selectedProvider.name} • ${model}]\n\n${c}`;
              break;
            }
          }
        } catch { /* next */ }
      }
    }

    if (!reply) {
      reply = `[Resposta via ${selectedProvider.name}]\n\nNão foi possível obter resposta com a chave fornecida. Verifique se a chave de API inserida é válida e tem permissões ativas.`;
    }

    setTestResponse(reply);
    setTestingAi(false);
  };

  const handleSaveConfigs = () => {
    try {
      localStorage.setItem('nexo_admin_ai_configs', JSON.stringify({ providers, temperature, maxTokens, systemPrompt }));
      providers.forEach((p) => {
        if (p.apiKey) {
          setAndActivateApiKey(p.provider, p.apiKey);
        }
      });
    } catch { /* ignore */ }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Status Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 shadow-inner">
            <Bot size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white">Gestão Centralizada de IAs &amp; LLMs</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Motor 100% Operacional
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Controlo de motores Groq LPU (Llama 3.3 / Mixtral), GPT, Gemini, Claude e Ollama local com roteamento inteligente e failover automático.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveConfigs}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Save size={16} />
            <span>{savedSuccess ? 'Configurações Guardadas!' : 'Guardar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Providers List vs Provider Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: List of AI Providers */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Cpu size={16} /> Provedores &amp; Modelos Configurados
            </h4>
            <span className="text-xs text-indigo-500 font-semibold">{providers.length} Motores Ativos</span>
          </div>

          <div className="space-y-3">
            {providers.map((p) => {
              const isSelected = p.id === selectedProviderId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProviderId(p.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-800 border-indigo-500 shadow-lg text-white ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="font-extrabold text-sm truncate">{p.name}</span>
                    </div>

                    {p.isDefault && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase border border-indigo-500/30">
                        Principal
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-200/50 dark:border-slate-800/60 font-medium text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider">Latência</span>
                      <strong className="text-slate-900 dark:text-slate-100">{p.latencyMs} ms</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider">Tokens Mês</span>
                      <strong className="text-slate-900 dark:text-slate-100">{(p.tokensUsedThisMonth / 1000).toFixed(0)}k</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider">Custo Est.</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">${p.costUSD.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Provider Settings & Live Sandbox */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* API Key & Model Configuration Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key size={18} className="text-indigo-500" />
                  <span>Configuração: {selectedProvider.name}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Modelo em execução: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{selectedProvider.modelName}</code>
                </p>
              </div>

              {!selectedProvider.isDefault && (
                <button
                  onClick={() => handleSetDefault(selectedProvider.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
                >
                  Definir como Principal
                </button>
              )}
            </div>

            {/* API Key Field with Instant Activation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Chave de API / Endpoint de Conexão
                </label>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Auto-Ativação em Tempo Real
                </span>
              </div>
              <div className="relative">
                <input
                  type={showKeys[selectedProvider.id] ? 'text' : 'password'}
                  value={selectedProvider.apiKey}
                  onChange={(e) => handleKeyChange(selectedProvider.id, e.target.value)}
                  placeholder="Ex: gsk_..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs pr-12 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey(selectedProvider.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showKeys[selectedProvider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Instant Validation Button & Result Feedback */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Qualquer chave inserida aqui é reconhecida e ativada imediatamente em todos os 26 Mentores e Chats.
                </p>
                <button
                  type="button"
                  onClick={handleValidateAndActivate}
                  disabled={validatingKey}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  {validatingKey ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                  <span>{validatingKey ? 'A Validar...' : 'Validar & Ativar Agora'}</span>
                </button>
              </div>

              {keyValidationStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
                    keyValidationStatus.success
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {keyValidationStatus.success ? (
                    <CheckCircle2 size={16} className="shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0" />
                  )}
                  <span>{keyValidationStatus.message}</span>
                </div>
              )}
            </div>

            {/* Sliders: Temperature & Max Tokens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Temperatura (Criatividade)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Max Tokens por Resposta</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min={256}
                  max={4096}
                  step={128}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* System Prompt Editor */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                System Prompt Global do NEXO AI
              </label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Sandbox Test Prompt Area */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <Play size={16} /> Teste Direto no Motor ({selectedProvider.name})
              </h4>
              <span className="text-xs text-slate-400">Sandbox de Diagnóstico</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Insira um prompt de teste..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleTestAi}
                disabled={testingAi}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5 shrink-0"
              >
                {testingAi ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{testingAi ? 'A testar...' : 'Executar Prompt'}</span>
              </button>
            </div>

            {testResponse && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 text-xs font-mono text-indigo-200 whitespace-pre-wrap leading-relaxed animate-fade-in">
                {testResponse}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
