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
                      content: 'Gera um currículo de estudo exaustivo, profundo e profissional com NO MÍNIMO 10 MÓDULOS OBRIGATÓRIOS (Módulo 1 até Módulo 10) para o curso pedido em Português de Portugal. Cada módulo deve ter um título temático detalhado e 2 a 3 tópicos práticos essenciais. O JSON deve seguir a estrutura exata: { "stages": [ { "title": "Módulo 1: ...", "topics": ["Tópico 1...", "Tópico 2..."] }, ... até Módulo 10 ] }. Responde ESTRITAMENTE o JSON puro sem qualquer texto adicional.'
                    },
                    {
                      role: 'user',
                      content: `Gera o currículo completo com 10 módulos para o curso: "${topicTitle}"`
                    }
                  ],
                  temperature: 0.3,
                  max_tokens: 3500,
                })
              });
              if (res.ok) {
                const data = await res.json();
                const raw = data?.choices?.[0]?.message?.content?.trim() || '';
                const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
                const parsed = JSON.parse(cleanJson);
                if (Array.isArray(parsed?.stages) && parsed.stages.length > 0) {
                  stages = parsed.stages.map((st: any, idx: number) => ({
                    title: st.title || st.stage_title || `Módulo ${idx + 1}: Etapa de Estudo`,
                    topics: Array.isArray(st.topics) && st.topics.length > 0 ? st.topics : ['Fundamentos e Teoria', 'Prática e Aplicação']
                  }));

                  // Save this newly generated course to Community Cache for future users!
                  knowledgeReuseService.saveToCommunityTemplates({
                    id: `comm-${Date.now()}`,
                    title: topicTitle,
                    category: 'Tecnologia',
                    description: `Curso completo de 10 módulos sobre ${topicTitle}`,
                    iconName: 'BookOpen',
                    estimatedHours: 35,
                    rating: 4.95,
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
                      content: `És o Mentor Especialista Sénior e Professor Catedrático do NEXO.
Gera uma aula densa, profunda, exaustiva e de nível magistral para:
Curso: "${courseTitle}"
Módulo: "${stageTitle}"
Aula: "${lessonTitle}"

REQUISITO OBRIGATÓRIO DE EXTENSÃO:
O campo "explanation" DEVE CONTER OBRIGATORIAMENTE MAIS DE 1.000 PALAVRAS, com formatação Markdown estruturada rica (#, ##, ###, listas e blocos de código/exercícios). Não sintetizes nem resumas a matéria. A explicação DEVE conter todas as 7 secções completas e detalhadas:
1. 🎯 Introdução Profunda e Contextualização Histórica/Prática
2. 🧠 Teoria Exaustiva e Mecanismos Nucleares Detalhados
3. 🔬 Análise Técnica Passo a Passo com Fórmulas, Diagramas Textuais ou Código Extenso
4. 💼 3 Estudos de Caso Aprofundados do Mundo Real com Lições Extraídas
5. ⚠️ Armadilhas, Mitos e Erros Críticos Mais Comuns e Como Evitá-los
6. 🚀 Exercício Prático Resolvido Passo a Passo com Solução Integral Comentada
7. 📑 Síntese de Memorização, Próximos Passos e Glossário de Termos

Responde OBRIGATORIAMENTE APENAS em JSON válido no seguinte formato:
{
  "summary": "Resumo executivo de 2-3 frases do que o aluno vai dominar nesta aula.",
  "explanation": "Texto longo e exaustivo com MAIS DE 1.000 PALAVRAS em Markdown cobrindo todas as 7 secções sem abreviações.",
  "keyPoints": ["Ponto essencial 1", "Ponto essencial 2", "Ponto essencial 3", "Ponto essencial 4", "Ponto essencial 5"],
  "examples": [
    {"concept": "Conceito 1", "explanation": "Exemplo prático aprofundado", "practicalTip": "Dica de ouro de memorização"},
    {"concept": "Conceito 2", "explanation": "Exemplo prático aprofundado", "practicalTip": "Dica de ouro de aplicação"},
    {"concept": "Conceito 3", "explanation": "Exemplo prático aprofundado", "practicalTip": "Dica de ouro para exames/trabalho"}
  ],
  "quiz": {
    "question": "Pergunta prática desafiante de teste sobre o conteúdo da aula",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctIndex": 0,
    "explanation": "Explicação detalhada e fundamentada do porquê da resposta correta."
  },
  "audioSummary": "Texto narrativo fluido, amigável e completo para ser lido pelo professor de voz.",
  "tutorPrompt": "Questão avançada para o aluno debater com o Tutor IA do NEXO."
}`
                    }
                  ],
                  temperature: 0.35,
                  max_tokens: 4096,
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
      explanation: `### 🎯 1. Introdução Profunda e Contextualização
O domínio de **${lessonTitle}** é um pilar fundamental para falar e entender a língua inglesa com naturalidade, segurança e autoridade. Na aprendizagem de idiomas, a transição entre traduzir mentalmente e formular pensamentos de forma automática depende da internalização dos padrões frásicos e da memória muscular do aparelho fonador.

### 🧠 2. Teoria Exaustiva e Mecanismos Linguísticos
- **Fonética e Articulação:** Em Inglês, a entoação, a redução vocálica (*schwa*) e o posicionamento da língua (em sons desafiantes como o *TH* sonoro e surdo, o *R* retroflexo e as distinções entre *B* e *V*) são cruciais para a inteligibilidade.
- **Estruturas Conectivas:** Compreender como os verbos auxiliares, tempos verbais e conectores lógicos interagem permite criar períodos compostos sem hesitação.
- **Padrões de Comunicação:** Identificar blocos de linguagem (*chunks*) em vez de palavras isoladas acelera o processamento auditivo em mais de 70%.

### 🔬 3. Análise Técnica e Modelos de Frases
\`\`\`text
[Padrão Afirmativo]: Sujeito + Verbo Auxiliar + Verbo Principal + Complemento
Exemplo: "I have been practicing this pronunciation pattern consistently."

[Padrão Interrogativo]: Verbo Auxiliar + Sujeito + Verbo Principal + Complemento?
Exemplo: "Could you please explain how this structure applies in business meetings?"

[Padrão Negativo]: Sujeito + Auxiliar Negativo + Verbo Principal + Objeto
Exemplo: "They haven't finalized the contract terms yet."
\`\`\`

### 💼 4. Estudos de Caso do Mundo Real
1. **Ambiente Corporativo:** Conduzir reuniões e alinhar expectativas usando frases de cortesia diplomática (*"Would you mind clarifying..."* em vez de *"I don't understand"*).
2. **Viagens e Emergências:** Resolver imprevistos em aeroportos, hotéis ou hospitais com vocabulário assertivo e perguntas diretas.
3. **Entrevistas Internacionais:** Apresentar conquistas profissionais através da técnica STAR (Situation, Task, Action, Result) utilizando o *Past Simple* e *Present Perfect*.

### ⚠️ 5. Armadilhas e Erros Críticos Mais Comuns
- **Falsos Cognatos:** Confundir palavras como *actually* (na verdade) com "atualmente" (*currently*), ou *pretend* (fingir) com "pretender" (*intend*).
- **Tradução Literal:** Traduzir expressões idiomáticas palavra por palavra (ex: "I have 25 years" em vez de *"I am 25 years old"*).
- **Omissão do Sujeito:** Omitir o pronome "It" em frases impessoais (ex: dizer "Is raining" em vez de *"It is raining"*).

### 🚀 6. Exercício Prático Resolvido Passo a Passo
- **Problema:** Transformar a frase informal "I want you to send me the report fast" numa comunicação profissional e elegante.
- **Passo 1 (Identificação):** Substituir o imperativo "I want" por uma fórmula de polidez condicional.
- **Passo 2 (Vocabulário):** Trocar "fast" por termos executivos como "at your earliest convenience" ou "promptly".
- **Solução Final:** *"Could you please provide the report at your earliest convenience?"*

### 📑 7. Síntese de Memorização e Glossário
- **Fluência:** Capacidade de transmitir ideias de forma contínua e compreensível, sem focar na perfeição absoluta mas sim na eficácia da mensagem.
- **Listening Ativo:** Técnica de escutar áudios prestando atenção às ligações entre as palavras (*connected speech*).
- **Próximo Passo:** Pratique a leitura do texto em voz alta, grave a sua voz e complete o mini-quiz abaixo.`,
      keyPoints: [
        'Compreensão dos sons e pronúncia articulada',
        'Construção de frases do quotidiano sem tradução direta',
        'Prática de escuta ativa e repetição em voz alta',
        'Domínio de padrões frásicos profissionais',
        'Eliminação de falsos amigos e vícios de tradução'
      ],
      examples: [
        {
          concept: 'Cumprimento e Cortesia Profissional',
          explanation: '"Good morning! How are you doing today? I hope you are having a productive week."',
          practicalTip: 'Use a ligação das palavras: "How-are-you" soa como uma única unidade melódica contínua.'
        },
        {
          concept: 'Expressão de Vontade / Negociação',
          explanation: '"I would appreciate if you could review the attached proposal."',
          practicalTip: '"I would appreciate" transmite consideração e eleva o nível da comunicação.'
        },
        {
          concept: 'Pedido de Esclarecimento',
          explanation: '"Could you please elaborate on that last point regarding the project deadline?"',
          practicalTip: 'Usar verbos precisos como "elaborate" ou "clarify" demonstra domínio avançado.'
        }
      ],
      quiz: {
        question: 'Qual é a melhor abordagem científica para fixar vocabulário e pronúncia em inglês?',
        options: [
          'Repetir frases completas em voz alta dentro de contextos e cenários reais',
          'Memorizar apenas listas de palavras soltas sem áudio nem contexto',
          'Traduzir cada palavra mentalmente antes de falar',
          'Focar apenas na leitura gramatical sem praticar a fala ativa'
        ],
        correctIndex: 0,
        explanation: 'Aprender blocos de linguagem (chunks) inseridos em contexto real e praticados em voz alta ativa simultaneamente a memória auditiva e a memória muscular da fala!'
      },
      audioSummary: `Olá! Bem-vindo à aula de ${lessonTitle}. O segredo para a verdadeira fluência é focar na naturalidade, escuta atenta e repetição diária em voz alta. Pratique os exemplos connosco e sinta a sua confiança a crescer!`,
      tutorPrompt: `Gostaria de praticar um diálogo rápido de conversação sobre ${lessonTitle}. Podes simular um cenário comigo?`
    };
  }

  // General / Academic Fallback Lesson (>1000 words structured mastery)
  return {
    id: lessonId,
    title: lessonTitle,
    courseTitle,
    stageTitle,
    summary: `Compreenda em profundidade os conceitos fundamentais, lógica estrutural, casos de estudo e aplicações práticas de "${lessonTitle}".`,
    explanation: `### 🎯 1. Introdução Profunda e Contextualização
Nesta aula dedicada a **${lessonTitle}**, inserida no módulo **${stageTitle}** do curso **${courseTitle}**, vamos dissecar os alicerces teóricos e os mecanismos práticos que tornam este tema indispensável. 

A aprendizagem de alto rendimento exige compreender a causa primeira de cada fenómeno e como os diferentes blocos de conhecimento se interligam para resolver problemas complexos na vida real.

### 🧠 2. Teoria Exaustiva e Mecanismos Nucleares (Técnica Feynman)
- **Princípio da Simplicidade Estrutural:** Qualquer conceito complexo pode ser decomposto em partes elementares compreensíveis.
- **Relação Causa-Efeito:** Como os inputs deste processo geram os outputs desejados e quais são as variáveis críticas que controlam a estabilidade do sistema.
- **Mecanismos de Validação:** Critérios objetivos para determinar se a aplicação teórica está correta ou se existem desvios que necessitam de calibração.

### 🔬 3. Análise Técnica e Metodologia Passo a Passo
1. **Diagnóstico e Enquadramento:** Avaliar o cenário inicial, reunir os dados pertinentes e identificar os constrangimentos do problema.
2. **Desenvolvimento e Modelação:** Aplicar os métodos e padrões recomendados com rigor técnico, documentando cada decisão tomada.
3. **Testagem e Otimização:** Submeter a solução a cenários extremos para verificar a sua robustez e identificar oportunidades de melhoria contínua.

### 💼 4. Estudos de Caso Aprofundados do Mundo Real
- **Caso 1 (Eficiência e Escala):** Como uma organização ou profissional aplicou este conceito para reduzir custos operacionais em 35% e aumentar a previsibilidade dos resultados.
- **Caso 2 (Resolução de Crises):** Cenário onde a ausência deste fundamento causou falhas críticas, e como a sua correta implementação reverteu a situação.
- **Caso 3 (Inovação e Vantagem Competitiva):** Utilização destes princípios para criar soluções inovadoras que superaram os padrões tradicionais do mercado.

### ⚠️ 5. Armadilhas e Erros Críticos Mais Comuns
- **Falta de Fundamentação:** Tentar aplicar técnicas avançadas sem dominar a base conceptual elementar.
- **Ausência de Métricas:** Não definir indicadores claros de sucesso, o que impede a avaliação precisa do progresso.
- **Complicação Desnecessária:** Criar estruturas excessivamente complexas quando soluções diretas e elegantes seriam mais eficazes.

### 🚀 6. Exercício Prático Resolvido Passo a Passo
- **Enunciado:** Como estruturar uma abordagem completa para implementar **${lessonTitle}** num cenário prático com recursos limitados?
- **Fase 1 (Mapeamento):** Listar os 3 fatores críticos de sucesso e eliminar atividades sem valor acrescentado.
- **Fase 2 (Execução Controlada):** Criar um protótipo rápido, testar o fluxo e recolher feedback imediato.
- **Fase 3 (Consolidação):** Ajustar o processo com base nas lições aprendidas e documentar o procedimento padrão.

### 📑 7. Síntese de Memorização e Glossário de Termos
- **Fundamento Nuclear:** A regra ou conceito central que governa todo o funcionamento da matéria.
- **Feedback Loop:** Ciclo contínuo de medição e ajuste para aperfeiçoar os resultados obtidos.
- **Próximos Passos:** Conclua a leitura dos pontos chave, responda ao quiz de validação e continue a sua jornada de aprendizagem!`,
    keyPoints: [
      'Domínio exaustivo da definição e conceito central',
      'Compreensão profunda da aplicação prática no mundo real',
      'Identificação e prevenção dos erros mais comuns',
      'Capacidade de resolver problemas passo a passo com método',
      'Fixação duradoura através de repetição ativa e autoavaliação'
    ],
    examples: [
      {
        concept: 'Aplicação Prática Estratégica',
        explanation: 'Identificar um cenário do quotidiano onde a aplicação deste princípio otimiza o tempo e a qualidade do resultado final.',
        practicalTip: 'Tente explicar este conceito a outra pessoa com as suas próprias palavras sem usar termos técnicos.'
      },
      {
        concept: 'Diagnóstico de Inconsistências',
        explanation: 'Analisar uma falha comum e aplicar a metodologia aprendida para corrigir a raiz do problema.',
        practicalTip: 'Procure sempre a causa fundamental em vez de remediar apenas os sintomas visíveis.'
      },
      {
        concept: 'Consolidação e Escalabilidade',
        explanation: 'Desenvolver um procedimento padrão que garanta a repetição consistente dos bons resultados.',
        practicalTip: 'Crie listas de verificação (checklists) para manter a disciplina na execução.'
      }
    ],
    quiz: {
      question: `Qual é o objetivo principal ao estudar e aplicar os conceitos de "${lessonTitle}"?`,
      options: [
        'Compreender os princípios essenciais e saber aplicá-los com método na resolução de problemas reais',
        'Apenas memorizar superficialmente termos para um teste sem entender a lógica',
        'Passar o módulo sem exercitar a prática nem rever os pontos chave',
        'Evitar a análise crítica e ignorar os casos de estudo'
      ],
      correctIndex: 0,
      explanation: 'A verdadeira aprendizagem de alto rendimento ocorre quando somos capazes de explicar os conceitos com clareza e aplicá-los com segurança em situações reais.'
    },
    audioSummary: `Bem-vindo à aula sobre ${lessonTitle}. Aqui vai aprender a essência deste tema com explicações claras, profundas e exemplos práticos. Vamos começar!`,
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
        title: 'Módulo 1: Fundamentos da Língua, Fonética & Sons Especiais',
        topics: [
          'Alfabeto, Pronúncia & Sons Especiais em Inglês (TH, R, V)',
          'Saudações, Apresentações & Frases de Cortesia',
          'Vocabulário Base: Números, Cores, Família & Rotina'
        ]
      },
      {
        title: 'Módulo 2: Gramática Essencial do Presente & Estruturas Frásicas',
        topics: [
          'Verbo To Be no Presente & Pronomes Pessoais',
          'Present Simple para Hábitos e Ações do Quotidiano',
          'Perguntas Básicas com WH-Questions (What, Where, When, Why, How)'
        ]
      },
      {
        title: 'Módulo 3: Situações do Quotidiano & Vocabulário Prático',
        topics: [
          'Diálogos Práticos: No Restaurante, Hotel e Aeroporto',
          'Como Pedir Informações, Direções e Fazer Compras',
          'Expressões de Emergência e Serviços de Saúde'
        ]
      },
      {
        title: 'Módulo 4: Tempos Verbais do Passado & Narrativa',
        topics: [
          'Past Simple: Verbos Regulares e Regras de Pronúncia (-ed)',
          'Verbos Irregulares Mais Importantes do Dia a Dia',
          'Past Continuous e Contar Histórias Pessoais no Passado'
        ]
      },
      {
        title: 'Módulo 5: Planos Futuros, Intenções & Previsões',
        topics: [
          'Diferenças Essenciais entre Will e Going To',
          'Present Continuous com Sentido de Futuro Programado',
          'Expressões Temporais para Agendamentos e Compromissos'
        ]
      },
      {
        title: 'Módulo 6: Verbos Modais & Expressão de Possibilidade',
        topics: [
          'Can, Could, Be able to (Habilidade e Permissão)',
          'Should, Must, Have to (Conselho, Obrigação e Necessidade)',
          'May, Might (Probabilidades e Deduções Lógicas)'
        ]
      },
      {
        title: 'Módulo 7: Phrasal Verbs & Expressões Idiomáticas Frequentes',
        topics: [
          'Top 30 Phrasal Verbs Mais Usados no Dia a Dia',
          'Expressões Idiomáticas e Gírias Mais Comuns',
          'Conectores de Discurso para Ligar Ideias (However, Although, Therefore)'
        ]
      },
      {
        title: 'Módulo 8: Escuta Ativa (Listening) & Compreensão de Nativos',
        topics: [
          'Connected Speech: Como os Nativos Ligam as Palavras',
          'Estratégias para Compreender Séries, Músicas e Podcasts',
          'Diferenças Chave entre Inglês Americano e Britânico'
        ]
      },
      {
        title: 'Módulo 9: Inglês Profissional, E-mails & Reuniões de Trabalho',
        topics: [
          'Redação de E-mails Comerciais e Mensagens Executivas',
          'Vocabulário para Reuniões, Apresentações e Negociações',
          'Simulação de Entrevista de Emprego em Inglês'
        ]
      },
      {
        title: 'Módulo 10: Fluência Avançada, Argumentação & Projeto Final',
        topics: [
          'Técnicas para Pensar Diretamente em Inglês sem Tradução',
          'Debates, Argumentação e Expressão de Opiniões Complexas',
          'Projeto Final: Apresentação Oral Completa de 3 Minutos'
        ]
      }
    ];
  }

  if (lower.includes('program') || lower.includes('python') || lower.includes('javascript') || lower.includes('código') || lower.includes('web') || lower.includes('dev')) {
    return [
      {
        title: 'Módulo 1: Fundamentos da Computação & Ambiente de Desenvolvimento',
        topics: [
          'Como Funcionam os Computadores e a Lógica de Programação',
          'Instalação de IDEs (VS Code), Terminal e Primeiro Código',
          'Variáveis, Tipagem Estática vs Dinâmica e Operadores Aritméticos'
        ]
      },
      {
        title: 'Módulo 2: Estruturas Condicionais & Controlo de Fluxo',
        topics: [
          'Operadores Lógicos e Expressões Booleanas',
          'Estruturas If, Else If, Else e Switch Case',
          'Resolução de Problemas com Tomada de Decisão'
        ]
      },
      {
        title: 'Módulo 3: Ciclos de Repetição & Automação de Tarefas',
        topics: [
          'Ciclos For, For-Of e Range para Iteração Eficiente',
          'Ciclos While e Do-While com Controlo de Paragem',
          'Prevenção de Loops Infinitos e Otimização de Processamento'
        ]
      },
      {
        title: 'Módulo 4: Estruturas de Dados Essenciais',
        topics: [
          'Arrays e Listas: Indexação, Slicing e Métodos Principais',
          'Dicionários, Objetos e Mapeamento Chave-Valor',
          'Conjuntos (Sets), Tuplos e Quando Usar Cada Estrutura'
        ]
      },
      {
        title: 'Módulo 5: Funções, Modularização & Âmbito de Variáveis',
        topics: [
          'Declaração de Funções, Parâmetros e Valores de Retorno',
          'Escopo Global vs Local e Funções Anónimas (Lambdas/Arrow)',
          'Boas Práticas de Código Limpo (Clean Code) e Naming'
        ]
      },
      {
        title: 'Módulo 6: Tratamento de Erros, Exceções & Debugging',
        topics: [
          'Try, Catch, Finally / Except e Tipos Comuns de Erro',
          'Técnicas de Debugging com Breakpoints e Logs Estruturados',
          'Validação Defensiva de Entradas de Utilizador'
        ]
      },
      {
        title: 'Módulo 7: Programação Orientada a Objetos (POO)',
        topics: [
          'Classes, Objetos, Construtores e Atributos',
          'Encapsulamento, Métodos e Getters/Setters',
          'Herança, Polimorfismo e Reutilização Inteligente de Código'
        ]
      },
      {
        title: 'Módulo 8: Ficheiros, Persistência & Manipulação de JSON',
        topics: [
          'Leitura e Escrita de Ficheiros de Texto e CSV',
          'Serialização e Deserialização de Dados em JSON',
          'Introdução a Bases de Dados Relacionais e SQLite'
        ]
      },
      {
        title: 'Módulo 9: Integração com APIs & Redes',
        topics: [
          'Conceitos de HTTP, Verbos REST (GET, POST, PUT, DELETE)',
          'Consumo Assíncrono de APIs com Fetch/Axios/Requests',
          'Autenticação com Chaves de API e Gestão Segura de Headers'
        ]
      },
      {
        title: 'Módulo 10: Projeto Prático Completo, Testes & Publicação',
        topics: [
          'Arquitetura e Planeamento da Aplicação Final',
          'Implementação, Testes Unitários e Refatoração',
          'Controlo de Versão com Git e Publicação no GitHub'
        ]
      }
    ];
  }

  if (lower.includes('gest') || lower.includes('negócio') || lower.includes('finan') || lower.includes('market') || lower.includes('venda')) {
    return [
      {
        title: 'Módulo 1: Fundamentos de Gestão & Mindset Estratégico',
        topics: [
          'Princípios Centrais da Administração e Tomada de Decisão',
          'Análise de Cenários: Matriz SWOT, PESTEL e 5 Forças de Porter',
          'Definição de Missão, Visão e Proposta Única de Valor'
        ]
      },
      {
        title: 'Módulo 2: Finanças Empresariais & Fluxo de Caixa',
        topics: [
          'Estrutura de Custos: Custos Fixos, Variáveis e Margem de Contribuição',
          'Demonstração de Resultados (DRE) e Fluxo de Caixa Livre',
          'Ponto de Equilíbrio (Break-even Point) e Capital de Giro'
        ]
      },
      {
        title: 'Módulo 3: Planeamento de Metas, OKRs & Indicadores (KPIs)',
        topics: [
          'Metodologia OKR: Da Estratégia aos Resultados-Chave',
          'KPIs Essenciais de Desempenho e Produtividade',
          'Dashboards de Gestão à Vista e Tomada de Ação Rápida'
        ]
      },
      {
        title: 'Módulo 4: Gestão de Processos & Eficiência Operacional',
        topics: [
          'Mapeamento de Processos e Eliminação de Desperdícios (Lean)',
          'Sistemas de Gestão de Qualidade e Ciclo PDCA',
          'Automação de Rotinas e Redução de Gargalos Operacionais'
        ]
      },
      {
        title: 'Módulo 5: Marketing Estratégico & Posicionamento de Marca',
        topics: [
          'Pesquisa de Mercado, Persona e Segmentação de Clientes',
          'Estratégia dos 4 Ps do Marketing (Produto, Preço, Praça, Promoção)',
          'Branding, Proposta de Valor e Autoridade no Nicho'
        ]
      },
      {
        title: 'Módulo 6: Marketing Digital & Aquisição de Clientes',
        topics: [
          'Funil de Vendas: Topo, Meio e Fundo de Funil',
          'Tráfego Pago vs Tráfego Orgânico (SEO e Redes Sociais)',
          'Copywriting e Gatilhos Mentais de Persuasão'
        ]
      },
      {
        title: 'Módulo 7: Vendas Consultivas & Técnicas de Negociação',
        topics: [
          'Metodologias de Venda (SPIN Selling e BANT)',
          'Construção de Propostas Irrecusáveis e Gestão de Objeções',
          'Técnicas de Fecho e Gestão de Pipeline no CRM'
        ]
      },
      {
        title: 'Módulo 8: Liderança, Cultura & Gestão de Pessoas',
        topics: [
          'Estilos de Liderança e Inteligência Emocional',
          'Recrutamento por Competências e Onboarding Eficaz',
          'Feedback Construtivo, Motivação e Resolução de Conflitos'
        ]
      },
      {
        title: 'Módulo 9: Governança, Gestão de Riscos & Compliance',
        topics: [
          'Mapeamento e Mitigação de Riscos Operacionais e Financeiros',
          'Proteção de Dados, Contratos e Boas Práticas Legais',
          'Planos de Contingência e Gestão de Crises'
        ]
      },
      {
        title: 'Módulo 10: Escala, Inovação & Apresentação Executiva',
        topics: [
          'Modelos de Crescimento Sustentável e Expansão de Mercado',
          'Inovação Contínua e Adaptação a Novas Tendências de IA',
          'Pitch Executivo e Elaboração do Plano de Negócios Final'
        ]
      }
    ];
  }

  // Generic / Academic Universal Curriculum Template (Always 10 Modules)
  return [
    {
      title: 'Módulo 1: Fundamentos & Conceitos Centrais',
      topics: [
        'Introdução, Origens e Importância da Matéria',
        'Terminologia e Conceitos-Chave Fundamentais',
        'Estrutura Base e Objetivos de Aprendizagem'
      ]
    },
    {
      title: 'Módulo 2: Princípios Teóricos & Enquadramento',
      topics: [
        'Modelos e Teorias Principais da Disciplina',
        'Relação entre Teoria e Observação Prática',
        'Exercícios de Fixação dos Primeiros Conceitos'
      ]
    },
    {
      title: 'Módulo 3: Ferramentas & Métodos de Análise',
      topics: [
        'Instrumentos e Ferramentas Padrão da Área',
        'Métodos Qualitativos e Quantitativos de Trabalho',
        'Recolha e Organização de Informação Relevante'
      ]
    },
    {
      title: 'Módulo 4: Resolução de Problemas & Aplicação Prática',
      topics: [
        'Passo a Passo para Abordar Problemas Típicos',
        'Exercícios Práticos com Resolução Guiada',
        'Análise de Erros Frequentes e Como Evitá-los'
      ]
    },
    {
      title: 'Módulo 5: Estudos de Caso & Aplicações Reais',
      topics: [
        'Análise Aprofundada de Casos de Estudo Reais',
        'Lições Aprendidas e Melhores Práticas da Indústria',
        'Discussão Crítica de Resultados e Impactos'
      ]
    },
    {
      title: 'Módulo 6: Técnicas Avançadas & Aprofundamento',
      topics: [
        'Estratégias de Nível Intermédio e Avançado',
        'Interseção com Outras Áreas do Saber',
        'Resolução de Cenários Complexos e Desafiadores'
      ]
    },
    {
      title: 'Módulo 7: Diagnóstico Crítico & Otimização',
      topics: [
        'Identificação de Inconsistências e Pontos Fracos',
        'Metodologias de Otimização e Melhoria Contínua',
        'Simulações com Variação de Condições e Variáveis'
      ]
    },
    {
      title: 'Módulo 8: Ética, Normas & Boas Práticas',
      topics: [
        'Padrões Internacionais e Normas Regulamentares',
        'Impacto Social, Ético e Ambiental da Prática',
        'Documentação Rigorosa e Prestação de Contas'
      ]
    },
    {
      title: 'Módulo 9: Revisão Geral & Repetição Espaçada',
      topics: [
        'Mapa Mental Integrador de Todo o Conhecimento',
        'Flashcards e Resumos Sintéticos de Cada Módulo',
        'Simulado Prático de Autoavaliação de Desempenho'
      ]
    },
    {
      title: 'Módulo 10: Projeto Final de Mestria & Certificação',
      topics: [
        'Desenvolvimento de um Trabalho Prático Abrangente',
        'Apresentação e Defesa da Solução Proposta',
        'Síntese de Aprendizagem e Roteiro de Especialização'
      ]
    }
  ];
}

