/**
 * NEXO AI Configuration & Dynamic Key Resolver Service
 * Centraliza a resolução, persistência e ativação imediata de chaves de API para todos os módulos (Mentores, Chat, Família e Admin).
 */

export interface DynamicAiProvider {
  id: string;
  name: string;
  provider: 'groq' | 'openai' | 'anthropic' | 'google' | 'ollama';
  modelName: string;
  status: 'active' | 'degraded' | 'disabled';
  latencyMs: number;
  tokensUsedThisMonth: number;
  costUSD: number;
  apiKey: string;
  isDefault: boolean;
}

const envGroqKey = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_GROQ_API_KEY || (import.meta.env as any)?.GROQ_API_KEY)) || (typeof process !== 'undefined' && (process.env?.VITE_GROQ_API_KEY || process.env?.GROQ_API_KEY)) || '';
const DEFAULT_FALLBACK_GROQ_KEY = envGroqKey;

export const ACTIVE_GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'groq/compound',
  'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b',
  'groq/compound-mini',
  'openai/gpt-oss-20b'
];

export const DEFAULT_AI_PROVIDERS: DynamicAiProvider[] = [
  {
    id: 'ai-groq',
    name: 'Groq LPU Cloud (Qwen 3.8 27B / Compound - Ultra Rápido)',
    provider: 'groq',
    modelName: 'qwen/qwen3.8-27b',
    status: 'active',
    latencyMs: 65,
    tokensUsedThisMonth: 3450000,
    costUSD: 0.28,
    apiKey: DEFAULT_FALLBACK_GROQ_KEY,
    isDefault: true,
  },
  {
    id: 'ai-1',
    name: 'OpenAI GPT-4o Mini (Cloud Fallback)',
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    status: 'active',
    latencyMs: 180,
    tokensUsedThisMonth: 1420500,
    costUSD: 2.84,
    apiKey: 'sk-proj-98472918479182374981273948719234',
    isDefault: false,
  },
  {
    id: 'ai-2',
    name: 'Google Gemini 1.5 Flash (Voz & Recibos)',
    provider: 'google',
    modelName: 'gemini-1.5-flash',
    status: 'active',
    latencyMs: 140,
    tokensUsedThisMonth: 890100,
    costUSD: 0.89,
    apiKey: 'AIzaSyA894172984719283471928347192',
    isDefault: false,
  },
  {
    id: 'ai-3',
    name: 'Anthropic Claude 3.5 Sonnet (Raciocínio Completo)',
    provider: 'anthropic',
    modelName: 'claude-3-5-sonnet-20241022',
    status: 'active',
    latencyMs: 310,
    tokensUsedThisMonth: 450000,
    costUSD: 6.75,
    apiKey: 'sk-ant-api03-91827391827391827391823719827391',
    isDefault: false,
  },
  {
    id: 'ai-4',
    name: 'Ollama Local (Offline Fallback Llama 3)',
    provider: 'ollama',
    modelName: 'llama3.2:3b',
    status: 'active',
    latencyMs: 95,
    tokensUsedThisMonth: 320000,
    costUSD: 0.00,
    apiKey: 'http://localhost:11434',
    isDefault: false,
  },
];

/**
 * Obtém a chave de API efetiva e ativa no momento para um determinado provedor.
 * Procura primeiro nas configurações guardadas pelo utilizador no Admin (localStorage),
 * depois em variáveis de ambiente, e finalmente na chave fallback.
 */
