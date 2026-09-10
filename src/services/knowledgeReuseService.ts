// src/services/knowledgeReuseService.ts

export interface CourseTemplate {
  id: string;
  title: string;
  category: 'Tecnologia' | 'Finanças' | 'Idiomas' | 'Produtividade' | 'Ciências' | 'Negócios';
  description: string;
  iconName: string;
  estimatedHours: number;
  rating: number;
  studentsCount: number;
  tags: string[];
  stages: Array<{
    title: string;
    topics: string[];
  }>;
}

export interface ExamTemplate {
  id: string;
  subject: string;
  category: string;
  title: string;
  description: string;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

export const VERIFIED_COURSE_TEMPLATES: CourseTemplate[] = [
  {
    id: 'course-python-zero',
    title: 'Python do Zero ao Avançado',
    category: 'Tecnologia',
    description: 'Aprenda a linguagem mais popular do mundo: sintaxe, automação, análise de dados e criação de scripts.',
    iconName: 'Code',
    estimatedHours: 18,
    rating: 4.9,
    studentsCount: 1420,
    tags: ['python', 'programação', 'código', 'backend', 'dados', 'data science'],
    stages: [
      {
        title: 'Etapa 1: Fundamentos & Lógica de Programação',
        topics: [
          'Variáveis, Tipos de Dados e Operadores',
          'Estruturas de Controlo (if, elif, else)',
          'Ciclos de Repetição (for e while)',
          'Funções, Parâmetros e Retorno',
        ],
      },
      {
        title: 'Etapa 2: Estruturas de Dados & Manipulação',
        topics: [
          'Listas, Tuplos e Conjuntos (Sets)',
          'Dicionários e Manipulação de Chaves',
          'Tratamento de Exceções e Erros (try/except)',
          'Leitura e Escrita de Ficheiros (TXT e CSV)',
        ],
      },
      {
        title: 'Etapa 3: Programação Orientada a Objetos',
        topics: [
          'Classes, Objetos e Métodos Construtores',
          'Herança e Polimorfismo',
          'Módulos e Instalação de Pacotes com PIP',
          'Projeto Prático: Gestor de Tarefas em Linha de Comandos',
        ],
      },
    ],
  },
  {
    id: 'course-financas-pessoais',
    title: 'Gestão de Finanças Pessoais & Orçamento',
    category: 'Finanças',
    description: 'Domine o seu dinheiro: eliminação de dívidas, poupança automática, investimentos básicos e orçamento 50/30/20.',
    iconName: 'TrendingUp',
    estimatedHours: 12,
    rating: 4.95,
    studentsCount: 2310,
    tags: ['finanças', 'dinheiro', 'orçamento', 'poupança', 'investimentos', 'economia', 'renda'],
    stages: [
      {
        title: 'Etapa 1: Diagnóstico Financeiro & Mentalidade',
        topics: [
          'Mapeamento de Receitas Fixas e Variáveis',
          'Corte de Despesas Supérfluas e Fugas de Capital',
          'A Regra do Orçamento 50/30/20',
          'Construção do Fundo de Emergência de 6 Meses',
        ],
      },
      {
        title: 'Etapa 2: Otimização & Fim das Dívidas',
        topics: [
          'Método Bola de Neve vs Avalancha para Amortizar Dívidas',
          'Negociação de Contratos de Casa, Luz e Telecomunicações',
          'Automação Bancária de Poupança no Dia do Salário',
          'Controlo do Cartão de Crédito sem Juros',
        ],
      },
      {
        title: 'Etapa 3: Introdução a Investimentos Seguros',
        topics: [
          'Inflação e o Impacto no Dinheiro Parado',
          'Certificados de Aforro e Depósitos a Prazo',
          'ETFs e Fundos de Índice Mundiais (S&P 500 / MSCI World)',
          'Criação de um Plano de Independência Financeira',
        ],
      },
    ],
  },
  {
    id: 'course-marketing-digital',
    title: 'Marketing Digital & Criação de Conteúdo',
    category: 'Negócios',
    description: 'Estratégias para atrair clientes, crescer nas redes sociais, copywriting e campanhas de anúncios com conversão.',
    iconName: 'Briefcase',
    estimatedHours: 15,
    rating: 4.88,
    studentsCount: 980,
    tags: ['marketing', 'vendas', 'redes sociais', 'instagram', 'copywriting', 'anúncios', 'negócios'],
    stages: [
      {
        title: 'Etapa 1: Posicionamento & Persona',
        topics: [
          'Definição do Cliente Ideal (Avatar / Persona)',
          'Proposta Única de Valor e Diferenciação',
          'Funil de Vendas: Topo, Meio e Fundo de Funil',
          'Copywriting: Fórmulas de Persuasão e Gatilhos Mentais',
        ],
      },
      {
        title: 'Etapa 2: Estratégia de Redes Sociais',
        topics: [
          'Planeamento de Linha Editorial e Calendário de Conteúdos',
          'Vídeos Curtos com Alta Retenção (Reels e TikTok)',
          'Geração de Autoridade e Prova Social',
          'Construção de Lista de Emails com Iscas Digitais',
        ],
      },
      {
        title: 'Etapa 3: Tráfego Pago & Métricas de Conversão',
        topics: [
          'Fundamentos do Meta Ads e Google Ads',
          'Métricas Essenciais: CTR, CPC, CPA e ROAS',
          'Otimização de Páginas de Captura e Vendas',
          'Estratégias de Remarketing para Recuperação de Vendas',
        ],
      },
    ],
  },
  {
    id: 'course-ingles-conversacao',
    title: 'Inglês Prático para Conversação & Trabalho',
    category: 'Idiomas',
    description: 'Destrave a sua fala em inglês: diálogos do dia a dia, vocabulário corporativo e pronúncia articulada.',
    iconName: 'Languages',
    estimatedHours: 20,
    rating: 4.92,
    studentsCount: 3100,
    tags: ['inglês', 'idiomas', 'english', 'conversação', 'falar', 'vocabulário', 'trabalho'],
    stages: [
      {
        title: 'Etapa 1: Quebrando o Bloqueio & Sons Essenciais',
        topics: [
          'Fonética e Pronúncia Correta dos Sons TH, R e V',
          'Cumprimentos, Apresentações e Small Talk',
          'Como Fazer Perguntas Corretas sem Hesitar',
          'Vocabulário Essencial para Viagens e Restaurantes',
        ],
      },
      {
        title: 'Etapa 2: Inglês Profissional & Entrevistas',
        topics: [
          'Redação de Emails Corporativos Claros e Formais',
          'Vocabulário para Reuniões e Apresentações',
          'Simulação de Entrevista de Emprego em Inglês',
          'Expressões Idiomáticas Mais Usadas no Trabalho',
        ],
      },
      {
        title: 'Etapa 3: Fluência & Imersão Diária',
        topics: [
          'Técnica de Shadowing com Podcasts e Séries',
          'Pensar em Inglês sem Traduzir Mentalmente',
          'Debates e Argumentação sobre Temas de Atualidade',
          'Prática de Conversação com o Tutor IA do NEXO',
        ],
      },
    ],
  },
  {
    id: 'course-foco-produtividade',
    title: 'Hiperfoco, Hábitos & Gestão do Tempo',
    category: 'Produtividade',
    description: 'Elimine a procrastinação com técnicas comprovadas de neurociência, blocos de tempo e rotinas de alto impacto.',
    iconName: 'Zap',
    estimatedHours: 10,
    rating: 4.96,
    studentsCount: 1850,
    tags: ['foco', 'produtividade', 'hábitos', 'tempo', 'procrastinação', 'pomodoro', 'rotina'],
    stages: [
      {
        title: 'Etapa 1: Neurociência da Procrastinação & Foco',
        topics: [
          'Como o Cérebro Lida com a Dopamina e Distrações',
          'Regra dos 2 Minutos e Ativação do Estado de Fluxo (Flow)',
          'Higiene Digital: Notificações, Telemóvel e Ambiente de Trabalho',
          'A Técnica Pomodoro Avançada com Soundscapes',
        ],
      },
      {
        title: 'Etapa 2: Organização e Time-Blocking',
        topics: [
          'Método Time-Blocking e Dias Temáticos',
          'Matriz de Eisenhower: Urgente vs Importante',
          'Revisão Semanal de Metas e Prioridades',
          'Construção de uma Rotina Matinal e Noturna Eficaz',
        ],
      },
      {
        title: 'Etapa 3: Hábitos Atómicos & Consistência',
        topics: [
          'O Ciclo do Hábito: Gatilho, Desejo, Resposta e Recompensa',
          'Empilhamento de Hábitos (Habit Stacking)',
          'Como Recuperar o Ritmo Após Dias Ruins',
          'Acompanhamento de Progresso e Gamificação no NEXO',
        ],
      },
    ],
  },
  {
    id: 'course-inteligencia-artificial',
    title: 'Inteligência Artificial Prática no Quotidiano',
    category: 'Tecnologia',
    description: 'Aprenda a usar ferramentas de IA generativa, engenharia de prompts e automações para poupar horas de trabalho.',
    iconName: 'Sparkles',
    estimatedHours: 14,
    rating: 4.98,
    studentsCount: 2750,
    tags: ['ia', 'inteligencia artificial', 'prompts', 'chatgpt', 'groq', 'automação', 'tecnologia'],
    stages: [
      {
        title: 'Etapa 1: Fundamentos de Modelos de Linguagem (LLMs)',
        topics: [
          'Como Funcionam os Modelos Generativos de Texto e Imagem',
          'Princípios de Engenharia de Prompts (Clareza, Contexto e Persona)',
          'Técnicas de Few-Shot e Chain-of-Thought Prompting',
          'Limitações, Alucinações e Verificação de Factos',
        ],
      },
      {
        title: 'Etapa 2: Aplicações no Trabalho & Estudos',
        topics: [
          'Resumos Automáticos de Artigos, Livros e PDFs',
          'Criação de Relatórios, Artigos e Apresentações com IA',
          'Uso da IA como Tutor Pessoal e Explicador de Conceitos',
          'Análise de Dados e Fórmulas Excel com IA',
        ],
      },
      {
        title: 'Etapa 3: Automações & Futuro do Trabalho',
        topics: [
          'Integração de Ferramentas de IA em Workflows Diários',
          'Criação de Assistentes Personalizados com Memória',
          'Ética, Privacidade de Dados e Segurança no Uso de IA',
          'Projeto Final: O Meu Sistema de Produtividade com IA',
        ],
      },
    ],
  },
];

export const VERIFIED_EXAM_TEMPLATES: ExamTemplate[] = [
  {
    id: 'exam-calculo-1',
    subject: 'Matemática & Cálculo I',
    category: 'Exatas',
    title: 'Exame Modelo: Limites, Derivadas e Aplicações',
    description: 'Teste com 3 questões de nível universitário sobre Teorema do Valor Médio, Derivadas e Regra de L\'Hôpital.',
    questions: [
      {
        id: 1,
        question: 'Qual é o princípio fundamental do Teorema do Valor Médio (Lagrange)?',
        options: [
          'Existe pelo menos um ponto c em ]a,b[ onde a reta tangente é paralela à secante que une os extremos: f\'(c) = (f(b)-f(a))/(b-a).',
          'A derivada da função é sempre estritamente positiva em todo o domínio real.',
          'A função tem obrigatoriamente um ponto de descontinuidade no intervalo.',
          'O limite no infinito é sempre nulo para qualquer função polinomial.',
        ],
        correctAnswer: 0,
        explanation: 'O Teorema de Lagrange garante a existência de um ponto c em ]a,b[ onde f\'(c) = (f(b)-f(a))/(b-a).',
      },
      {
        id: 2,
        question: 'Se f(x) = e^(3x), qual é a derivada f\'(x)?',
        options: [
          'e^(3x)',
          '3 * e^(3x)',
          '3x * e^(3x-1)',
          'e^3',
        ],
        correctAnswer: 1,
        explanation: 'Pela regra da cadeia: d/dx [e^u] = u\' * e^u. Como u = 3x e u\' = 3, f\'(x) = 3 * e^(3x).',
      },
      {
        id: 3,
        question: 'A Regra de L\'Hôpital pode ser aplicada diretamente quando o limite resulta em qual indeterminação?',
        options: [
          '0/0 ou ∞/∞',
          '1^∞ ou 0^0 exclusivamente',
          '∞ - ∞ apenas',
          '0 * ∞ sem qualquer transformação',
        ],
        correctAnswer: 0,
        explanation: 'A Regra de L\'Hôpital é válida de forma direta para quocientes nas formas indeterminadas 0/0 ou ±∞/±∞.',
      },
    ],
  },
  {
    id: 'exam-fisica-mecanica',
    subject: 'Física & Mecânica Clássica',
    category: 'Exatas',
    title: 'Exame Modelo: Dinâmica, Leis de Newton & Energia',
    description: 'Teste de mecânica clássica sobre conservação da energia mecânica, força de atrito e impulso.',
    questions: [
      {
        id: 1,
        question: 'Um corpo desliza sem atrito num plano inclinado. A aceleração depende de:',
        options: [
          'Apenas da aceleração da gravidade e do ângulo de inclinação: a = g * sen(θ).',
          'Exclusivamente da massa total do corpo.',
          'Da velocidade inicial com que o corpo foi lançado.',
          'Do volume e densidade do objeto.',
        ],
        correctAnswer: 0,
        explanation: 'Na ausência de atrito, a componente da força gravítica paralela ao plano é Px = m*g*sen(θ). Pela 2ª Lei de Newton: m*a = m*g*sen(θ) => a = g*sen(θ).',
      },
      {
        id: 2,
        question: 'O Teorema do Trabalho e da Energia Cinética afirma que o trabalho da força resultante é igual a:',
        options: [
          'Variação da Energia Cinética (W = ΔEc).',
          'Energia Potencial Gravítica final.',
          'Soma de todas as forças de atrito.',
          'Zero em qualquer circunstância.',
        ],
        correctAnswer: 0,
        explanation: 'O Teorema Trabalho-Energia estabelece que W_total = Ec_final - Ec_inicial = ΔEc.',
      },
    ],
  },
];

const STORAGE_SAVED_TOKENS_KEY = 'nexo_saved_tokens_count';
const STORAGE_COMMUNITY_COURSES_KEY = 'nexo_community_courses';

class KnowledgeReuseService {
  public getAllCourseTemplates(): CourseTemplate[] {
    const community = this.getCommunityTemplates();
    return [...VERIFIED_COURSE_TEMPLATES, ...community];
  }

