import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { offlineStore } from '../lib/offlineStore';
import { setGlobalNetworkStatus } from '../hooks/useNetworkStatus';
import { getEffectiveApiKey } from './aiConfigService';
import { knowledgeReuseService } from './knowledgeReuseService';

export type LearningObjectiveRow = Database['public']['Tables']['learning_objectives']['Row'];
export type LearningObjectiveInsert = Database['public']['Tables']['learning_objectives']['Insert'];

export type LearningPlanRow = Database['public']['Tables']['learning_plans']['Row'];
export type LearningPlanInsert = Database['public']['Tables']['learning_plans']['Insert'];

export type LearningItemRow = Database['public']['Tables']['learning_items']['Row'];
export type LearningItemInsert = Database['public']['Tables']['learning_items']['Insert'];

export const learningService = {
  async getObjectives(): Promise<LearningObjectiveRow[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';

    const cached = (await offlineStore.getUserCache<LearningObjectiveRow>(userId, 'learning_objectives')) || [];

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user) {
      return cached;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('learning_objectives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const remoteObjectives = (data || []) as LearningObjectiveRow[];

      const localTempObjectives = cached.filter((o) => o.id.startsWith('temp-'));
      const combined = [
        ...localTempObjectives.filter((lo) => !remoteObjectives.some((ro) => ro.id === lo.id)),
        ...remoteObjectives,
      ];

      const finalObjectives = combined.length > 0 ? combined : cached;
      await offlineStore.saveUserCache(userId, 'learning_objectives', finalObjectives);
      return finalObjectives;
    } catch {
      return cached;
    }
  },

  async createObjective(obj: Omit<LearningObjectiveInsert, 'user_id'>): Promise<LearningObjectiveRow> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';

    const newObj: LearningObjectiveInsert = {
      ...obj,
      user_id: userId,
      progress_percent: 0,
      is_completed: false,
    };

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user) {
      const tempId = `temp-${Date.now()}`;
      const tempRecord: LearningObjectiveRow = {
        id: tempId,
        user_id: userId,
        title: newObj.title,
        description: newObj.description ?? null,
        progress_percent: 0,
        is_completed: false,
        created_at: new Date().toISOString(),
      };

      if (user) {
        await offlineStore.addPendingMutation({
          user_id: userId,
          table_name: 'learning_objectives',
          operation: 'INSERT',
          payload: newObj,
        });
      }

      const current = (await offlineStore.getUserCache<LearningObjectiveRow>(userId, 'learning_objectives')) || [];
      const updated = [tempRecord, ...current];
      await offlineStore.saveUserCache(userId, 'learning_objectives', updated);

      return tempRecord;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('learning_objectives')
        .insert(newObj)
        .select()
        .single();

      if (error) throw error;
      return data as LearningObjectiveRow;
    } catch {
      const tempId = `temp-${Date.now()}`;
      const tempRecord: LearningObjectiveRow = {
        id: tempId,
        user_id: userId,
        title: newObj.title,
        description: newObj.description ?? null,
        progress_percent: 0,
        is_completed: false,
        created_at: new Date().toISOString(),
      };

      const current = (await offlineStore.getUserCache<LearningObjectiveRow>(userId, 'learning_objectives')) || [];
      const updated = [tempRecord, ...current];
      await offlineStore.saveUserCache(userId, 'learning_objectives', updated);
      return tempRecord;
    }
  },

  async deleteObjective(id: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';

    const current = (await offlineStore.getUserCache<LearningObjectiveRow>(userId, 'learning_objectives')) || [];
    const filtered = current.filter((o) => o.id !== id);
    await offlineStore.saveUserCache(userId, 'learning_objectives', filtered);

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: userId,
          table_name: 'learning_objectives',
          operation: 'DELETE',
          payload: { id },
        });
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(userId)).length });
      }
      return id;
    }

    try {
      const { error } = await (supabase as any)
        .from('learning_objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch {
      // already removed from local cache
    }
    return id;
  },

  async getPlans(objectiveId: string): Promise<LearningPlanRow[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';
    const cacheKey = `learning_plans_${objectiveId}`;

    const cached = (await offlineStore.getUserCache<LearningPlanRow>(userId, cacheKey)) || [];

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user || objectiveId.startsWith('temp-')) {
      return cached;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('learning_plans')
        .select('*')
        .eq('objective_id', objectiveId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      const remotePlans = (data || []) as LearningPlanRow[];

      const localTempPlans = cached.filter((p) => p.id.startsWith('temp-'));
      const combined = [
        ...remotePlans,
        ...localTempPlans.filter((lp) => !remotePlans.some((rp) => rp.id === lp.id)),
      ];

      const finalPlans = combined.length > 0 ? combined : cached;
      await offlineStore.saveUserCache(userId, cacheKey, finalPlans);
      return finalPlans;
    } catch {
      return cached;
    }
  },

  async createPlan(plan: LearningPlanInsert): Promise<LearningPlanRow> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';
    const cacheKey = `learning_plans_${plan.objective_id}`;

    const tempId = `temp-plan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const tempRecord: LearningPlanRow = {
      id: tempId,
      objective_id: plan.objective_id,
      title: plan.title,
      order_index: plan.order_index ?? 0,
      created_at: new Date().toISOString(),
    };

    const current = (await offlineStore.getUserCache<LearningPlanRow>(userId, cacheKey)) || [];

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user || plan.objective_id.startsWith('temp-')) {
      await offlineStore.saveUserCache(userId, cacheKey, [...current, tempRecord]);
      return tempRecord;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('learning_plans')
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      
      await offlineStore.saveUserCache(userId, cacheKey, [...current, data as LearningPlanRow]);
      return data as LearningPlanRow;
    } catch {
      await offlineStore.saveUserCache(userId, cacheKey, [...current, tempRecord]);
      return tempRecord;
    }
  },

  async getItems(planId: string): Promise<LearningItemRow[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';
    const cacheKey = `learning_items_${planId}`;

    const cached = (await offlineStore.getUserCache<LearningItemRow>(userId, cacheKey)) || [];

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user || planId.startsWith('temp-')) {
      return cached;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('learning_items')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const remoteItems = (data || []) as LearningItemRow[];

      const localTempItems = cached.filter((i) => i.id.startsWith('temp-'));
      const combined = [
        ...remoteItems,
        ...localTempItems.filter((li) => !remoteItems.some((ri) => ri.id === li.id)),
      ];

      const finalItems = combined.length > 0 ? combined : cached;
      await offlineStore.saveUserCache(userId, cacheKey, finalItems);
      return finalItems;
    } catch {
      return cached;
    }
  },

  async addItem(item: LearningItemInsert): Promise<LearningItemRow> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';
    const cacheKey = `learning_items_${item.plan_id}`;

    const tempId = `temp-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const tempRecord: LearningItemRow = {
      id: tempId,
      plan_id: item.plan_id,
      title: item.title,
      is_completed: item.is_completed ?? false,
      created_at: new Date().toISOString(),
    };

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: userId,
          table_name: 'learning_items',
          operation: 'INSERT',
          payload: item,
        });
      }

      const current = (await offlineStore.getUserCache<LearningItemRow>(userId, cacheKey)) || [];
      await offlineStore.saveUserCache(userId, cacheKey, [...current, tempRecord]);
      return tempRecord;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('learning_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      const current = (await offlineStore.getUserCache<LearningItemRow>(userId, cacheKey)) || [];
      await offlineStore.saveUserCache(userId, cacheKey, [...current, data as LearningItemRow]);
      return data as LearningItemRow;
    } catch {
      const current = (await offlineStore.getUserCache<LearningItemRow>(userId, cacheKey)) || [];
      await offlineStore.saveUserCache(userId, cacheKey, [...current, tempRecord]);
      return tempRecord;
    }
  },

  async toggleItem(id: string, isCompleted: boolean): Promise<LearningItemRow> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';

    const targetCompleted = !isCompleted;

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: userId,
          table_name: 'learning_items',
          operation: 'UPDATE',
          payload: { id, is_completed: targetCompleted },
        });
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(userId)).length });
      }
      return { id, is_completed: targetCompleted } as LearningItemRow;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('learning_items')
        .update({ is_completed: targetCompleted })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LearningItemRow;
    } catch {
      return { id, is_completed: targetCompleted } as LearningItemRow;
    }
  },

  async deleteItem(id: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: userId,
          table_name: 'learning_items',
          operation: 'DELETE',
          payload: { id },
        });
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(userId)).length });
      }
      return id;
    }

    try {
      const { error } = await (supabase as any)
        .from('learning_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch {
      // ignore
    }
    return id;
  },

  async recalculateProgress(objectiveId: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';

    const plans = await this.getPlans(objectiveId);
    if (plans.length === 0) return 0;

    let totalItems = 0;
    let completedItems = 0;

    for (const plan of plans) {
      const items = await this.getItems(plan.id);
      totalItems += items.length;
      completedItems += items.filter((i) => i.is_completed).length;
    }

    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const isCompleted = percent === 100 && totalItems > 0;

    // Update local cache for objective
    const currentObjectives = (await offlineStore.getUserCache<LearningObjectiveRow>(userId, 'learning_objectives')) || [];
    const updated = currentObjectives.map(obj => obj.id === objectiveId ? { ...obj, progress_percent: percent, is_completed: isCompleted } : obj);
    await offlineStore.saveUserCache(userId, 'learning_objectives', updated);

    if (user && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        await (supabase as any)
          .from('learning_objectives')
          .update({ progress_percent: percent, is_completed: isCompleted })
          .eq('id', objectiveId);
      } catch {
        // local updated
      }
    }

    return percent;
  },

  async generateCourseCurriculum(objectiveId: string, topicTitle: string): Promise<{ stagesCreated: number; topicsCreated: number; reusedFromCache?: boolean }> {
    // 1. REUSE KNOWLEDGE CHECK (0 Tokens, Instant Load)
    const matchingTemplate = knowledgeReuseService.findMatchingCourseTemplate(topicTitle);
    let reusedFromCache = false;
    let stages = matchingTemplate ? matchingTemplate.stages : getCurriculumTemplateForTopic(topicTitle);

    if (matchingTemplate) {
      reusedFromCache = true;
      knowledgeReuseService.recordTokenSavings(1850);
    } else if (typeof navigator === 'undefined' || navigator.onLine) {
      // 2. If no template exists, attempt dynamic AI curriculum generation via Groq
      try {
        const groqKey = getEffectiveApiKey('groq');
        if (groqKey) {
          const endpoints = ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'];
          for (const endpoint of endpoints) {
            try {
              const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${groqKey}`,
                },
                body: JSON.stringify({
                  model: 'llama-3.3-70b-versatile',
                  messages: [
                    {
                      role: 'system',
                      content: 'Gera um currículo de estudo completo em formato JSON para o tema pedido em Português de Portugal. O JSON deve ter a estrutura: { "stages": [ { "title": "Etapa 1: ...", "topics": ["Tópico 1...", "Tópico 2...", "Tópico 3..."] }, ... ] } com exatamente 3 a 4 etapas e 3 a 4 tópicos práticos por etapa. Responde APENAS o JSON puro sem markdown ou texto extra.'
                    },
                    {
                      role: 'user',
                      content: `Gera o currículo completo para o curso: "${topicTitle}"`
                    }
                  ],
                  temperature: 0.3,
                  max_tokens: 1024,
                })
              });
              if (res.ok) {
                const data = await res.json();
                const raw = data?.choices?.[0]?.message?.content?.trim() || '';
                const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
                const parsed = JSON.parse(cleanJson);
                if (Array.isArray(parsed?.stages) && parsed.stages.length > 0) {
                  stages = parsed.stages.map((st: any) => ({
                    title: st.title || st.stage_title || 'Etapa de Estudo',
                    topics: Array.isArray(st.topics) ? st.topics : ['Introdução ao Módulo', 'Prática e Exercícios']
                  }));

                  // Save this newly generated course to Community Cache for future users!
                  knowledgeReuseService.saveToCommunityTemplates({
                    id: `comm-${Date.now()}`,
                    title: topicTitle,
                    category: 'Tecnologia',
                    description: `Curso gerado pela comunidade sobre ${topicTitle}`,
                    iconName: 'BookOpen',
                    estimatedHours: 12,
                    rating: 4.9,
                    studentsCount: 1,
                    tags: [topicTitle.toLowerCase()],
                    stages,
                  });
                  break;
                }
              }
            } catch {
              // try next endpoint or fallback to templates
            }
          }
        }
      } catch {
        // use template
      }
    }

    let stagesCreated = 0;
    let topicsCreated = 0;

    for (let i = 0; i < stages.length; i++) {
      const stageDef = stages[i];
      const plan = await this.createPlan({
        objective_id: objectiveId,
        title: stageDef.title,
        order_index: i,
      });
      stagesCreated++;

      for (const topicTitle of stageDef.topics) {
        if (!topicTitle) continue;
        await this.addItem({
          plan_id: plan.id,
          title: topicTitle,
          is_completed: false,
        });
        topicsCreated++;
      }
    }

    await this.recalculateProgress(objectiveId);
    return { stagesCreated, topicsCreated, reusedFromCache };
  },

  async generateLessonContent(params: {
    lessonId: string;
    lessonTitle: string;
    courseTitle: string;
    stageTitle: string;
    forceRefresh?: boolean;
  }): Promise<LessonContent> {
    const { lessonId, lessonTitle, courseTitle, stageTitle, forceRefresh } = params;
    const cacheKey = `nexo_lesson_${lessonId || encodeURIComponent(courseTitle + '_' + lessonTitle)}`;

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {
        // ignore
      }
    }

    // Try AI generation via Groq
    if (typeof navigator === 'undefined' || navigator.onLine) {
      try {
        const groqKey = getEffectiveApiKey('groq');
        if (groqKey) {
          const endpoints = ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'];
          for (const endpoint of endpoints) {
            try {
              const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${groqKey}`,
                },
                body: JSON.stringify({
                  model: 'llama-3.3-70b-versatile',
                  messages: [
                    {
                      role: 'system',
                      content: `És o Mentor Especialista de Ensino do NEXO. Gera uma aula completa, altamente didática, prática e envolvente para o seguinte tópico de estudo:
Curso: "${courseTitle}"
Etapa: "${stageTitle}"
Aula/Módulo: "${lessonTitle}"

Responde OBRIGATORIAMENTE APENAS em JSON válido, sem qualquer texto fora do JSON, no seguinte formato exato:
{
  "summary": "Resumo conciso de 1-2 frases do que o aluno vai aprender nesta aula.",
  "explanation": "Explicação completa e didática com secções (# e ##), conceitos fundamentais explicados de forma simples (técnica Feynman), regras práticas e aplicações no mundo real.",
  "keyPoints": ["Ponto chave essencial 1", "Ponto chave essencial 2", "Ponto chave essencial 3"],
  "examples": [
    {"concept": "Conceito 1", "explanation": "Exemplo aplicado com tradução ou caso prático", "practicalTip": "Dica prática de memorização"},
    {"concept": "Conceito 2", "explanation": "Exemplo aplicado 2", "practicalTip": "Dica prática 2"}
  ],
  "quiz": {
    "question": "Pergunta prática de teste rápido sobre o conteúdo da aula",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctIndex": 0,
    "explanation": "Explicação clara do porquê de esta ser a resposta certa."
  },
  "audioSummary": "Texto corrido, fluido e cativante em tom amigável de professor para ser lido em voz alta (TTS).",
  "tutorPrompt": "Qual é a principal dúvida ou exercício que o aluno pode fazer para aprofundar este tema?"
}`
                    }
                  ],
                  temperature: 0.4,
                  response_format: { type: 'json_object' }
                })
              });

              if (res.ok) {
                const data = await res.json();
                const text = data.choices?.[0]?.message?.content?.trim();
                if (text) {
                  const parsed = JSON.parse(text);
                  const fullLesson: LessonContent = {
                    id: lessonId,
                    title: lessonTitle,
                    courseTitle,
                    stageTitle,
                    summary: parsed.summary || 'Resumo da aula de estudo.',
                    explanation: parsed.explanation || 'Conteúdo explicativo da aula.',
                    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : ['Conceito base', 'Aplicação prática'],
                    examples: Array.isArray(parsed.examples) ? parsed.examples : [],
                    quiz: parsed.quiz || {
                      question: `Qual o ponto principal de ${lessonTitle}?`,
                      options: ['Compreender os fundamentos', 'Avançar sem praticar', 'Apenas memorizar', 'Ignorar exemplos'],
                      correctIndex: 0,
                      explanation: 'Compreender os fundamentos é essencial para o domínio.'
                    },
                    audioSummary: parsed.audioSummary || parsed.summary || 'Resumo em áudio da aula.',
                    tutorPrompt: parsed.tutorPrompt || `Como posso aplicar ${lessonTitle} na prática?`
                  };

                  try {
                    localStorage.setItem(cacheKey, JSON.stringify(fullLesson));
                  } catch {
                    // ignore
                  }
                  return fullLesson;
                }
              }
            } catch {
              // try next or fallback
            }
          }
        }
      } catch {
        // fallback to curated lesson generator
      }
    }

    // Curated intelligent fallback lesson
    const fallbackLesson = getFallbackLessonContent(lessonId, lessonTitle, courseTitle, stageTitle);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(fallbackLesson));
    } catch {
      // ignore
    }
    return fallbackLesson;
  }
};

