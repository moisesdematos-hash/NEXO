export interface AIMemoryItem {
  id: string;
  category: 'preference' | 'fact' | 'goal' | 'schedule' | 'habit';
  key: string;
  value: string;
  updated_at: string;
}

const STORAGE_KEY = 'nexo_user_longterm_memory';

const DEFAULT_MEMORIES: AIMemoryItem[] = [
  {
    id: 'mem-1',
    category: 'preference',
    key: 'Estilo de Comunicação',
    value: 'Respostas diretas, práticas e estruturadas em Português',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    category: 'schedule',
    key: 'Foco Principal',
    value: 'Organização diária de tarefas, metas e aprendizagem acelerada em IA',
    updated_at: new Date().toISOString(),
  },
];

export const aiMemoryService = {
  getMemories(): AIMemoryItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // Ignore parse errors
    }
    return DEFAULT_MEMORIES;
  },

  saveMemory(item: Omit<AIMemoryItem, 'id' | 'updated_at'>): AIMemoryItem {
    const memories = this.getMemories();
    const existingIndex = memories.findIndex(m => m.key.toLowerCase() === item.key.toLowerCase());
    
    const newItem: AIMemoryItem = {
      id: existingIndex >= 0 ? memories[existingIndex].id : `mem-${Date.now()}`,
      ...item,
      updated_at: new Date().toISOString(),
    };

    let updatedList: AIMemoryItem[];
    if (existingIndex >= 0) {
      updatedList = [...memories];
      updatedList[existingIndex] = newItem;
    } else {
      updatedList = [...memories, newItem];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    return newItem;
  },

  deleteMemory(id: string): void {
    const memories = this.getMemories();
    const filtered = memories.filter(m => m.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {}
  },

  clearAllMemories(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  },

  buildMemoryPromptContext(): string {
    const memories = this.getMemories();
    if (memories.length === 0) return '';

    const lines = memories.map(m => `- [${m.category.toUpperCase()}] ${m.key}: ${m.value}`);
    return `\n\n--- MEMÓRIA DE LONGO PRAZO DO UTILIZADOR (CONTEXTO PERSISTENTE) ---\n${lines.join('\n')}\nUtiliza este contexto pessoal para personalizar todas as respostas e sugestões ao utilizador.`;
  }
};