  public getCommunityTemplates(): CourseTemplate[] {
    try {
      const saved = localStorage.getItem(STORAGE_COMMUNITY_COURSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public saveToCommunityTemplates(course: CourseTemplate): void {
    try {
      const current = this.getCommunityTemplates();
      if (!current.some((c) => c.title.toLowerCase() === course.title.toLowerCase())) {
        current.unshift(course);
        localStorage.setItem(STORAGE_COMMUNITY_COURSES_KEY, JSON.stringify(current.slice(0, 50)));
      }
    } catch {
      // ignore
    }
  }

  public findMatchingCourseTemplate(query: string): CourseTemplate | null {
    if (!query || !query.trim()) return null;
    const cleanQuery = query.toLowerCase().trim();
    const all = this.getAllCourseTemplates();

    // 1. Direct tag/title match
    for (const t of all) {
      if (t.title.toLowerCase().includes(cleanQuery) || cleanQuery.includes(t.title.toLowerCase())) {
        return t;
      }
      if (t.tags.some((tag) => cleanQuery.includes(tag.toLowerCase()) || tag.toLowerCase().includes(cleanQuery))) {
        return t;
      }
    }

    // 2. Fuzzy keywords match
    const words = cleanQuery.split(/\s+/).filter((w) => w.length > 3);
    for (const t of all) {
      const matchCount = words.filter((w) =>
        t.title.toLowerCase().includes(w) || t.tags.some((tag) => tag.toLowerCase().includes(w))
      ).length;

      if (matchCount >= 2 || (words.length === 1 && matchCount === 1)) {
        return t;
      }
    }

    return null;
  }

  public recordTokenSavings(tokens: number): void {
    try {
      const current = parseInt(localStorage.getItem(STORAGE_SAVED_TOKENS_KEY) || '0', 10);
      const updated = current + tokens;
      localStorage.setItem(STORAGE_SAVED_TOKENS_KEY, String(updated));
    } catch {
      // ignore
    }
  }

  public getSavedTokensCount(): number {
    try {
      return parseInt(localStorage.getItem(STORAGE_SAVED_TOKENS_KEY) || '42500', 10);
    } catch {
      return 42500;
    }
  }

  public getAllExamTemplates(): ExamTemplate[] {
    return VERIFIED_EXAM_TEMPLATES;
  }

  public findMatchingExamTemplate(query: string): ExamTemplate | null {
    if (!query || !query.trim()) return null;
    const q = query.toLowerCase().trim();
    return (
      VERIFIED_EXAM_TEMPLATES.find(
        (ex) =>
          ex.title.toLowerCase().includes(q) ||
          ex.subject.toLowerCase().includes(q) ||
          q.includes(ex.subject.toLowerCase())
      ) || null
    );
  }
}

export const knowledgeReuseService = new KnowledgeReuseService();