export interface LessonContent {
  id: string;
  title: string;
  courseTitle: string;
  stageTitle: string;
  summary: string;
  explanation: string;
  keyPoints: string[];
  examples: Array<{ concept: string; explanation: string; practicalTip?: string }>;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  audioSummary: string;
  tutorPrompt: string;
}

export function getFallbackLessonContent(
  lessonId: string,
  lessonTitle: string,
  courseTitle: string,
  stageTitle: string
): LessonContent {
  const lower = (lessonTitle + ' ' + courseTitle).toLowerCase();

  if (lower.includes('ingl') || lower.includes('english') || lower.includes('pronúncia') || lower.includes('vocabulário') || lower.includes('verbo')) {
    return {
      id: lessonId,
      title: lessonTitle,
      courseTitle,
      stageTitle,
      summary: `Nesta aula prática de Inglês, vai dominar as estruturas essenciais, pronúncia correta e vocabulário chave de "${lessonTitle}".`,
      explanation: `### 🎯 Objetivo da Aula
O domínio de **${lessonTitle}** é um pilar fundamental para falar e entender Inglês com naturalidade e confiança.

### 📚 Fundamentos & Regras Práticas
1. **Fonética e Articulação:** Em Inglês, a entoação e o posicionamento da língua (especialmente em sons como *TH*, *R* e *V*) definem a clareza da comunicação.
2. **Contexto no Dia a Dia:** Pratique sempre construindo frases completas em vez de apenas palavras isoladas.
3. **Padrões de Comunicação:** Identifique as estruturas repetitivas para acelerar a fluência sem ter de pensar na tradução palavra por palavra.

### 💡 Dica de Ouro de Estudo
Grave a sua própria voz a repetir os exemplos em voz alta e compare com a pronúncia dos nativos para treinar o ouvido e a musculatura facial.`,
      keyPoints: [
        'Compreensão dos sons e pronúncia articulada',
        'Construção de frases do quotidiano sem tradução direta',
        'Prática de escuta ativa e repetição em voz alta'
      ],
      examples: [
        {
          concept: 'Cumprimento e Cortesia',
          explanation: '"Good morning! How are you doing today?" (Bom dia! Como estás hoje?)',
          practicalTip: 'Use a ligação das palavras: "How-are-you" soa como uma única palavra contínua.'
        },
        {
          concept: 'Expressão de Vontade / Ação',
          explanation: '"I would like to practice my English speaking skills." (Gostaria de praticar a minha conversação em inglês.)',
          practicalTip: '"I would like" é mais educado do que "I want".'
        }
      ],
      quiz: {
        question: 'Qual é a melhor abordagem para fixar o vocabulário e a pronúncia em inglês?',
        options: [
          'Repetir em voz alta dentro de frases completas e em contexto real',
          'Memorizar apenas listas de palavras soltas sem áudio',
          'Traduzir cada palavra mentalmente antes de falar',
          'Focar apenas na leitura sem praticar a fala'
        ],
        correctIndex: 0,
        explanation: 'Aprender palavras inseridas em contexto e pronunciadas em voz alta ativa tanto a memória auditiva como a memória muscular da fala!'
      },
      audioSummary: `Olá! Bem-vindo à aula de ${lessonTitle}. O segredo desta matéria é focar na naturalidade e na repetição em voz alta. Pratique os exemplos connosco e veja o seu progresso crescer a cada dia!`,
      tutorPrompt: `Gostaria de praticar um diálogo rápido de conversação sobre ${lessonTitle}. Podes simular um cenário comigo?`
    };
  }

  // General / Academic Fallback Lesson
  return {
    id: lessonId,
    title: lessonTitle,
    courseTitle,
    stageTitle,
    summary: `Compreenda os conceitos fundamentais, lógica estrutural e aplicações práticas de "${lessonTitle}".`,
    explanation: `### 🎯 O Que Vamos Aprender
Nesta aula de **${courseTitle}**, vamos explorar a fundo o tópico **${lessonTitle}**, compreendendo as causas, funcionamento e impacto prático.

### 🧠 Princípios Fundamentais (Técnica Feynman)
- **O Conceito em Linguagem Simples:** Explicar a matéria sem jargões complexos garante que a essência foi verdadeiramente assimilada.
- **Estrutura e Lógica:** Como este conceito se conecta com os módulos anteriores e prepara as etapas seguintes.
- **Aplicações no Mundo Real:** Onde e quando este conhecimento é utilizado na resolução de problemas práticos.

### 📝 Próximos Passos
Após a leitura, responda ao mini-quiz abaixo e marque a aula como concluída para registar o seu progresso no tema.`,
    keyPoints: [
      'Domínio da definição e conceito central',
      'Compreensão da aplicação prática e resolução de problemas',
      'Fixação com repetição ativa e autoavaliação'
    ],
    examples: [
      {
        concept: 'Aplicação Prática',
        explanation: 'Identificar um caso do quotidiano onde este princípio é aplicado diretamente para obter maior eficiência.',
        practicalTip: 'Tente explicar este conceito a outra pessoa com as suas próprias palavras.'
      }
    ],
    quiz: {
      question: `Qual é o objetivo principal ao estudar "${lessonTitle}"?`,
      options: [
        'Compreender a essência e saber aplicar na resolução prática de problemas',
        'Apenas decorar para um teste sem entender a lógica',
        'Passar o módulo sem rever os pontos chave',
        'Evitar exercícios práticos'
      ],
      correctIndex: 0,
      explanation: 'A verdadeira aprendizagem ocorre quando somos capazes de aplicar os conceitos na prática e explicar a sua lógica fundamental.'
    },
    audioSummary: `Bem-vindo à aula sobre ${lessonTitle}. Aqui vai aprender a essência deste tema com explicações claras e exemplos práticos. Vamos começar!`,
    tutorPrompt: `Podes dar-me um exemplo prático adicional de ${lessonTitle} aplicado a um caso de estudo real?`
  };
}

