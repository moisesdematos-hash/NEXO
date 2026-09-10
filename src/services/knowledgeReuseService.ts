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
    description: 'Curso completo e profissional com 10 módulos: sintaxe, automação, estruturas de dados, POO, APIs, bases de dados e IA.',
    iconName: 'Code',
    estimatedHours: 40,
    rating: 4.95,
    studentsCount: 1420,
    tags: ['python', 'programação', 'código', 'backend', 'dados', 'data science'],
    stages: [
      { title: 'Módulo 1: Fundamentos & Configuração do Ambiente', topics: ['Instalação do Python, VS Code e Ambiente Virtual', 'Variáveis, Tipos Primitivos e Operadores Aritméticos', 'Entrada e Saída de Dados com Print e Input'] },
      { title: 'Módulo 2: Estruturas de Controlo e Decisão', topics: ['Condicionais if, elif e else com Operadores Lógicos', 'Tratamento de Fluxos Complexos e Expressões Ternárias', 'Exercícios Práticos de Algoritmos de Decisão'] },
      { title: 'Módulo 3: Ciclos de Repetição e Iterações', topics: ['Ciclos For, Range e Enumerate', 'Ciclos While, Break, Continue e Pass', 'Iteração em Coleções e List Comprehensions'] },
      { title: 'Módulo 4: Funções, Âmbitos e Boas Práticas', topics: ['Declaração de Funções com Parâmetros e Retorno', 'Argumentos *args e **kwargs com Tipagem Estática', 'Funções Lambda, Map, Filter e Reduce'] },
      { title: 'Módulo 5: Estruturas de Dados Avançadas', topics: ['Listas, Tuplos, Conjuntos (Sets) e Métodos Nativos', 'Dicionários Profundos e Dicionários Comprehension', 'Módulo Collections: Counter, Defaultdict e Namedtuple'] },
      { title: 'Módulo 6: Tratamento de Erros e Ficheiros', topics: ['Blocos Try, Except, Else e Finally com Exceções Customizadas', 'Manipulação de Ficheiros TXT, CSV e JSON com Context Managers', 'Leitura e Escrita Segura em Disco'] },
      { title: 'Módulo 7: Programação Orientada a Objetos (POO)', topics: ['Classes, Atributos de Instância e de Classe', 'Métodos Especiais (__init__, __str__, __repr__)', 'Encapsulamento, Getters, Setters e Propriedades'] },
      { title: 'Módulo 8: POO Avançada & Padrões de Design', topics: ['Herança Simples, Múltipla e Resolução MRO', 'Polimorfismo e Classes Abstratas com Módulo ABC', 'Composição vs Herança e Padrão Factory'] },
      { title: 'Módulo 9: APIs REST, Web Scraping & Automação', topics: ['Consumo de APIs REST com Biblioteca Requests', 'Web Scraping Ético com BeautifulSoup e Selenium', 'Automação de Tarefas Repetitivas e Envio de Relatórios'] },
      { title: 'Módulo 10: Bases de Dados, IA & Projeto Final', topics: ['Persistência com SQLite e SQLAlchemy ORM', 'Integração com Modelos de IA e LLMs', 'Projeto Final: Sistema Completo de Gestão e Dashboard'] },
    ],
  },
  {
    id: 'course-financas-pessoais',
    title: 'Gestão de Finanças Pessoais & Orçamento',
    category: 'Finanças',
    description: 'Guia definitivo de 10 módulos: diagnóstico, corte de dívidas, poupança automática, fiscalidade, investimentos e liberdade financeira.',
    iconName: 'TrendingUp',
    estimatedHours: 35,
    rating: 4.96,
    studentsCount: 2310,
    tags: ['finanças', 'dinheiro', 'orçamento', 'poupança', 'investimentos', 'economia', 'renda'],
    stages: [
      { title: 'Módulo 1: Mentalidade & Diagnóstico Financeiro', topics: ['Psicologia do Dinheiro e Vieses Comportamentais', 'Mapeamento Completo de Receitas e Despesas Fixas', 'Cálculo do Património Líquido e Raio-X Financeiro'] },
      { title: 'Módulo 2: O Método de Orçamento 50/30/20', topics: ['Estruturação das Necessidades (50%), Desejos (30%) e Poupança (20%)', 'Teto Orçamental Mensal e Alertas de Desvio', 'Ferramentas Digitais e Gestão Familiar no NEXO'] },
      { title: 'Módulo 3: Fundo de Emergência & Segurança', topics: ['Cálculo dos 6 a 12 Meses de Custos de Sobrevivência', 'Onde Alocar o Fundo de Emergência com Liquidez Imediata', 'Diferença entre Emergência Real e Desejo Impulsivo'] },
      { title: 'Módulo 4: Estratégia Agressiva Anti-Dívidas', topics: ['Mapeamento das Taxas de Juro (TAEG / TAN)', 'Método Bola de Neve vs Método Avalancha', 'Renegociação de Crédito Pessoal e Consolidação Bancária'] },
      { title: 'Módulo 5: Otimização de Custos Domésticos', topics: ['Renegociação de Faturas de Eletricidade, Gás e Telecomunicações', 'Planeamento de Supermercado e Redução do Desperdício Alimentar', 'Auditoria de Subscrições e Pagamentos Recorrentes'] },
      { title: 'Módulo 6: Crédito Habitação & Grandes Decisões', topics: ['Taxa Fixa, Mista ou Variável: Como Escolher', 'Amortização Antecipada de Empréstimos da Casa', 'Seguros Associados e Poupança com Transferência de Seguros'] },
      { title: 'Módulo 7: Introdução aos Investimentos e Inflação', topics: ['O Efeito Destruidor da Inflação no Dinheiro Parado', 'Certificados de Aforro e Depósitos a Prazo em Portugal', 'Perfil de Risco do Investidor: Conservador, Moderado e Agressivo'] },
      { title: 'Módulo 8: Fundos de Índice e ETFs Globais', topics: ['O Poder dos Juros Compostos a Longo Prazo', 'ETFs de Índices Mundiais (S&P 500, MSCI World e All-World)', 'Estratégia DCA (Dollar-Cost Averaging) de Aportes Mensais'] },
      { title: 'Módulo 9: Fiscalidade, IRS & Otimização de Impostos', topics: ['Escalões de IRS, Deduções à Coleta e Faturas com NIF', 'Tributação de Mais-Valias e Dividendos', 'PPR (Plano Poupança Reforma) e Benefícios Fiscais à Entrada'] },
      { title: 'Módulo 10: Renda Passiva & Plano de Independência', topics: ['Cálculo do Número FIRE (Financial Independence)', 'Regra dos 4% para Retirada Sustentável na Reforma', 'Plano Estratégico de 10 Anos para Liberdade Financeira'] },
    ],
  },
  {
    id: 'course-ingles-conversacao',
    title: 'Inglês Prático para Conversação & Trabalho',
    category: 'Idiomas',
    description: 'Imersão completa em 10 módulos: fonética, conversação natural, gramática essencial, emails, reuniões, viagens e fluência.',
    iconName: 'Languages',
    estimatedHours: 45,
    rating: 4.94,
    studentsCount: 3100,
    tags: ['inglês', 'idiomas', 'english', 'conversação', 'falar', 'vocabulário', 'trabalho'],
    stages: [
      { title: 'Módulo 1: Desbloqueio e Fonética Essencial', topics: ['Pronúncia e Articulação dos Sons TH, R e V', 'Intonação, Conexão de Palavras (Connected Speech) e Ritmo', 'Eliminação da Vergonha e Técnicas de Destravamento Oral'] },
      { title: 'Módulo 2: Apresentações e Small Talk Diário', topics: ['Apresentar-se, Falar de Si, Origens e Família', 'Como Manter uma Conversa Informal Fluida', 'Perguntas Rápidas de Quebra-Gelo (Icebreakers)'] },
      { title: 'Módulo 3: Rotinas, Hábitos e o Present Simple', topics: ['Descrição Detalhada do Dia a Dia e Hábitos', 'Advérbios de Frequência e Estrutura Temporal', 'Expressão de Gostos, Preferências e Opiniões'] },
      { title: 'Módulo 4: Narrativas e o Past Simple', topics: ['Contar Histórias e Experiências Passadas', 'Os 50 Verbos Irregulares Mais Usados em Contexto', 'Diferença entre Past Simple e Past Continuous'] },
      { title: 'Módulo 5: Planos, Metas e Estruturas de Futuro', topics: ['Uso Correto de Will vs Going to', 'Expressar Previsões, Decisões Espontâneas e Compromissos', 'Vocabulário para Projetos e Aspirações Futuras'] },
      { title: 'Módulo 6: Viagens, Restaurantes e Emergências', topics: ['Diálogos no Aeroporto, Controlo de Passaportes e Alfândega', 'Check-in em Hotéis, Pedidos em Restaurantes e Café', 'Como Pedir Direções, Farmácia e Lidar com Imprevistos'] },
      { title: 'Módulo 7: Inglês Corporativo & Emails Formais', topics: ['Redação de Emails Profissionais Claros e Concisos', 'Expressões de Cortesia e Acompanhamento (Follow-up)', 'Vocabulário de Gestão, Finanças e Negócios'] },
      { title: 'Módulo 8: Reuniões, Chamadas e Apresentações', topics: ['Como Intervir e Apresentar Ideias em Reuniões Online', 'Argumentação, Concordância e Discordância Educada', 'Apresentação de Slides e Explicação de Gráficos em Inglês'] },
      { title: 'Módulo 9: Phrasal Verbs & Expressões Idiomáticas', topics: ['Os 40 Phrasal Verbs Mais Comuns com Exemplos Reais', 'Expressões Idiomáticas Nativas para Soar Fluente', 'Gírias Corporativas e Linguagem Moderna'] },
      { title: 'Módulo 10: Fluência, Imersão e Entrevista de Emprego', topics: ['Simulação de Entrevista de Emprego Completa em Inglês', 'Técnica de Shadowing com Podcasts e Notícias', 'Plano Contínuo de Prática Diária com o Tutor IA do NEXO'] },
    ],
  },
  {
    id: 'course-marketing-digital',
    title: 'Marketing Digital & Criação de Conteúdo',
    category: 'Negócios',
    description: 'Formação aprofundada em 10 módulos: persona, funil de vendas, copywriting, redes sociais, SEO, tráfego pago, lançamentos e retenção.',
    iconName: 'Briefcase',
    estimatedHours: 38,
    rating: 4.91,
    studentsCount: 980,
    tags: ['marketing', 'vendas', 'redes sociais', 'instagram', 'copywriting', 'anúncios', 'negócios'],
    stages: [
      { title: 'Módulo 1: Fundamentos & Estratégia de Marca', topics: ['Definição da Persona / Avatar e Análise de Dores e Desejos', 'Proposta Única de Valor (UVP) e Posicionamento no Mercado', 'Branding, Tom de Voz e Identidade Visual'] },
      { title: 'Módulo 2: O Funil de Vendas Estruturado', topics: ['Topo de Funil: Atração e Descoberta', 'Meio de Funil: Nutrição e Construção de Confiança', 'Fundo de Funil: Oferta e Conversão Final'] },
      { title: 'Módulo 3: Copywriting & Gatilhos Mentais', topics: ['Estruturas Clássicas de Copy (AIDA, PAS e Storytelling)', 'Gatilhos de Escassez, Urgência, Autoridade e Prova Social', 'Criação de Headlines Irresistíveis que Geram Cliques'] },
      { title: 'Módulo 4: Marketing de Conteúdo & Redes Sociais', topics: ['Planeamento de Calendário Editorial Estratégico', 'Formatos de Alto Alcance: Reels, Carrosséis e Vídeos Curtos', 'Engajamento Real, Comunidade e Gestão de Mensagens Diretas'] },
      { title: 'Módulo 5: SEO & Tráfego Orgânico no Google', topics: ['Pesquisa de Palavras-Chave de Alta Intenção de Compra', 'Otimização On-Page de Artigos e Páginas de Produto', 'Estratégia de Link Building e Autoridade de Domínio'] },
      { title: 'Módulo 6: Email Marketing & Automação', topics: ['Construção de Lista de Leads com Iscas Digitais (Lead Magnets)', 'Sequências Automáticas de Boas-Vindas e Nutrição', 'Segmentação de Base e Recuperação de Carrinhos Abandonados'] },
      { title: 'Módulo 7: Tráfego Pago: Meta Ads (Facebook & Instagram)', topics: ['Configuração do Gestor de Anúncios e Pixel / CAPI', 'Criação de Campanhas de Reconhecimento, Tráfego e Conversão', 'Estratégia de Criativos, Testes A/B e Otimização de Custos'] },
      { title: 'Módulo 8: Tráfego Pago: Google Ads & YouTube', topics: ['Rede de Pesquisa do Google: Foco no Fundo de Funil', 'Campanhas de Performance Max e Anúncios em Vídeo no YouTube', 'Palavras-Chave Negativas e Otimização de Orçamento'] },
      { title: 'Módulo 9: Páginas de Captura, Vendas e CRO', topics: ['Estrutura Perfeita de uma Landing Page de Alta Conversão', 'Design Focado na Ação e Eliminação de Fricção', 'Otimização da Taxa de Conversão (CRO) e Testes de Checkout'] },
      { title: 'Módulo 10: Métricas, Retenção & Escala do Negócio', topics: ['Leitura de Métricas Nucleares: CAC, LTV, ROAS e ROI', 'Estratégias de Pós-Venda, Upsell, Cross-Sell e Indicação', 'Plano Integrado de Crescimento Anual de Marketing'] },
    ],
  },
  {
    id: 'course-foco-produtividade',
    title: 'Hiperfoco, Hábitos & Gestão do Tempo',
    category: 'Produtividade',
    description: 'Metodologia científica em 10 módulos: neurociência do foco, bloqueio de distrações, Time-Blocking, rotinas matinais e execução impecável.',
    iconName: 'Zap',
    estimatedHours: 30,
    rating: 4.97,
    studentsCount: 1850,
    tags: ['foco', 'produtividade', 'hábitos', 'tempo', 'procrastinação', 'pomodoro', 'rotina'],
    stages: [
      { title: 'Módulo 1: Neurociência da Atenção & Foco', topics: ['Como o Cérebro Processa Estímulos e o Efeito da Dopamina', 'A Ilusão do Multitasking e o Custo da Mudança de Contexto', 'Os 3 Tipos de Atenção: Focada, Difusa e Sustentada'] },
      { title: 'Módulo 2: Desconstrução da Procrastinação', topics: ['As Raízes Psicológicas do Adiamento: Medo do Fracasso e Perfeccionismo', 'A Regra dos 2 Minutos e Ativação do Impulso Inicial', 'Técnica de Divisão de Tarefas Monstruosas em Micro-Passos'] },
      { title: 'Módulo 3: Otimização do Ambiente e Higiene Digital', topics: ['Configuração Anti-Distração do Smartphone e Computador', 'Organização Ergonómica do Espaço Físico de Trabalho', 'Filtro de Notificações e Horários Pré-Determinados de Mensagens'] },
      { title: 'Módulo 4: Time-Blocking & Planeamento de Dias Temáticos', topics: ['O Conceito de Time-Blocking vs Listas Infinitas de Tarefas', 'Agrupamento de Tarefas Semelhantes (Batch Processing)', 'Estruturação de Dias Foco, Dias Buffer e Dias de Recuperação'] },
      { title: 'Módulo 5: Matriz de Eisenhower & Priorização Extrema', topics: ['Distinção Crucial entre o Urgente e o Importante', 'A Regra 80/20 (Princípio de Pareto) Aplicada ao Trabalho', 'A Arte de Dizer Não com Assertividade e Diplomacia'] },
      { title: 'Módulo 6: A Técnica Pomodoro Avançada & Soundscapes', topics: ['Estruturação de Ciclos de Trabalho Profundo (Deep Work)', 'Uso de Frequências Binaurais e Sons de Foco no NEXO', 'Gestão Ativa de Intervalos de Recuperação Cerebral'] },
      { title: 'Módulo 7: Construção de Hábitos Atómicos Sólidos', topics: ['O Loop do Hábito: Gatilho, Desejo, Resposta e Recompensa', 'Técnica de Empilhamento de Hábitos (Habit Stacking)', 'Acompanhamento Visual de Consistência sem Quebrar a Corrente'] },
      { title: 'Módulo 8: Rotinas Matinais e Rituais Noturnos', topics: ['O Impacto da Primeira Hora do Dia na Produtividade', 'Higiene do Sono e Rituais de Desaceleração Noturna', 'Preparação do Dia Seguinte na Véspera'] },
      { title: 'Módulo 9: Revisão Semanal & Auditoria de Tempo', topics: ['O Ritual da Revisão Semanal de 30 Minutos', 'Identificação de Ladrões de Tempo e Fugas de Produtividade', 'Ajuste Dinâmico de Metas com o Sistema NEXO'] },
      { title: 'Módulo 10: Sustentabilidade, Prevenção de Burnout & Maestria', topics: ['Equilíbrio entre Alta Performance e Saúde Mental', 'Gestão de Energia Física, Emocional e Mental', 'Criação do Teu Sistema Pessoal Definitivo de Produtividade'] },
    ],
  },
  {
    id: 'course-inteligencia-artificial',
    title: 'Inteligência Artificial Prática no Quotidiano',
    category: 'Tecnologia',
    description: 'Domínio avançado em 10 módulos: engenharia de prompts, automações, análise de dados, geração de imagens, agentes e IA no trabalho.',
    iconName: 'Sparkles',
    estimatedHours: 36,
    rating: 4.98,
    studentsCount: 2750,
    tags: ['ia', 'inteligencia artificial', 'prompts', 'chatgpt', 'groq', 'automação', 'tecnologia'],
    stages: [
      { title: 'Módulo 1: Fundamentos de Modelos Generativos e LLMs', topics: ['Como Funcionam as Redes Neuronais e Arquiteturas de Transformadores', 'Diferenças entre Modelos de Texto, Visão e Áudio', 'Parâmetros Críticos: Temperatura, Top-P e Janela de Contexto'] },
      { title: 'Módulo 2: Engenharia de Prompts de Nível Profissional', topics: ['Estrutura RTC: Função (Role), Tarefa (Task) e Contexto (Context)', 'Técnicas de Few-Shot Prompting e Chain-of-Thought (CoT)', 'Prevenção de Alucinações e Verificação de Factos'] },
      { title: 'Módulo 3: Resumos, Leitura e Análise Crítica de Documentos', topics: ['Extração de Insights Chave de PDFs, Relatórios e Livros', 'Análise Comparativa de Múltiplos Textos e Síntese Executiva', 'Criação de Guias de Estudo e Flashcards a Partir de Ficheiros'] },
      { title: 'Módulo 4: Redação de Alto Impacto & Copywriting com IA', topics: ['Geração de Artigos de Opinião, Relatórios e Manuais Técnicos', 'Adaptação de Tom de Voz para Diferentes Públicos e Marcas', 'Revisão Ortográfica, Estilística e Otimização de Textos'] },
      { title: 'Módulo 5: Análise de Dados, Fórmulas Excel e Dashboards', topics: ['Interpretação de Folhas de Cálculo e Limpeza de Dados com IA', 'Geração de Fórmulas Complexas de Excel e Google Sheets', 'Criação de Gráficos e Narrativas Baseadas em Números'] },
      { title: 'Módulo 6: Criação Visual com Modelos de Imagem', topics: ['Princípios de Criação de Prompts Visuais e Estética', 'Estilos de Fotografia, Ilustração, 3D e Renders de Produto', 'Composição, Iluminação e Otimização para Redes Sociais'] },
      { title: 'Módulo 7: Voz, Transcrição & Assistentes Falados', topics: ['Sistemas de Speech-to-Text (STT) e Text-to-Speech (TTS)', 'Transcrição e Resumo Automático de Reuniões e Áudios', 'Comandos de Voz no NEXO e Produtividade Hands-Free'] },
      { title: 'Módulo 8: Automações de Workflows e Produtividade', topics: ['Integração de IA com Ferramentas do Dia a Dia', 'Criação de Fluxos de Trabalho que Operam em Piloto Automático', 'Automação de Respostas a Clientes e Triagem de Mensagens'] },
      { title: 'Módulo 9: Agentes Autónomos e Assistentes com Memória', topics: ['O Conceito de Agentes de IA com Acesso a Ferramentas (Tools)', 'Memória de Longo Prazo e Perfil do Utilizador', 'Construção de um Assistente de Especialidade Sob Medida'] },
      { title: 'Módulo 10: Ética, Segurança de Dados & O Futuro do Trabalho', topics: ['Privacidade de Dados e Segurança da Informação Empresarial', 'Impactos da IA no Mercado de Trabalho e Habilidades do Futuro', 'Projeto Final: O Meu Sistema Pessoal de IA no NEXO'] },
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
