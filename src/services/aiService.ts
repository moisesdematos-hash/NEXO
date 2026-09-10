import { supabase } from '../lib/supabase';
import { NEXO_SYSTEM_PROMPT, NEXO_AI_TOOLS } from './aiSystemPrompt';
import { aiToolExecutor, AIToolExecutionResult } from './aiToolExecutor';
import { AIAttachment } from '../utils/fileAttachmentHelper';
import { aiMemoryService } from './aiMemoryService';
import { getEffectiveApiKey } from './aiConfigService';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionResult?: AIToolExecutionResult;
  attachments?: AIAttachment[];
}

export interface AIConversation {
  id: string;
  title: string;
  created_at: string;
}

export const aiService = {
  async createConversation(title?: string): Promise<AIConversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Local Guest Session Conversation
      return {
        id: `guest-conv-${Date.now()}`,
        title: title || 'Conversa com Assistente NEXO (Convidado)',
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await (supabase as any)
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title: title || 'Conversa com Assistente NEXO',
      })
      .select()
      .single();

    if (error) {
      return {
        id: `guest-conv-${Date.now()}`,
        title: title || 'Conversa com Assistente NEXO',
        created_at: new Date().toISOString(),
      };
    }
    return data as AIConversation;
  },

  async getConversations(): Promise<AIConversation[]> {
    const { data, error } = await (supabase as any)
      .from('ai_conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as AIConversation[];
  },

  async sendMessage(
    conversationId: string,
    userMessage: string,
    history: AIMessage[] = []
  ): Promise<{ replyMessage: AIMessage; actionResult?: AIToolExecutionResult }> {
    // 1. OFFLINE GUARD
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return {
        replyMessage: {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: 'A IA precisa de ligação à internet para responder.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    const sessionRes = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
    const session = sessionRes?.data?.session;

    // 2. PAYLOAD PREPARATION WITH HISTORICAL CONTEXT SEGREGATION
    const formattedHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (const m of history) {
      if (m.id.startsWith('err-') || m.id === 'welcome') continue;
      // Filter out static welcome / fallback strings from AI history
      if (m.content.includes('Olá! Sou o assistente NEXO. Posso ajudar a criar tarefas')) continue;

      const role = m.sender === 'user' ? 'user' : 'assistant';
      formattedHistory.push({ role, content: m.content });
    }

    // Ensure current userMessage is appended without duplication
    const lastMsg = formattedHistory[formattedHistory.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
      formattedHistory.push({ role: 'user', content: userMessage });
    }

    try {
      let assistantMsg: any = null;

      const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
      const procEnv = (typeof process !== 'undefined' && (process as any).env) ? (process as any).env : {};

      // 3. TRY SUPABASE EDGE FUNCTION FIRST IF AUTHENTICATED
      let edgeSuccess = false;
      if (session && session.access_token) {
        const supabaseUrl = metaEnv.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          try {
            const edgeUrl = `${supabaseUrl}/functions/v1/nexo-ai`;
            const edgeResponse = await fetch(edgeUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                systemPrompt: NEXO_SYSTEM_PROMPT,
                messages: formattedHistory,
                tools: NEXO_AI_TOOLS.map((t) => ({ type: 'function', function: t })),
              }),
            });

            if (edgeResponse && edgeResponse.ok) {
              const edgeData = await edgeResponse.json().catch(() => null);
              if (edgeData?.message) {
                assistantMsg = edgeData.message;
                edgeSuccess = true;
              }
            }
          } catch (eErr) {
            // Edge function fallback to Groq
          }
        }
      }

      // 4. ULTRA-FAST & RELIABLE GROQ MODELS FALLBACK
      if (!edgeSuccess) {
        const groqKey = getEffectiveApiKey('groq');

        // Try local proxy first in browser context to avoid CORS errors
        const endpoints =
          typeof window !== 'undefined'
            ? ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions']
            : ['https://api.groq.com/openai/v1/chat/completions', '/api/groq/openai/v1/chat/completions'];

        const candidateModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'qwen/qwen3.8-27b', 'groq/compound'];

        // Pass 1: Try with structured tools
        for (const endpoint of endpoints) {
          if (assistantMsg) break;
          for (const model of candidateModels) {
            try {
              const directResponse = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${groqKey}`,
                },
                body: JSON.stringify({
                  model,
                  messages: [
                    { role: 'system', content: NEXO_SYSTEM_PROMPT + aiMemoryService.buildMemoryPromptContext() },
                    ...formattedHistory,
                  ],
                  tools: NEXO_AI_TOOLS.map((t) => ({ type: 'function', function: t })),
                  temperature: 0.4,
                  max_tokens: 1024,
                }),
              });

              if (directResponse && directResponse.ok) {
                const directData = await directResponse.json().catch(() => null);
                const msg = directData?.choices?.[0]?.message;
                if (msg && (msg.content || (msg.tool_calls && msg.tool_calls.length > 0))) {
                  assistantMsg = msg;
                  break;
                }
              }
            } catch (fetchErr) {
              console.warn(`[Groq ${model} @ ${endpoint} Warning]`, fetchErr);
            }
          }
        }

        // Pass 2: If model didn't return content or tool_calls, call directly without tools constraints
        if (!assistantMsg || (!assistantMsg.content && (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0))) {
          for (const endpoint of endpoints) {
            if (assistantMsg && assistantMsg.content) break;
            for (const model of candidateModels) {
              try {
                const directResponse = await fetch(endpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqKey}`,
                  },
                  body: JSON.stringify({
                    model,
                    messages: [
                      { role: 'system', content: NEXO_SYSTEM_PROMPT + aiMemoryService.buildMemoryPromptContext() },
                      ...formattedHistory,
                    ],
                    temperature: 0.65,
                    max_tokens: 1200,
                  }),
                });

                if (directResponse && directResponse.ok) {
                  const directData = await directResponse.json().catch(() => null);
                  const msg = directData?.choices?.[0]?.message;
                  if (msg && msg.content) {
                    assistantMsg = msg;
                    break;
                  }
                }
              } catch (fetchErr) {
                console.warn(`[Groq Direct ${model} @ ${endpoint} Warning]`, fetchErr);
              }
            }
          }
        }
      }

      let replyText = assistantMsg?.content || '';
      let actionResult: AIToolExecutionResult | undefined;

      // 5. PROCESS STRUCTURED TOOL CALLS IF RETURNED
      if (assistantMsg?.tool_calls && assistantMsg.tool_calls.length > 0) {
        const toolCall = assistantMsg.tool_calls[0];
        const toolName = toolCall.function?.name;
        let args = {};
        try {
          args = JSON.parse(toolCall.function?.arguments || '{}');
        } catch (e) {
          args = {};
        }

        try {
          actionResult = await aiToolExecutor.executeTool(toolName, args, conversationId);
          if (actionResult?.result_message) {
            replyText = replyText
              ? `${actionResult.result_message}\n\n${replyText}`
              : actionResult.result_message;
          }
        } catch (tErr: any) {
          console.warn('[AI Tool Executor Warning]', tErr);
        }
      }

      if (!replyText) {
        if (actionResult?.result_message) {
          replyText = actionResult.result_message;
        } else {
          replyText = 'Estou ao teu dispor! Podes pedir-me para criar ou listar tarefas, consultar a agenda, ver metas ou consultar os cursos e módulos da aba Aprender. Como posso ajudar?';
        }
      }

      const replyMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
        actionResult,
      };

      // 6. LOG ACTION SILENTLY IF AUTHENTICATED
      if (session && session.user?.id) {
        try {
          const validConvId = conversationId && !conversationId.startsWith('guest-') ? conversationId : null;
          await (supabase as any).from('ai_actions_log').insert({
            conversation_id: validConvId,
            user_id: session.user.id,
            prompt_text: userMessage,
            tool_name: actionResult ? actionResult.action_type : null,
            tool_args: actionResult ? actionResult.data : null,
            execution_result: actionResult ? actionResult : null,
          });
        } catch (logErr) {
          // Log errors silently without interrupting user reply
        }
      }

      return { replyMessage, actionResult };
    } catch (err: any) {
      console.error('[NEXO AI Service Error]', err);
      return {
        replyMessage: {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: `Desculpa, ocorreu um erro de ligação (${err?.message || 'Erro inesperado'}). Por favor tenta novamente.`,
          timestamp: new Date().toISOString(),
        },
      };
    }
  },
};