export function getEffectiveApiKey(provider: 'groq' | 'openai' | 'anthropic' | 'google' | 'ollama' = 'groq'): string {
  try {
    // 1. Chave direta em localStorage
    const directKey = localStorage.getItem(`nexo_${provider}_api_key`);
    if (directKey && directKey.trim().length > 5) {
      return directKey.trim();
    }

    // 2. Chave na configuração global do Admin (nexo_admin_ai_configs)
    const adminConfigs = localStorage.getItem('nexo_admin_ai_configs');
    if (adminConfigs) {
      const parsed = JSON.parse(adminConfigs);
      if (parsed.providers && Array.isArray(parsed.providers)) {
        const found = parsed.providers.find((p: DynamicAiProvider) => p.provider === provider);
        if (found?.apiKey && found.apiKey.trim().length > 5) {
          return found.apiKey.trim();
        }
      }
    }

    // 3. Chave na aba de integrações de API (nexo_admin_api_integrations)
    if (provider === 'groq') {
      const integrations = localStorage.getItem('nexo_admin_api_integrations');
      if (integrations) {
        const parsed = JSON.parse(integrations);
        const groqInt = parsed.find((i: any) => i.id === 'groq-api');
        if (groqInt?.apiKey && groqInt.apiKey.trim().length > 5) {
          return groqInt.apiKey.trim();
        }
      }
    }

    // 4. Variáveis de ambiente Vite
    const metaEnv = (import.meta as any).env || {};
    if (provider === 'groq' && metaEnv.VITE_GROQ_API_KEY) {
      return metaEnv.VITE_GROQ_API_KEY;
    }

    // 5. Fallback Default
    if (provider === 'groq') {
      return DEFAULT_FALLBACK_GROQ_KEY;
    }
  } catch (e) {
    console.warn('[aiConfigService] Erro ao resolver chave de API:', e);
  }

  return provider === 'groq' ? DEFAULT_FALLBACK_GROQ_KEY : '';
}

/**
 * Guarda e ativa instantaneamente uma nova chave de API, notificando todos os módulos da aplicação.
 */
export function setAndActivateApiKey(provider: 'groq' | 'openai' | 'anthropic' | 'google' | 'ollama', newKey: string): void {
  const cleanKey = newKey.trim();
  try {
    // 1. Guarda na chave direta
    localStorage.setItem(`nexo_${provider}_api_key`, cleanKey);

    // 2. Atualiza a lista de provedores no Admin
    const adminConfigs = localStorage.getItem('nexo_admin_ai_configs');
    let providers = DEFAULT_AI_PROVIDERS;
    let temp = 0.7;
    let maxT = 1024;
    let sysP = 'És o NEXO AI, um assistente pessoal e familiar amigável, ultra-rápido e altamente eficiente.';

    if (adminConfigs) {
      try {
        const parsed = JSON.parse(adminConfigs);
        if (parsed.providers) providers = parsed.providers;
        if (parsed.temperature) temp = parsed.temperature;
        if (parsed.maxTokens) maxT = parsed.maxTokens;
        if (parsed.systemPrompt) sysP = parsed.systemPrompt;
      } catch {}
    }

    providers = providers.map((p) => (p.provider === provider ? { ...p, apiKey: cleanKey, status: 'active' } : p));
    localStorage.setItem(
      'nexo_admin_ai_configs',
      JSON.stringify({ providers, temperature: temp, maxTokens: maxT, systemPrompt: sysP })
    );

    // 3. Atualiza também em integrações se for Groq
    if (provider === 'groq') {
      const integrations = localStorage.getItem('nexo_admin_api_integrations');
      if (integrations) {
        try {
          const parsed = JSON.parse(integrations);
          const updated = parsed.map((item: any) =>
            item.id === 'groq-api' ? { ...item, apiKey: cleanKey, status: 'connected' } : item
          );
          localStorage.setItem('nexo_admin_api_integrations', JSON.stringify(updated));
        } catch {}
      }
    }

    // 4. Dispara evento global para re-render imediato de qualquer componente conectado
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nexo_ai_key_activated', {
          detail: { provider, apiKey: cleanKey, timestamp: Date.now() },
        })
      );
    }
  } catch (e) {
    console.error('[aiConfigService] Erro ao guardar e ativar chave:', e);
  }
}

/**
 * Realiza uma chamada de teste direta para validar se a chave inserida é funcional.
 */
export async function testApiKeyValidity(_provider: 'groq' = 'groq', apiKey: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const start = performance.now();
  const endpoints = ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'];
  const models = ACTIVE_GROQ_MODELS;

  for (const endpoint of endpoints) {
    for (const model of models) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Ping' }],
            max_tokens: 5,
          }),
        });

        if (res.ok) {
          const elapsed = Math.round(performance.now() - start);
          return {
            success: true,
            latencyMs: elapsed,
            message: `Chave autenticada e ativa com sucesso no modelo ${model} (${elapsed}ms).`,
          };
        }
      } catch {}
    }
  }

  return {
    success: false,
    latencyMs: 0,
    message: 'Não foi possível validar a chave. Verifique o valor inserido ou a conexão.',
  };
}