export interface CourseStageDefinition {
  title: string;
  topics: string[];
}

export function getCurriculumTemplateForTopic(topicTitle: string): CourseStageDefinition[] {
  const lower = topicTitle.toLowerCase();

  if (lower.includes('ingl') || lower.includes('english')) {
    return [
      {
        title: 'Etapa 1: Fundamentos & Fonética Essencial',
        topics: [
          'Alfabeto, Pronúncia & Sons Especiais em Inglês (TH, R, V)',
          'Saudações, Apresentações & Frases de Cortesia',
          'Vocabulário Base: Números, Cores, Família & Rotina',
          '100 Palavras Mais Usadas na Língua Inglesa'
        ]
      },
      {
        title: 'Etapa 2: Gramática Prática & Conversação Básica',
        topics: [
          'Verbo To Be no Presente & Pronomes Pessoais',
          'Present Simple para Ações do Quotidiano',
          'Perguntas Básicas (What, Where, When, Why, How)',
          'Diálogos: No Restaurante, Hotel e Aeroporto'
        ]
      },
      {
        title: 'Etapa 3: Fluência Intermédia & Escuta Ativa (Listening)',
        topics: [
          'Past Simple (Passado) & Verbos Irregulares Principais',
          'Future with Will & Going to',
          'Phrasal Verbs Mais Frequentes no Dia a Dia',
          'Compreensão de Áudios, Séries e Podcasts em Inglês'
        ]
      },
      {
        title: 'Etapa 4: Domínio Avançado & Inglês Profissional',
        topics: [
          'Redação de E-mails & Comunicação Profissional',
          'Expressões Idiomáticas & Conectores de Argumentação',
          'Simulação de Entrevista de Emprego em Inglês',
          'Projeto Final: Apresentação de 3 minutos em Inglês'
        ]
      }
    ];
  }

  if (lower.includes('program') || lower.includes('python') || lower.includes('javascript') || lower.includes('código') || lower.includes('web') || lower.includes('dev')) {
    return [
      {
        title: 'Etapa 1: Fundamentos & Sintaxe Inicial',
        topics: [
          'Instalação do Ambiente de Desenvolvimento & Primeiro Programa',
          'Variáveis, Tipos de Dados (Strings, Números, Booleanos) & Operadores',
          'Estruturas de Controlo de Fluxo: If, Else, Switch',
          'Exercícios de Lógica & Resolução de Problemas'
        ]
      },
      {
        title: 'Etapa 2: Estruturas de Dados & Funções',
        topics: [
          'Listas, Arrays, Dicionários e Objetos',
          'Ciclos de Repetição: For, While & Manipulação de Dados',
          'Criação de Funções Modulares & Tratamento de Erros',
          'Mini-Projeto: Calculadora ou Gerador de Tarefas'
        ]
      },
      {
        title: 'Etapa 3: Algoritmos & Aplicação Prática',
        topics: [
          'Programação Orientada a Objetos (Classes e Métodos)',
          'Consumo de APIs REST & Manipulação de JSON',
          'Gestão de Ficheiros e Persistência de Dados',
          'Boas Práticas de Código Limpo e Debugging'
        ]
      },
      {
        title: 'Etapa 4: Projeto Prático Completo',
        topics: [
          'Arquitetura e Planeamento da Aplicação',
          'Implementação das Funcionalidades Principais',
          'Testes Unitários & Validação',
          'Deploy e Publicação do Projeto no GitHub'
        ]
      }
    ];
  }

  if (lower.includes('gest') || lower.includes('negócio') || lower.includes('finan') || lower.includes('market') || lower.includes('venda')) {
    return [
      {
        title: 'Etapa 1: Fundamentos & Visão Estratégica',
        topics: [
          'Conceitos Centrais & Análise de Mercado (SWOT / PESTEL)',
          'Definição de Público-Alvo e Proposta de Valor Única',
          'Planeamento de Objetivos e Métricas Chave (KPIs & OKRs)',
          'Estudo de Casos de Sucesso na Indústria'
        ]
      },
      {
        title: 'Etapa 2: Execução & Operações',
        topics: [
          'Gestão de Processos e Eficiência Operacional',
          'Orçamentação, Fluxo de Caixa e Controlo de Custos',
          'Comunicação de Equipa e Liderança Prática',
          'Gestão de Tempo e Priorização de Tarefas'
        ]
      },
      {
        title: 'Etapa 3: Crescimento, Marketing & Vendas',
        topics: [
          'Estratégias de Aquisição e Retenção de Clientes',
          'Marketing Digital e Canais de Distribuição',
          'Técnicas de Negociação e Fecho de Vendas',
          'Métricas de Conversão (CAC, LTV e ROI)'
        ]
      },
      {
        title: 'Etapa 4: Otimização & Plano de Expansão',
        topics: [
          'Análise Crítica de Resultados e Relatórios',
          'Identificação de Gargalos e Melhoria Contínua',
          'Estratégia de Escalar o Projeto',
          'Apresentação do Plano Executivo Final'
        ]
      }
    ];
  }

  // Generic / Academic Universal Curriculum Template
  return [
    {
      title: 'Etapa 1: Fundamentos & Conceitos Centrais',
      topics: [
        'Introdução, História e Importância da Matéria',
        'Terminologia e Conceitos-Chave Fundamentais',
        'Leitura das Obras e Materiais de Referência',
        'Resumo Inicial e Fixação dos Primeiros Conceitos'
      ]
    },
    {
      title: 'Etapa 2: Aprofundamento Teórico & Estruturas',
      topics: [
        'Análise Detalhada dos Princípios Centrais',
        'Relação entre Teoria e Casos Práticos',
        'Resolução de Exercícios e Dúvidas Frequentes',
        'Flashcards de Repetição Espaçada dos Tópicos Chave'
      ]
    },
    {
      title: 'Etapa 3: Aplicação Prática & Resolução de Problemas',
      topics: [
        'Estudo de Casos Práticos e Simulações',
        'Exercícios de Nível Exame / Teste com Resolução Passo a Passo',
        'Análise Crítica e Discussão de Resultados',
        'Autoavaliação Intermédia de Conhecimentos'
      ]
    },
    {
      title: 'Etapa 4: Consolidação, Revisão & Avaliação Final',
      topics: [
        'Mapa Mental Resumo de Todo o Conteúdo',
        'Simulado Completo com Critérios de Correção',
        'Revisão dos Pontos Fracos Identificados',
        'Conclusão do Roteiro e Síntese de Aprendizagem'
      ]
    }
  ];
}
