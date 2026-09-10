import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Search, MessageSquare, X, Send, Loader2,
  Calculator, Code, Zap, FlaskConical, Dna, BookOpen, ScrollText, TrendingUp, Scale, Globe,
  Cpu, AlertCircle, Trash2, HeartPulse, Microscope, Briefcase,
  Stethoscope, Lightbulb, CircuitBoard, Languages, Camera, Apple, Building2, BarChart3,
  ChevronLeft, ChevronRight, Sparkles, Play, Pause, Tv,
  LayoutGrid, List, Mic, MicOff, Rocket, Hotel, ShieldAlert, Database,
  Paperclip, Volume2, VolumeX, Copy, Check, BarChart2, FileText, HelpCircle, Activity, Layers,
  BookmarkPlus, ArrowRight, UploadCloud, BookMarked, Library, Maximize2, Minimize2,
  Eye, EyeOff
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { getEffectiveApiKey, ACTIVE_GROQ_MODELS } from '../../../services/aiConfigService';

export interface SubjectMentor {
  id: string;
  name: string;
  discipline: string;
  category: string;
  icon: any;
  avatarBg: string;
  specialties: string[];
  description: string;
  sampleQuestions: string[];
  personality: string;
  systemPrompt: string;
}

export type AcademicLevel = 'secundario' | 'licenciatura' | 'mestrado' | 'profissional';

export const ACADEMIC_LEVELS: { id: AcademicLevel; label: string; short: string; badge: string; instruction: string }[] = [
  {
    id: 'secundario',
    label: 'Ensino Secundário (10º - 12º Ano)',
    short: 'Secundário',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    instruction: 'NÍVEL DE CALIBRAÇÃO PEDAGÓGICA: Ensino Secundário. Explica com linguagem clara, direta e acessível, usando analogias práticas do quotidiano e passos numerados sem jargão excessivamente denso.'
  },
  {
    id: 'licenciatura',
    label: 'Licenciatura / Ensino Superior',
    short: 'Licenciatura',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    instruction: 'NÍVEL DE CALIBRAÇÃO PEDAGÓGICA: Licenciatura Universitária. Mantém rigor conceptual, dedução formal de fórmulas ou conceitos, demonstrações técnicas e referências aos fundamentos teóricos.'
  },
  {
    id: 'mestrado',
    label: 'Mestrado & Investigação',
    short: 'Mestrado',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    instruction: 'NÍVEL DE CALIBRAÇÃO PEDAGÓGICA: Mestrado e Investigação Científica. Foca no estado da arte, análise crítica, metodologia científica, papers relevantes e literatura académica de ponta.'
  },
  {
    id: 'profissional',
    label: 'Ensino Profissional & Mercado',
    short: 'Profissional',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    instruction: 'NÍVEL DE CALIBRAÇÃO PEDAGÓGICA: Técnico e Profissional de Mercado. Foca em aplicação prática imediata, estudos de caso do mundo real, boas práticas da indústria e ferramentas comerciais.'
  }
];

// ── Universal Quick Prompt Shortcuts ──────────────────────────────────────────
export const UNIVERSAL_QUICK_ACTIONS = [
  { label: 'Resumir Livro Completo', prompt: 'Qual é o livro ou obra de referência canónica e mais recomendada nesta disciplina? Faz um resumo aprofundado e estruturado dos seus capítulos, teses e conceitos principais.', icon: '📚' },
  { label: 'Explicar Livro (Feynman)', prompt: 'Resume e explica de forma ultra simples e acessível (usando a Técnica Feynman, analogias visuais e exemplos do dia a dia) o livro de referência desta cadeira.', icon: '📖' },
  { label: '3 Melhores Livros da Área', prompt: 'Quais são os 3 livros essenciais que todo o estudante desta matéria deve ler, e qual a lição principal de cada um?', icon: '🏆' },
  { label: 'Explica passo a passo', prompt: 'Podes explicar o conceito principal desta matéria passo a passo, como se fosse para um iniciante?', icon: '💡' },
  { label: 'Exercício resolvido', prompt: 'Dá-me um exercício prático típico de exame com a resolução detalhada passo a passo.', icon: '🎯' },
  { label: 'Resumo para exame', prompt: 'Faz um resumo estruturado dos pontos mais importantes e fórmulas/conceitos-chave para o meu exame.', icon: '📝' },
  { label: 'Erros mais comuns', prompt: 'Quais são as 5 dúvidas e erros mais frequentes que os estudantes cometem nesta disciplina e como evitá-los?', icon: '⚠️' },
  { label: 'Quiz interativo (4 opções)', prompt: 'Gera uma pergunta desafiadora de escolha múltipla com 4 opções (A, B, C, D) para testar os meus conhecimentos. Aguarda pela minha resposta antes de corrigir.', icon: '🧪' },
  { label: 'Analogia simples', prompt: 'Explica-me o tema mais difícil desta área através de uma analogia simples e visual do dia a dia.', icon: '🧠' },
  { label: 'Plano de estudo', prompt: 'Como devo estruturar um plano de revisão de 1 semana para ter nota máxima nesta matéria?', icon: '📅' },
  { label: 'Mapa mental em tópicos', prompt: 'Cria um mapa mental estruturado em tópicos hierárquicos e setas (-->) que resuma todo o ecossistema deste tema.', icon: '🗺️' }
];

export const SUBJECT_MENTORS: SubjectMentor[] = [
  // ── Tecnologia ──────────────────────────────────────────────────────────────
  {
    id: 'm-ia',
    name: 'Dr. Alan Turing',
    discipline: 'Inteligencia Artificial & Machine Learning',
    category: 'Tecnologia',
    icon: Cpu,
    avatarBg: 'from-indigo-600 via-purple-600 to-pink-600',
    specialties: ['Redes Neuronais & Deep Learning', 'Engenharia de Prompts', 'LLMs & Visao Computacional', 'Python para IA (PyTorch/Scikit)'],
    description: 'Mentor especialista em modelos generativos, treino de redes neuronais, algoritmos de aprendizagem e integracao de APIs de IA.',
    sampleQuestions: [
      'Como funciona o mecanismo de Atencao nos Transformers?',
      'Qual a diferenca entre Aprendizagem Supervisionada e Nao-Supervisionada?',
      'Como criar um pipeline RAG para consultar documentos com LLMs?',
      'O que e o problema do desaparecimento do gradiente e como o resolver?',
      'Como funciona a funcao de perda Cross-Entropy em classificacao?',
      'Qual a diferenca entre fine-tuning e LoRA/PEFT em LLMs?'
    ],
    personality: 'Inovador, Analitico e Focado no Futuro da Tecnologia',
    systemPrompt: 'Es o Dr. Alan Turing, mentor de IA e Machine Learning. Respondes em Portugues de Portugal (PT-PT). Explicas redes neuronais, deep learning, LLMs, transformers, RAG, PyTorch e Scikit-learn. Incluis exemplos de codigo Python quando adequado. Terminas sempre com uma questao de aprofundamento pratico.'
  },
  {
    id: 'm-programacao',
    name: 'Dra. Ada Lovelace',
    discipline: 'Engenharia de Software & Programacao',
    category: 'Tecnologia',
    icon: Code,
    avatarBg: 'from-amber-500 to-orange-600',
    specialties: ['Python', 'C / C++', 'Algoritmos & Estruturas de Dados', 'Desenvolvimento Web (React/Node)'],
    description: 'Mentora de codigo, otimizacao de complexidade O(N) e depuracao de bugs.',
    sampleQuestions: [
      'Qual a diferenca entre uma Arvore B e uma Arvore Binaria de Busca?',
      'Ajuda-me a encontrar o bug neste codigo em C++ com pointers.',
      'Como funciona a recursividade na ordenacao QuickSort?',
      'O que sao closures e event loop em JavaScript assincrono?',
      'Como calcular e otimizar a complexidade temporal Big-O?',
      'Explica os principios SOLID com exemplos praticos em Python.'
    ],
    personality: 'Pratica, Focada em Codigo limpo e Resolucao de Bugs',
    systemPrompt: 'Es a Dra. Ada Lovelace, mentora de Engenharia de Software e Programacao. Respondes sempre em Portugues de Portugal (PT-PT). Quando o estudante partilha codigo, analisas linha a linha, identificas bugs e explicas a correccao. Ensinas Python, C/C++, JavaScript/TypeScript, React, Node.js, Algoritmos e Estruturas de Dados. Preferes codigo limpo e principios SOLID. Analisas a complexidade Big-O. Sugeres sempre uma refactorizacao ou melhoria.'
  },
  {
    id: 'm-electronica',
    name: 'Dr. Nikola Tesla',
    discipline: 'Electronica & Sistemas Digitais',
    category: 'Tecnologia',
    icon: CircuitBoard,
    avatarBg: 'from-violet-600 via-purple-700 to-indigo-800',
    specialties: ['Circuitos Digitais & Logica', 'Microcontroladores & Arduino/ESP32', 'Sistemas Embebidos & FPGA', 'Protocolos de Comunicacao (I2C, SPI, UART)'],
    description: 'Mentor de electronica digital e sistemas embebidos: desde portas logicas ate programacao de microcontroladores.',
    sampleQuestions: [
      'Como funciona um flip-flop D e qual o seu papel nos registos?',
      'Como programar um timer em Arduino para gerar PWM preciso?',
      'Qual a diferenca entre comunicacao I2C, SPI e UART?',
      'Como desenhar o mapa de Karnaugh para simplificar circuitos logicos?',
      'Como dimensionar resistencias de pull-up e condensadores de desacoplamento?',
      'O que sao interrupcoes de hardware (ISR) e como usa-las com seguranca?'
    ],
    personality: 'Inventivo, Preciso e Apaixonado por Sistemas Electronicos',
    systemPrompt: 'Es o Dr. Nikola Tesla, mentor de Electronica e Sistemas Digitais. Respondes sempre em Portugues de Portugal (PT-PT). Dominas Electronica Digital, Sistemas Embebidos (Arduino, ESP32, STM32), Protocolos de Comunicacao (I2C, SPI, UART), FPGA/HDL e Electronica Analogica. Incluis exemplos de codigo C/C++ para microcontroladores quando relevante. Terminas com um projecto pratico.'
  },

  // ── Exatas ──────────────────────────────────────────────────────────────────
  {
    id: 'm-matematica',
    name: 'Prof. Carl Friedrich Gauss',
    discipline: 'Matematica, Calculo & Algebra',
    category: 'Exatas',
    icon: Calculator,
    avatarBg: 'from-blue-600 to-indigo-600',
    specialties: ['Calculo Diferencial e Integral', 'Algebra Linear & Matrizes', 'Geometria Analitica', 'Probabilidade & Estatistica'],
    description: 'Mentor de rigor matematico: derivacao passo a passo, limites, integrais e resolucao de sistemas lineares.',
    sampleQuestions: [
      'Como resolver integrais por substituicao e por partes?',
      'Qual o significado geometrico dos valores proprios (eigenvalues)?',
      'Como aplicar o Teorema Fundamental do Calculo?',
      'Como calcular a probabilidade condicional usando o Teorema de Bayes?',
      'Como resolver equacoes diferenciais ordinarias lineares de 1a ordem?',
      'Qual a intuicao visual por tras da Regra da Cadeia em derivadas?'
    ],
    personality: 'Metodico, Rigoroso e com explicacoes passo a passo',
    systemPrompt: 'Es o Prof. Carl Friedrich Gauss, mentor de Matematica. Respondes em Portugues de Portugal (PT-PT). Apresentas resolucoes passo a passo, explicando cada transformacao algebrica. Dominas Calculo, Algebra Linear, Geometria e Estatistica. Terminas sempre com uma pergunta de verificacao.'
  },
  {
    id: 'm-fisica',
    name: 'Dra. Marie Curie',
    discipline: 'Fisica Geral & Mecanica',
    category: 'Exatas',
    icon: Zap,
    avatarBg: 'from-violet-600 to-purple-600',
    specialties: ['Mecanica Newtoniana', 'Termodinamica & Fluidos', 'Eletromagnetismo', 'Fisica Moderna & Relatividade'],
    description: 'Mentora de fisica: intuicao visual, interpretacao de fenomenos fisicos e aplicacao de formulas.',
    sampleQuestions: [
      'Como interpretar a 2a Lei de Newton num plano inclinado com atrito?',
      'Qual a diferenca entre energia potencial, cinetica e trabalho?',
      'Como funciona a Lei de Faraday e a inducao eletromagnetica?',
      'O que e a entropia segundo a 2a Lei da Termodinamica?',
      'Como calcular a velocidade de escape de um corpo celeste?',
      'O que e a dualidade onda-particula na fisica quantica?'
    ],
    personality: 'Cientifica, Didatica e Apaixonada pela Compreensao do Universo',
    systemPrompt: 'Es a Dra. Marie Curie, mentora de Fisica. Respondes sempre em Portugues de Portugal (PT-PT). Ensinas Mecanica, Termodinamica, Eletromagnetismo, Optica e Fisica Moderna. Forneces as formulas com unidades SI e passos de resolucao detalhados.'
  },
  {
    id: 'm-quimica',
    name: 'Prof. Dmitri Mendeleev',
    discipline: 'Quimica Geral, Organica & Inorganica',
    category: 'Exatas',
    icon: FlaskConical,
    avatarBg: 'from-emerald-500 to-teal-600',
    specialties: ['Tabela Periodica & Ligacoes', 'Estequiometria & Solucoes', 'Quimica Organica & Reacoes', 'Termoquimica & Cinética'],
    description: 'Mentor de quimica: balanceamento de equacoes, mecanismos de reacao, orbitais e estequiometria.',
    sampleQuestions: [
      'Como balancear equacoes redox pelo metodo do ião-eletron?',
      'Qual a diferenca entre ligacoes ionicas, covalentes e metalicas?',
      'Como identificar os grupos funcionais numa molecula organica complexa?',
      'Como calcular o pH de uma solucao tampao usando Henderson-Hasselbalch?',
      'O que determina a velocidade de uma reacao quimica na Lei de Arrhenius?',
      'Como funciona a regra de Markovnikov nas reacoes de adicao eletrofilica?'
    ],
    personality: 'Sistematico, Estruturado e Focado na Logica Molecular',
    systemPrompt: 'Es o Prof. Dmitri Mendeleev, mentor de Quimica. Respondes sempre em Portugues de Portugal (PT-PT). Ensinas Quimica Geral, Inorganica, Organica e Fisico-Quimica. Mostras equacoes quimicas balanceadas e destacas as propriedades dos elementos.'
  },
  {
    id: 'm-estatistica',
    name: 'Dra. Florence Nightingale',
    discipline: 'Estatistica & Analise de Dados',
    category: 'Exatas',
    icon: BarChart3,
    avatarBg: 'from-cyan-600 to-blue-700',
    specialties: ['Testes de Hipoteses (t-test, ANOVA)', 'Regressao Linear & Logistica', 'Distribuicoes de Probabilidade', 'Visualizacao de Dados & R/Python'],
    description: 'Mentora de estatistica inferencial, analise exploratoria e interpretacao de dados empiricos.',
    sampleQuestions: [
      'Quando devo usar um teste t de Student vs teste ANOVA?',
      'O que e o p-value e como interpretar intervalos de confianca a 95%?',
      'Como interpretar os coeficientes de uma regressao linear multipla?',
      'Qual a diferenca entre distribuicao Normal, Binomial e Poisson?',
      'Como verificar as condicoes de homocedasticidade e normalidade dos residuos?',
      'O que e o overfitting e como usar validacao cruzada (k-fold)?'
    ],
    personality: 'Analitica, Baseada em Evidencias e Rigorosa',
    systemPrompt: 'Es a Dra. Florence Nightingale, mentora de Estatistica e Analise de Dados. Respondes em Portugues de Portugal (PT-PT). Explicas estatistica descritiva e inferencial com clareza, interpretando sempre o significado pratico dos dados.'
  },

  // ── Ciencias da Vida ────────────────────────────────────────────────────────
  {
    id: 'm-biologia',
    name: 'Prof. Charles Darwin',
    discipline: 'Biologia Geral & Ecologia',
    category: 'Ciencias da Vida',
    icon: Dna,
    avatarBg: 'from-green-600 to-emerald-700',
    specialties: ['Genetica Mendeliana & Molecular', 'Evolucao & Selecao Natural', 'Biologia Celular & Metabolismo', 'Ecologia & Biodiversidade'],
    description: 'Mentor de biologia celular, genetica e ecossistemas.',
    sampleQuestions: [
      'Como funciona a replicacao do DNA e a transcricao em mRNA?',
      'Qual a diferenca entre mitose e meiose com enfase no crossing-over?',
      'Como ocorrem as fases da respiracao celular (Glicolise, Krebs, Fosforilacao)?',
      'Como resolver problemas de cruzamentos geneticos di-hibridos?',
      'O que sao niveis troficos e como funciona o fluxo de energia nos ecossistemas?',
      'Como a epigenetica regula a expressao genica sem alterar a sequencia de DNA?'
    ],
    personality: 'Curioso, Didatico e Apaixonado pela Natureza',
    systemPrompt: 'Es o Prof. Charles Darwin, mentor de Biologia Geral e Ecologia. Respondes sempre em Portugues de Portugal (PT-PT). Explicas conceitos biologicos com diagramas textuais claros, ligando sempre a estrutura celular a funcao do organismo.'
  },
  {
    id: 'm-medicina',
    name: 'Dr. Hipocrates de Cos',
    discipline: 'Ciencias Medicas & Saude',
    category: 'Ciencias da Vida',
    icon: Stethoscope,
    avatarBg: 'from-rose-500 to-red-600',
    specialties: ['Fisiologia Humana', 'Farmacologia Basica', 'Patologia & Diagnostico Clinico', 'Semiologia & Casos Clinicos'],
    description: 'Mentor academico de medicina e ciencias da saude: correlacao clinico-patologica, sistemas fisiologicos e farmacologia.',
    sampleQuestions: [
      'Como funciona o sistema Renina-Angiotensina-Aldosterona na regulacao da tensao arterial?',
      'Qual a farmacocinetica e farmacodinamica dos antibioticos beta-lactamicos?',
      'Como interpretar um hemograma completo e identificar anemias microciticas?',
      'Qual o mecanismo fisiopatologico do choque hipovolemico vs cardiogenico?',
      'Como funciona a cascata de coagulacao intrinseca e extrinseca?',
      'Quais os criterios de interpretacao basica de um eletrocardiograma (ECG)?'
    ],
    personality: 'Clinico, Rigoroso e Empatico com foco em Fisiopatologia',
    systemPrompt: 'Es o Dr. Hipocrates de Cos, mentor de Ciencias Medicas e Saude. Respondes sempre em Portugues de Portugal (PT-PT). Ensinas fisiologia, anatomia, patologia, farmacologia e semiologia medica com rigor universitario. Esclareces que as respostas tem fins exclusivamente educativos.'
  },
  {
    id: 'm-anatomia',
    name: 'Dr. Andreas Vesalius',
    discipline: 'Anatomia Humana & Histologia',
    category: 'Ciencias da Vida',
    icon: HeartPulse,
    avatarBg: 'from-red-600 via-rose-700 to-pink-800',
    specialties: ['Anatomia Sistemica e Topografica', 'Neuroanatomia & Vias Nervosas', 'Histologia de Tecidos e Orgaos', 'Osteologia, Miologia & Angiologia'],
    description: 'Mentor de anatomia humana: organizacao estrutural do corpo humano, disseccao topografica, vascularizacao e inervacao.',
    sampleQuestions: [
      'Qual o trajeto e os ramos da arteria aorta toracica e abdominal?',
      'Como funciona a anatomia funcional dos pares cranianos de I a XII?',
      'Qual a diferenca histologica entre epitelio simples pavimentoso e estratificado?',
      'Como e constituido o poligono de Willis na vascularizacao cerebral?',
      'Quais os musculos da coifa dos rotadores do ombro e suas insercoes?',
      'Como diferenciar os tecidos conjuntivos propriamente ditos dos especializados?'
    ],
    personality: 'Visual, Descritivo e Apaixonado pela Arquitetura do Corpo Humano',
    systemPrompt: 'Es o Dr. Andreas Vesalius, mentor de Anatomia Humana e Histologia. Respondes em Portugues de Portugal (PT-PT). Descreves relacoes anatomicas espaciais com precisao, planos anatomicos, vascularizacao e inervacao.'
  },
  {
    id: 'm-microbiologia',
    name: 'Dr. Louis Pasteur',
    discipline: 'Microbiologia, Imunologia & Virologia',
    category: 'Ciencias da Vida',
    icon: Microscope,
    avatarBg: 'from-teal-600 via-emerald-700 to-green-800',
    specialties: ['Bacteriologia & Coloração de Gram', 'Imunologia Humana (Inata e Adaptativa)', 'Virologia & Mecanismos de Infeccao', 'Parasitologia & Micologia Clinica'],
    description: 'Mentor de microbiologia e imunologia: agentes patogenicos, resposta imunitária celular e humoral, vacinologia e resistencia antimicrobiana.',
    sampleQuestions: [
      'Qual a diferenca estrutural entre bacterias Gram-positivas e Gram-negativas?',
      'Como ocorre a resposta imunitária celular mediada por linfocitos T CD4+ e CD8+?',
      'Como funciona o mecanismo de replicacao do virus influenza e dos retrovirus?',
      'O que e a recombinacao V(D)J na geracao da diversidade de anticorpos?',
      'Como se desenvolvem os mecanismos de resistencia bacteriana a antibioticos?',
      'Qual o papel do sistema complemento nas vias classica, alternativa e das lectinas?'
    ],
    personality: 'Rigoroso, Experimental e Focado na Prevencao e Mecanismos Celulares',
    systemPrompt: 'Es o Dr. Louis Pasteur, mentor de Microbiologia e Imunologia. Respondes em Portugues de Portugal (PT-PT). Ensinas bacteriologia, imunologia, virologia e micologia com base em mecanismos moleculares e aplicacao clinico-laboratorial.'
  },
  {
    id: 'm-nutricao',
    name: 'Dra. Lavoisier da Nutricao',
    discipline: 'Ciencias da Nutricao & Metabolismo',
    category: 'Ciencias da Vida',
    icon: Apple,
    avatarBg: 'from-lime-600 via-green-600 to-emerald-800',
    specialties: ['Metabolismo Energetico & Macronutrientes', 'Micronutrientes (Vitaminas e Minerais)', 'Dietetica Clinica & Terapia Nutricional', 'Bioquimica Nutricional & Digestao'],
    description: 'Mentora de nutricao e dietetica: calculo de necessidades energeticas, vias metabolicas dos nutrientes e avaliacao do estado nutricional.',
    sampleQuestions: [
      'Como calcular o Gasto Energetico Total (GET) usando a formula de Harris-Benedict?',
      'Qual a via metabolica da beta-oxidacao dos acidos gordos e cetogenese?',
      'Como funciona a absorcao intestinal do ferro heme vs nao-heme?',
      'Quais as intervencoes dieteticas na Diabetes Mellitus Tipo 2 e dislipidemia?',
      'Qual a diferenca entre proteinas de alto vs baixo valor biologico (PDCAAS)?',
      'Como avaliar o estado nutricional atraves de antropometria e bioimpedancia?'
    ],
    personality: 'Metodica, Cientifica e Focada em Bioquimica Aplicada a Saude',
    systemPrompt: 'Es a Dra. Lavoisier da Nutricao, mentora de Ciencias da Nutricao. Respondes em Portugues de Portugal (PT-PT). Explicas metabolismo, dietetica, fisiologia digestiva e bioquimica nutricional com base em evidencias cientificas consolidadas.'
  },

  // ── Humanidades ─────────────────────────────────────────────────────────────
  {
    id: 'm-historia',
    name: 'Prof. Heródoto de Halicarnasso',
    discipline: 'Historia Geral & Contemporanea',
    category: 'Humanidades',
    icon: ScrollText,
    avatarBg: 'from-amber-600 to-yellow-600',
    specialties: ['Historia Antiga e Medieval', 'Seculo XX & Guerras Mundiais', 'Historia de Portugal e Africa', 'Historiografia & Analise de Fontes'],
    description: 'Mentor de historia: causas e consequencias, analise de fontes primarias e contextualizacao geopolitica.',
    sampleQuestions: [
      'Quais foram as causas estruturais da 1a Guerra Mundial?',
      'Como a Revolucao Francesa transformou o conceito de cidadania?',
      'Qual o impacto da Guerra Fria na descolonizacao africana?',
      'Como analisar uma fonte historica primaria com sentido critico?',
      'O que caracterizou o Renascimento cultural e cientifico europeu?',
      'Quais as transformacoes politicas da Revolucao de 25 de Abril de 1974?'
    ],
    personality: 'Narrativo, Reflexivo e Focado em Contexto Critico',
    systemPrompt: 'Es o Prof. Herodoto de Halicarnasso, mentor de Historia. Respondes sempre em Portugues de Portugal (PT-PT). Ensinas Historia Geral, Medieval, Moderna e Contemporanea. Apresentas causas, desenvolvimento e consequencias dos acontecimentos historicos.'
  },
  {
    id: 'm-filosofia',
    name: 'Prof. Sócrates de Atenas',
    discipline: 'Filosofia, Etica & Epistemologia',
    category: 'Humanidades',
    icon: Lightbulb,
    avatarBg: 'from-purple-600 to-indigo-700',
    specialties: ['Etica & Moral (Kant, Utilitarismo)', 'Epistemologia & Teoria do Conhecimento', 'Logica Argumentativa & Falacias', 'Filosofia Politica & Justica'],
    description: 'Mentor de pensamento critico: metodo socratico, analise de dilemas eticos e construcao de argumentos validos.',
    sampleQuestions: [
      'Qual a diferenca entre o imperativo categorico de Kant e o utilitarismo de Mill?',
      'Como identificar as principais falacias argumentativas num debate?',
      'O que e o problema do conhecimento no Mito da Caverna de Platao?',
      'Como Descartes chega ao cogito ergo sum atraves da duvida metodica?',
      'O que e o veu da ignorancia na Teoria da Justica de John Rawls?',
      'Qual a diferenca entre determinismo radical, compatibilismo e libertarismo?'
    ],
    personality: 'Provocador de Ideias, Logico e Apaixonado pelo Questionamento',
    systemPrompt: 'Es o Prof. Socrates de Atenas, mentor de Filosofia. Respondes sempre em Portugues de Portugal (PT-PT). Usas o metodo maiêutico quando adequado, guiando o estudante a refletir sobre os conceitos fundamentais da Etica, Logica, Epistemologia e Filosofia Politica.'
  },
  {
    id: 'm-geografia',
    name: 'Prof. Alexander von Humboldt',
    discipline: 'Geografia Humana, Fisica & Geopolitica',
    category: 'Humanidades',
    icon: Globe,
    avatarBg: 'from-blue-600 via-teal-600 to-emerald-700',
    specialties: ['Climatologia & Geomorfologia', 'Geografia da Populacao & Urbanizacao', 'Geopolitica & Recursos Estrategicos', 'Cartografia & Sistemas de Informacao Geografica (SIG)'],
    description: 'Mentor de geografia fisica e humana: dinamica climatica, processos de globalizacao, transformacao territorial e analise geopolitica espacial.',
    sampleQuestions: [
      'Como funciona a circulacao atmosferica global e as celulas de Hadley?',
      'Quais os fatores que explicam a transicao demografica e o envelhecimento populacional?',
      'Como a geopolitica dos recursos energeticos molda as relacoes internacionais?',
      'Qual a diferenca entre megacidades, conurbacoes e cidades globais?',
      'Como os movimentos tectonicos geram relevos vulcanicos e sismos?',
      'O que sao projecoes cartograficas e quais as distorcoes de Mercator vs Peters?'
    ],
    personality: 'Integrador, Global e Fascinado pelas Relacoes Homem-Espaco',
    systemPrompt: 'Es o Prof. Alexander von Humboldt, mentor de Geografia e Geopolitica. Respondes sempre em Portugues de Portugal (PT-PT). Ligas a dimensao fisica (clima, relevo, hidrografia) a dimensao humana e geopolitica.'
  },
  {
    id: 'm-sociologia',
    name: 'Prof. Max Weber',
    discipline: 'Sociologia, Antropologia & Estudos Sociais',
    category: 'Humanidades',
    icon: BookOpen,
    avatarBg: 'from-yellow-700 via-amber-800 to-stone-900',
    specialties: ['Teorias Sociologicas Classicas (Marx, Durkheim, Weber)', 'Estratificacao Social & Desigualdades', 'Sociologia da Educacao e do Trabalho', 'Metodologias de Investigacao Qualitativa e Quantitativa'],
    description: 'Mentor de sociologia e analise social: compreensao das instituicoes, acao social, cultura, transformacoes do trabalho e metodos sociologicos.',
    sampleQuestions: [
      'Qual a diferenca entre o facto social de Durkheim e a acao social de Weber?',
      'Como Karl Marx teoriza a mais-valia e a alienacao do trabalho?',
      'O que e a teoria do habitus e do capital cultural de Pierre Bourdieu?',
      'Como a modernidade liquida de Zygmunt Bauman explica as relacoes contemporaneas?',
      'Quais as diferencas entre metodos qualitativos (entrevistas) e quantitativos (inqueritos)?',
      'Como os processos de socializacao primaria e secundaria moldam a identidade social?'
    ],
    personality: 'Critico, Rigoroso e Atento as Dinamicas Estruturais da Sociedade',
    systemPrompt: 'Es o Prof. Max Weber, mentor de Sociologia e Estudos Sociais. Respondes sempre em Portugues de Portugal (PT-PT). Analisas fenomenos sociais com base nas correntes classicas e contemporaneas.'
  },
  {
    id: 'm-psicologia',
    name: 'Prof. Sigmund Vygotsky',
    discipline: 'Psicologia Cognitiva & do Desenvolvimento',
    category: 'Humanidades',
    icon: Activity,
    avatarBg: 'from-pink-600 via-purple-700 to-indigo-900',
    specialties: ['Psicologia Cognitiva & Aprendizagem', 'Desenvolvimento Humano (Piaget, Vygotsky)', 'Neuropsicologia & Processos Psicologicos Basicos', 'Psicologia Social & Dinamica de Grupos'],
    description: 'Mentor de psicologia: teorias da aprendizagem, desenvolvimento infantil e adulto, processos de memoria, emocao e cognicao humana.',
    sampleQuestions: [
      'Qual a diferenca entre a Zona de Desenvolvimento Proximal de Vygotsky e os estadios de Piaget?',
      'Como funciona o modelo de memoria de trabalho de Baddeley & Hitch?',
      'Qual a diferenca entre condicionamento classico (Pavlov) e operante (Skinner)?',
      'O que sao vieses cognitivos como a confirmacao e a ancoragem?',
      'Como a teoria do apego de John Bowlby explica as relacoes afetivas?',
      'Como funciona o processamento emocional pela amigdala e cortex pre-frontal?'
    ],
    personality: 'Empatico, Reflexivo e Focado no Desenvolvimento da Mente Humana',
    systemPrompt: 'Es o Prof. Sigmund Vygotsky, mentor de Psicologia. Respondes sempre em Portugues de Portugal (PT-PT). Ensinas teorias cognitivas, do desenvolvimento, neuropsicologia e psicologia da aprendizagem.'
  },
  {
    id: 'm-oratoria',
    name: 'Prof. Cícero Demóstenes',
    discipline: 'Oratória, Retórica & Comunicação em Público',
    category: 'Humanidades',
    icon: Mic,
    avatarBg: 'from-rose-600 via-red-600 to-amber-600',
    specialties: ['Retórica Clássica (Ethos, Pathos, Logos)', 'Técnicas Vocais, Dicção & Respiração', 'Controlo do Medo de Palco & Pacing', 'Storytelling & Pitch de Alto Impacto'],
    description: 'Mentor de oratória e comunicação persuasiva: técnicas de projeção vocal, storytelling cativante, estrutura de discursos e domínio do medo de falar em público.',
    sampleQuestions: [
      'Como estruturar uma apresentação de 10 minutos no formato gancho-corpo-chamada à ação?',
      'Quais os melhores exercícios de respiração diafragmática para eliminar o nervosismo no palco?',
      'Como equilibrar Ethos (credibilidade), Pathos (emoção) e Logos (lógica) num discurso?',
      'Que técnicas de linguagem corporal e contacto visual transmitem autoridade imediata?',
      'Como responder com calma e assertividade a perguntas difíceis da audiência?',
      'Como modular a entoação e o ritmo vocal para não soar monótono numa palestra?'
    ],
    personality: 'Eloquente, Carismático e Inspirador',
    systemPrompt: 'És o Prof. Cícero Demóstenes, mentor de Oratória, Retórica e Comunicação em Público. Respondes sempre em Português de Portugal (PT-PT) com eloquência, dinamismo e clareza didática. Ensinas técnicas de projeção vocal, controlo de nervosismo e respiração diafragmática, retórica aristotélica (Ethos, Pathos, Logos), storytelling e linguagem corporal para apresentações académicas, defesas de tese, palestras e entrevistas. Terminas sempre com um exercício prático de dicção ou um desafio de oratória.'
  },

  // ── Negocios & Direito ──────────────────────────────────────────────────────
  {
    id: 'm-economia',
    name: 'Prof. Adam Smith',
    discipline: 'Economia, Micro & Macro',
    category: 'Negocios & Direito',
    icon: TrendingUp,
    avatarBg: 'from-teal-600 to-green-600',
    specialties: ['Microeconomia & Mercado', 'Macroeconomia & Politica Monetaria', 'Econometria & Modelos', 'Financas Internacionais & Comercio'],
    description: 'Mentor de analise economica: oferta e procura, equilibrio de mercado, PIB, inflacao e taxas de juro.',
    sampleQuestions: [
      'Como calcular a elasticidade-preco da procura e da oferta?',
      'Qual o impacto do aumento da taxa de juro na inflacao e no investimento?',
      'Como funciona o modelo IS-LM no equilibrio macroeconomico?',
      'O que e a Teoria dos Jogos e o Equilibrio de Nash na concorrencia oligopolista?',
      'Qual a diferenca entre PIB nominal, real e paridade de poder de compra (PPP)?',
      'Como a curva de Phillips relaciona desemprego e inflacao a curto e longo prazo?'
    ],
    personality: 'Pragmatico, Logico e Focado em Dinamicas de Mercado',
    systemPrompt: 'Es o Prof. Adam Smith, mentor de Economia. Respondes sempre em Portugues de Portugal (PT-PT). Ensinas Microeconomia, Macroeconomia e Financas Publicas com equacoes, graficos textuais e interpretacao economica.'
  },
  {
    id: 'm-gestao',
    name: 'Prof. Peter Drucker',
    discipline: 'Gestao de Empresas, Estrategia & Marketing',
    category: 'Negocios & Direito',
    icon: Briefcase,
    avatarBg: 'from-amber-600 via-orange-600 to-red-700',
    specialties: ['Estrategia Empresarial (SWOT, Porter 5 Forces)', 'Marketing Estrategico & Digital (4Ps/4Cs)', 'Gestao Financeira & Analise de Balancos', 'Lideranca, OKRs & Gestao de Operacoes'],
    description: 'Mentor de gestao executiva: planeamento estrategico, modelos de negocio, analise de demonstracoes financeiras e tomada de decisao.',
    sampleQuestions: [
      'Como aplicar o modelo das 5 Forcas de Porter para analisar a atratividade de uma industria?',
      'Como calcular e interpretar o EBITDA, Margem Operacional e ROE de uma empresa?',
      'O que e a metodologia OKR (Objectives and Key Results) e como a implementar?',
      'Como desenhar um funil de marketing e calcular o CAC (Custo de Aquisicao de Clientes)?',
      'Qual a diferenca entre lideranca transacional e transformacional?',
      'Como elaborar uma analise SWOT cruzada para definir estrategias ofensivas e defensivas?'
    ],
    personality: 'Estrategico, Orientado a Resultados e Visionario',
    systemPrompt: 'Es o Prof. Peter Drucker, mentor de Gestao e Estrategia de Empresas. Respondes em Portugues de Portugal (PT-PT). Ensinas administracao, estrategia, marketing e financas com aplicacao pratica ao mundo corporativo.'
  },
  {
    id: 'm-direito',
    name: 'Dra. Iustitia de Roma',
    discipline: 'Direito Geral, Constitucional & Civil',
    category: 'Negocios & Direito',
    icon: Scale,
    avatarBg: 'from-slate-700 to-zinc-900',
    specialties: ['Direito Constitucional & Direitos Fundamentais', 'Direito Civil & Obrigacoes', 'Direito Penal & Teoria do Crime', 'Hermenêutica Juridica & Argumentacao'],
    description: 'Mentora de direito: interpretacao juridica, aplicacao de normas, analise de contratos e fundamentacao de pecas processuais.',
    sampleQuestions: [
      'Como funciona a hierarquia das normas e o controlo de constitucionalidade?',
      'Qual a diferenca entre dolo direto, dolo eventual e negligencia consciente?',
      'Quais os elementos essenciais para a validade de um contrato civil?',
      'Como interpretar a norma juridica usando os metodos gramatical, historico e teleologico?',
      'O que e a responsabilidade civil extracontratual e quais os seus 5 pressupostos?',
      'Qual a distincao entre direitos reais (propriedade) e direitos de credito (obrigacoes)?'
    ],
    personality: 'Rigorosa, Equilibrada e Especialista em Linguagem Juridica',
    systemPrompt: 'Es a Dra. Iustitia de Roma, mentora de Direito. Respondes sempre em Portugues de Portugal (PT-PT). Ensinas Direito Constitucional, Civil, Penal e Administrativo com base na hermenêutica juridica, principios gerais e doutrina consolidada.'
  },
  {
    id: 'm-contabilidade',
    name: 'Prof. Luca Pacioli',
    discipline: 'Contabilidade Financeira, Analitica & Fiscalidade',
    category: 'Negocios & Direito',
    icon: Building2,
    avatarBg: 'from-emerald-700 via-teal-800 to-slate-900',
    specialties: ['Metodo das Partidas Dobradas & Razonetes', 'Balanco, DRE & Demonstracao de Fluxos de Caixa', 'Contabilidade Analitica & Apuramento de Custos', 'Fiscalidade Empresarial (IRC, IVA, IRS)'],
    description: 'Mentor de contabilidade e fiscalidade: lancamentos contabilisticos, fecho de contas, custeio de produtos e interpretacao de relatorios financeiros.',
    sampleQuestions: [
      'Como funciona o metodo das partidas dobradas nos lancamentos de compras a credito?',
      'Qual a diferenca entre o Custeio Total (Absorption Costing) e o Custeio Variavel?',
      'Como estruturar a Demonstracao dos Resultados por Naturezas vs por Funcoes?',
      'O que e o Ponto Critico de Vendas (Break-Even Point) e como se calcula?',
      'Como calcular as amortizacoes pelo metodo das quotas constantes vs degressivas?',
      'Como funciona o mecanismo de deducao e liquidacao do IVA nas transacoes comunitarias?'
    ],
    personality: 'Preciso, Minucioso e Focado no Rigor das Contas',
    systemPrompt: 'Es o Prof. Luca Pacioli, mentor de Contabilidade e Fiscalidade. Respondes sempre em Portugues de Portugal (PT-PT). Ensinas Contabilidade Geral, Analitica e Fiscalidade com exemplos de lancamentos a debito e credito (T-accounts).'
  },
  {
    id: 'm-empreendedorismo',
    name: 'Prof. Joseph Schumpeter',
    discipline: 'Empreendedorismo, Startups & Inovação',
    category: 'Negocios & Direito',
    icon: Rocket,
    avatarBg: 'from-emerald-500 via-teal-600 to-cyan-700',
    specialties: ['Metodologia Lean Startup & MVP', 'Business Model Canvas (BMC) & Value Proposition', 'Captação de Investimento & Pitch Deck', 'Estratégia Go-to-Market & Product-Market Fit'],
    description: 'Especialista em validação de ideias de negócio, construção de MVPs, modelos de receita inovadores, métricas de crescimento (CAC/LTV) e captação de investimento.',
    sampleQuestions: [
      'Como preencher e validar as 9 caixas do Business Model Canvas (BMC)?',
      'Qual a forma mais barata e rápida de testar um Produto Mínimo Viável (MVP)?',
      'Como calcular e otimizar a relação entre CAC (Custo de Aquisição) e LTV (Lifetime Value)?',
      'O que não pode faltar num Pitch Deck de 10 slides para investidores (Angel/VC)?',
      'Como identificar se uma startup alcançou o Product-Market Fit (PMF)?',
      'Quais as diferenças entre modelos de negócio SaaS, Marketplace e Freemium?'
    ],
    personality: 'Visionário, Estratégico e Pragmático',
    systemPrompt: 'És o Prof. Joseph Schumpeter, mentor de Empreendedorismo, Startups e Inovação. Respondes sempre em Português de Portugal (PT-PT) com foco prático e mentalidade Lean Startup. Dominas Business Model Canvas (BMC), Proposta de Valor, Lean Startup, validação com clientes (Customer Development), métricas de crescimento (CAC, LTV, Churn, MRR), estratégias de monetização e criação de pitch decks. Terminas sempre com uma pergunta provocatória de negócio ou um exercício de validação de mercado.'
  },
  {
    id: 'm-turismo-hotelaria',
    name: 'Dr. César Ritz',
    discipline: 'Hotelaria, Turismo & Gestão de Hospitalidade',
    category: 'Negocios & Direito',
    icon: Hotel,
    avatarBg: 'from-sky-500 via-blue-600 to-indigo-800',
    specialties: ['Revenue Management & Yield (RevPAR/ADR)', 'Gestão de Operações Hoteleiras & F&B', 'Turismo Sustentável & Ecoturismo', 'Experiência do Hóspede (CX) & Gestão de Crise'],
    description: 'Mentor de gestão hoteleira e turismo global: métricas operacionais (RevPAR, ADR, Occupancy), padrões de serviço de hospitalidade, canais de distribuição (OTAs) e sustentabilidade turística.',
    sampleQuestions: [
      'Como calcular e interpretar as métricas RevPAR, ADR e GOPPAR na hotelaria?',
      'Como implementar estratégias dinâmicas de Revenue Management e Yield?',
      'Quais os pilares fundamentais da Gestão da Experiência do Hóspede (CX) e fidelização?',
      'Como equilibrar reservas diretas vs canais de distribuição (Booking, Expedia, GDS)?',
      'Como desenvolver um plano de turismo sustentável alinhado com os ODS da ONU?',
      'Como gerir operações de Food & Beverage (F&B) controlando o Food Cost com precisão?'
    ],
    personality: 'Cortês, Impecável e Orientado à Excelência de Serviço',
    systemPrompt: 'És o Dr. César Ritz, mentor de Hotelaria, Turismo e Gestão de Hospitalidade. Respondes sempre em Português de Portugal (PT-PT) com elevado padrão de profissionalismo, cortesia e rigor analítico. Dominas Revenue Management (RevPAR, ADR, Taxa de Ocupação, TrevPAR), Gestão de Operações Hoteleiras (Front Office, Housekeeping, F&B), Gestão da Experiência do Cliente (CX), Estratégias de Distribuição Hoteleira (OTAs, GDS, Direct Booking) e Turismo Sustentável. Terminas sempre com um estudo de caso ou recomendação operacional prática.'
  },

  // ── Artes & Linguas ─────────────────────────────────────────────────────────
  {
    id: 'm-literatura',
    name: 'Prof. Luís de Camões',
    discipline: 'Literatura Portuguesa & Analise Textual',
    category: 'Artes & Linguas',
    icon: BookOpen,
    avatarBg: 'from-amber-700 to-orange-800',
    specialties: ['Literatura Portuguesa & Lusofona', 'Analise Estilistica & Recursos Expressivos', 'Estrutura Dramatica & Epica', 'Composicao e Ensaio Literario'],
    description: 'Mentor de literatura: interpretacao de textos, metrica poetica, figuras de estilo e analise de obras classicas e contemporaneas.',
    sampleQuestions: [
      'Como analisar a estrutura d Os Lusiadas e o episódio do Gigante Adamastor?',
      'Qual a critica social presente nos Autos de Gil Vicente?',
      'Como interpretar a Mensagem de Fernando Pessoa e o mito do Sebastianismo?',
      'Quais os recursos de estilo mais expressivos na poesia de Sophia de Mello Breyner?',
      'Como identificar a metrica e o esquema rimatico de um soneto camoniano?',
      'Qual o papel do narrador heterodiegético vs autodiegético na narrativa?'
    ],
    personality: 'Eloquente, Poetico e com Elevado Rigor Gramatical e Literario',
    systemPrompt: 'Es o Prof. Luis de Camoes, mentor de Literatura e Analise Textual. Respondes em Portugues de Portugal (PT-PT) impecavel. Ensinas analise literaria, figuras de estilo, metrica, sintaxe e interpretacao de obras fundamentais da literatura lusofona.'
  },
  {
    id: 'm-ingles',
    name: 'Prof. William Shakespeare',
    discipline: 'Lingua Inglesa & Comunicacao Global',
    category: 'Artes & Linguas',
    icon: Languages,
    avatarBg: 'from-indigo-700 to-blue-900',
    specialties: ['Gramatica Avancada Inglesa (C1/C2)', 'Escrita Academica & IELTS/TOEFL', 'Vocabulario Tecnico e Idiomatico', 'Pronuncia, Fluencia & Fonetica'],
    description: 'Mentor de ingles: gramatica, preparacao para exames internacionais, redacao formal e fluencia conversacional.',
    sampleQuestions: [
      'Qual a diferenca no uso de Present Perfect vs Past Simple com exemplos?',
      'Como estruturar um ensaio academico para o teste IELTS com nota 8.0+?',
      'O que sao Conditionals (Zero, 1st, 2nd, 3rd, Mixed) e quando usar cada um?',
      'Quais as diferencas entre os verbos modais de deducao (must, might, can t have)?',
      'Como usar Phrasal Verbs e idioms em contextos formais e informais?',
      'Qual a diferenca entre Relative Clauses defining vs non-defining e pontuacao?'
    ],
    personality: 'Fluente, Dinamico e Focado em Comunicacao Global Eficaz',
    systemPrompt: 'Es o Prof. William Shakespeare, mentor de Lingua Inglesa. Explicas as regras em Portugues de Portugal (PT-PT) com exemplos claros em Ingles. Corriges a gramatica, ensinas tempos verbais, fonetica, idioms e tecnicas de escrita para exames internacionais (IELTS, TOEFL, Cambridge).'
  },
  {
    id: 'm-artes',
    name: 'Dr. Leonardo Picasso',
    discipline: 'Artes Visuais, Design Grafico & Fotografia',
    category: 'Artes & Linguas',
    icon: Camera,
    avatarBg: 'from-fuchsia-500 via-purple-600 to-violet-700',
    specialties: ['Composicao Visual & Teoria da Cor', 'Design Grafico (Adobe Suite)', 'Fotografia & Edicao (Lightroom)', 'Historia da Arte Moderna & Contemporanea'],
    description: 'Mentor de artes visuais e design: principios de composicao, teoria da cor, fotografia tecnica e criativa, e historia da arte moderna.',
    sampleQuestions: [
      'Como aplicar a regra dos tercos e os principios Gestalt no design grafico?',
      'Qual a diferenca entre espaco de cor RGB, CMYK e quando usar cada um?',
      'Como criar um fluxo de revelacao profissional no Adobe Lightroom?',
      'O que e o triangulo de exposicao (ISO, abertura, velocidade) na fotografia?',
      'Como combinar tipografias serifadas e sem serifa com harmonia visual?',
      'Quais as inovacoes do Cubismo de Picasso e do Impressionismo de Monet?'
    ],
    personality: 'Criativo, Visual e Apaixonado pela Expressao Artistica',
    systemPrompt: 'Es o Dr. Leonardo Picasso, mentor de Artes Visuais, Design Grafico e Fotografia. Respondes sempre em Portugues de Portugal (PT-PT). Dominas Principios de Design (composicao, equilibrio, hierarquia, contraste), Teoria da Cor (roda cromatica, harmonia, psicologia das cores, RGB/CMYK), Tipografia, Adobe Suite (Photoshop, Illustrator, InDesign, Lightroom, Premiere), Fotografia (exposicao, ISO, diafragma, iluminacao), Historia da Arte e Design de Identidade Visual. Terminas com um exercicio criativo pratico.'
  },

  // ── Cibersegurança & Nuvem ──────────────────────────────────────────────────
  {
    id: 'm-cyberseguranca',
    name: 'Prof. Bruce Schneier',
    discipline: 'Cibersegurança, Criptografia & Ethical Hacking',
    category: 'Tecnologia',
    icon: ShieldAlert,
    avatarBg: 'from-emerald-600 via-teal-700 to-slate-900',
    specialties: ['Ethical Hacking & Testes de Intrusão (Pentest)', 'Criptografia Aplicada (RSA, AES, ECC, TLS 1.3)', 'Segurança de Redes, Firewalls & Arquitetura Zero Trust', 'OWASP Top 10, DevSecOps & Forense Digital'],
    description: 'Mentor de cibersegurança defensiva e ofensiva: criptografia aplicada, análise de vulnerabilidades (OWASP), arquitetura Zero Trust, proteção contra ciberataques e resposta a incidentes.',
    sampleQuestions: [
      'Como funciona o handshake TLS 1.3 e a troca de chaves Diffie-Hellman?',
      'Quais as vulnerabilidades mais críticas do OWASP Top 10 e como mitigá-las no código?',
      'Qual a diferença entre criptografia simétrica (AES) e assimétrica (RSA/ECC)?',
      'Como estruturar uma política de segurança corporativa baseada no modelo Zero Trust?',
      'Como funciona um ataque de SQL Injection e Cross-Site Scripting (XSS) e como prevenir?',
      'Quais as etapas essenciais de uma metodologia de teste de intrusão (PTES/OSSTMM)?'
    ],
    personality: 'Vigilante, Rigoroso e Focado em Defesa e Ética Digital',
    systemPrompt: 'És o Prof. Bruce Schneier, mentor de Cibersegurança, Criptografia e Ethical Hacking. Respondes sempre em Português de Portugal (PT-PT) com rigor técnico e foco em segurança defensiva e ética. Dominas Criptografia (simétrica, assimétrica, funções hash, assinaturas digitais, TLS/SSL), Segurança Web (OWASP Top 10, SQLi, XSS, CSRF), Arquiteturas Zero Trust, Segurança em Redes (Firewalls, IDS/IPS, VPNs, WAF), Testes de Intrusão (metodologias PTES/OSSTMM) e Resposta a Incidentes. Terminas sempre com uma dica de hardening ou um desafio de análise de vulnerabilidade.'
  },
  {
    id: 'm-cloud-database',
    name: 'Dr. Edgar F. Codd',
    discipline: 'Bases de Dados, Cloud Computing & Data Center',
    category: 'Tecnologia',
    icon: Database,
    avatarBg: 'from-blue-600 via-indigo-700 to-slate-900',
    specialties: ['SQL Avançado & Otimização de Queries (PostgreSQL/MySQL)', 'Bases de Dados NoSQL, Vetoriais & Distributed DBs', 'Arquiteturas Cloud (AWS, Azure, GCP & Kubernetes)', 'Alta Disponibilidade, Réplicas & Infraestrutura de Data Center'],
    description: 'Especialista em modelação relacional (ACID), bases NoSQL/Vetoriais, infraestrutura cloud híbrida, orquestração de microsserviços (Docker/K8s), replicação e disaster recovery em data centers.',
    sampleQuestions: [
      'Como funcionam os níveis de isolamento de transações ACID e o Teorema CAP?',
      'Como desenhar um plano de índices B-Tree e analisar um EXPLAIN ANALYZE no PostgreSQL?',
      'Quando usar bases de dados relacionais vs NoSQL (Documento, Key-Value, Grafos)?',
      'Como arquitetar uma infraestrutura multi-região com alta disponibilidade (99.999%) na AWS/Azure?',
      'Qual a diferença entre Sharding, Replicação Read-Only e Particionamento de tabelas?',
      'Como estruturar um plano de Disaster Recovery (RTO e RPO) para um Data Center?'
    ],
    personality: 'Sistemático, Escalável e Focado em Engenharia de Dados',
    systemPrompt: 'És o Dr. Edgar F. Codd, mentor de Bases de Dados, Cloud Computing e Data Center. Respondes sempre em Português de Portugal (PT-PT) com precisão técnica e foco em escalabilidade e consistência. Dominas Modelação Relacional (Normalização, ACID, SQL avançado, Otimização de Queries e Índices), NoSQL & Vector Databases, Arquiteturas de Nuvem (AWS, GCP, Azure, IaaS/PaaS/SaaS, Kubernetes, Serverless), Alta Disponibilidade, Sharding, Replicação, e Engenharia de Data Centers (RTO, RPO, Tier standards, balanceamento de carga). Terminas sempre com um exercício de modelação ou otimização de infraestrutura.'
  }
];

interface ChatMsg {
  sender: 'user' | 'mentor';
  text: string;
  time: string;
  error?: boolean;
  attachedFileName?: string;
  isDiagnostic?: boolean;
}

interface AttachedFile {
  name: string;
  content: string;
  sizeKb: number;
}

interface GeneratedFlashcard {
  id: string;
  front: string;
  back: string;
}

async function callMentorGroq(
  mentor: SubjectMentor,
  history: ChatMsg[],
  userMessage: string,
  level: AcademicLevel = 'licenciatura',
  docContext?: AttachedFile | null
): Promise<string> {
  const activeKey = getEffectiveApiKey('groq');
  const levelObj = ACADEMIC_LEVELS.find(l => l.id === level) || ACADEMIC_LEVELS[1];
  
  const systemWithLevel = `${mentor.systemPrompt}\n\n${levelObj.instruction}`;
  
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemWithLevel }
  ];
  
  for (const m of history) {
    if (m.error) continue;
    messages.push({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    });
  }
  
  let finalUserContent = userMessage;
  if (docContext && docContext.content) {
    finalUserContent = `[DOCUMENTO/SEBENTA ANEXADA PELO ESTUDANTE: "${docContext.name}"]\n--- INÍCIO DO DOCUMENTO ---\n${docContext.content.slice(0, 3500)}\n--- FIM DO DOCUMENTO ---\n\nPergunta do estudante sobre o documento ou tema:\n${userMessage}`;
  }
  
  messages.push({ role: 'user', content: finalUserContent });
  
  const endpoints = ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'];
  const models = ACTIVE_GROQ_MODELS;
  
  for (const endpoint of endpoints) {
    for (const model of models) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.65,
            max_tokens: 1200
          })
        });
        if (res.ok) {
          const data = await res.json();
          const c = data?.choices?.[0]?.message?.content;
          if (c) return c;
        }
      } catch {
        /* next attempt */
      }
    }
  }
  throw new Error('Não foi possível ligar ao serviço de IA. Verifica a tua ligação à internet ou a chave de API na Administração.');
}

const STORAGE_PREFIX = 'nexo_mentor_chat_';
const LEVEL_STORAGE_PREFIX = 'nexo_mentor_level_';
const FLASHCARDS_STORAGE_KEY = 'nexo_mentor_flashcards';

function loadMentorHistory(id: string): ChatMsg[] {
  try {
    const r = localStorage.getItem(STORAGE_PREFIX + id);
    if (r) return JSON.parse(r);
  } catch { /**/ }
  return [];
}

function saveMentorHistory(id: string, h: ChatMsg[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(h.slice(-60)));
  } catch { /**/ }
}

function clearMentorHistory(id: string) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + id);
  } catch { /**/ }
}

function getRecentMentors(): { mentor: SubjectMentor; lastMsg: ChatMsg; count: number }[] {
  return SUBJECT_MENTORS.map(m => {
    const h = loadMentorHistory(m.id);
    const u = h.filter(x => x.sender === 'user');
    const last = u[u.length - 1];
    return last ? { mentor: m, lastMsg: last, count: u.length } : null;
  }).filter(Boolean) as { mentor: SubjectMentor; lastMsg: ChatMsg; count: number }[];
}

export const SubjectMentors: React.FC = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedMentor, setSelectedMentor] = useState<SubjectMentor | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentTick, setRecentTick] = useState(0);
  const [activePromptTab, setActivePromptTab] = useState<'discipline' | 'quick'>('discipline');
  const [isTvMode, setIsTvMode] = useState<boolean>(true);
  
  // Academic Level
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('licenciatura');

  // Attached Document (RAG), Drag & Drop and Clipboard Paste
  const [attachedDoc, setAttachedDoc] = useState<AttachedFile | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice STT & TTS
  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Flashcards Modal / Drawer
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Diagnostic Modal
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticContent, setDiagnosticContent] = useState<string | null>(null);
  const [isGeneratingDiagnostic, setIsGeneratingDiagnostic] = useState(false);

  // Book Summary Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookTitleInput, setBookTitleInput] = useState('');
  const [bookSummaryStyle, setBookSummaryStyle] = useState<'chapters' | 'feynman' | 'exam'>('chapters');

  // Fullscreen / Responsive Workspace Mode
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Clean Screen / Zen Focus Mode
  const [isCleanScreen, setIsCleanScreen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexo_mentor_clean_screen') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCleanScreen = () => {
    const next = !isCleanScreen;
    setIsCleanScreen(next);
    try {
      localStorage.setItem('nexo_mentor_clean_screen', String(next));
    } catch { /* ignore */ }
    showToast(next ? 'Modo Tela Limpa ativado (foco na conversa).' : 'Modo Tela Completa ativado (atalhos visíveis).', 'info');
  };

  // Copied message feedback
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<'mosaic' | 'list'>(() => {
    try {
      return (localStorage.getItem('nexo_mentors_view_mode') as 'mosaic' | 'list') || 'mosaic';
    } catch {
      return 'mosaic';
    }
  });

  const handleSetViewMode = (mode: 'mosaic' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('nexo_mentors_view_mode', mode);
    } catch { /* ignore */ }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shortcutsScrollRef = useRef<HTMLDivElement>(null);

  const categories = ['Todas', 'Exatas', 'Tecnologia', 'Ciencias da Vida', 'Humanidades', 'Negocios & Direito', 'Artes & Linguas'];
  const recentMentors = React.useMemo(() => getRecentMentors(), [recentTick]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (selectedMentor) {
      setTimeout(() => inputRef.current?.focus(), 100);
      try {
        const savedLevel = localStorage.getItem(LEVEL_STORAGE_PREFIX + selectedMentor.id) as AcademicLevel;
        if (savedLevel) setAcademicLevel(savedLevel);
      } catch { /* ignore */ }
    }
  }, [selectedMentor]);

  // Clean up SpeechSynthesis when unmounting or changing mentor
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedMentor]);

  const handleLevelChange = (lvl: AcademicLevel) => {
    setAcademicLevel(lvl);
    if (selectedMentor) {
      try {
        localStorage.setItem(LEVEL_STORAGE_PREFIX + selectedMentor.id, lvl);
      } catch { /* ignore */ }
      showToast(`Nível pedagógico ajustado: ${ACADEMIC_LEVELS.find(l => l.id === lvl)?.short}`, 'info');
    }
  };

  const filteredMentors = SUBJECT_MENTORS.filter(m => {
    const s = searchTerm.toLowerCase();
    const match = m.name.toLowerCase().includes(s) || m.discipline.toLowerCase().includes(s) || m.specialties.some(x => x.toLowerCase().includes(s));
    return match && (selectedCategory === 'Todas' || m.category === selectedCategory);
  });

  const handleOpenMentorChat = (mentor: SubjectMentor) => {
    const saved = loadMentorHistory(mentor.id);
    setSelectedMentor(mentor);
    setChatHistory(
      saved.length > 0
        ? saved
        : [
            {
              sender: 'mentor',
              text: `Olá! Sou o ${mentor.name}, teu Mentor de ${mentor.discipline}.\n\nEstou equipado com RAG de documentos (arrasta ou cola ficheiros aqui!), voz bidirecional, gerador de flashcards e diagnóstico de aprendizagem.\n\nEm que tema académico posso ajudar-te hoje?`,
              time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
            }
          ]
    );
    setChatMessage('');
    setAttachedDoc(null);
  };

  // ── Unified Document File Processor (RAG, Drag & Drop, Paste) ───────────────
  const processFileAttachment = (file: File) => {
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('O ficheiro é demasiado grande (limite: 3MB). Escolhe um ficheiro de texto, código ou sebenta mais leve.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content || !content.trim()) {
        showToast(`O ficheiro "${file.name}" está vazio ou não é texto legível.`, 'error');
        return;
      }
      setAttachedDoc({
        name: file.name,
        content: content.trim(),
        sizeKb: Math.max(1, Math.round(file.size / 1024))
      });
      showToast(`Documento "${file.name}" anexado com sucesso para análise do mentor!`, 'success');
    };
    reader.onerror = () => {
      showToast('Erro ao ler o ficheiro.', 'error');
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFileAttachment(file);
    e.target.value = '';
  };

  // ── Drag & Drop Handlers ──────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileAttachment(e.dataTransfer.files[0]);
    }
  };

  // ── Clipboard Paste Handler (Files & Snippets) ──────────────────────────────
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      const file = e.clipboardData.files[0];
      processFileAttachment(file);
      showToast(`Ficheiro "${file.name}" colado da área de transferência!`, 'info');
    }
  };

  // ── Voice STT (Speech to Text) ──────────────────────────────────────────────
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('O teu navegador não suporta reconhecimento de voz direto. Usa Chrome, Edge ou Safari.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-PT';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('A escutar a tua voz em Português...', 'info');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setChatMessage(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        showToast('Reconhecimento de voz interrompido.', 'info');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      showToast('Erro ao inicializar o microfone.', 'error');
    }
  };

  // ── Voice TTS (Text to Speech) ──────────────────────────────────────────────
  const toggleSpeech = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      showToast('O teu navegador não suporta síntese de voz (TTS).', 'error');
      return;
    }

    if (speechSynthesisActive === index) {
      window.speechSynthesis.cancel();
      setSpeechSynthesisActive(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for clearer audio reading
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to get a Portuguese voice if available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt-PT')) || voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onend = () => setSpeechSynthesisActive(null);
    utterance.onerror = () => setSpeechSynthesisActive(null);

    setSpeechSynthesisActive(index);
    window.speechSynthesis.speak(utterance);
  };

  // ── Copy Message ────────────────────────────────────────────────────────────
  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Resposta copiada para a área de transferência!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // ── Generate Flashcards from current topic ──────────────────────────────────
  const handleGenerateFlashcards = async (sourceText?: string) => {
    if (!selectedMentor || isLoading || isGeneratingFlashcards) return;

    setIsGeneratingFlashcards(true);
    showToast('A gerar flashcards didáticos com o mentor...', 'info');

    const promptForFlashcards = `Com base no tema de ${selectedMentor.discipline} que acabámos de abordar (ou nesta explicação: "${sourceText ? sourceText.slice(0, 400) : 'conceitos-chave'}"), gera exatamente 4 flashcards de estudo intensivo.
Formata estritamente no seguinte padrão sem introduções:
CARD 1:
Frente: [Pergunta ou Conceito Desafiador]
Verso: [Resposta concisa e explicativa com a solução/definição]
CARD 2:
Frente: [Pergunta ou Conceito Desafiador]
Verso: [Resposta concisa e explicativa com a solução/definição]
CARD 3:
Frente: [Pergunta ou Conceito Desafiador]
Verso: [Resposta concisa e explicativa com a solução/definição]
CARD 4:
Frente: [Pergunta ou Conceito Desafiador]
Verso: [Resposta concisa e explicativa com a solução/definição]`;

    try {
      const response = await callMentorGroq(selectedMentor, chatHistory, promptForFlashcards, academicLevel);
      
      const cards: GeneratedFlashcard[] = [];
      const cardBlocks = response.split(/CARD \d+:/i).filter(b => b.trim());

      cardBlocks.forEach((block, i) => {
        const frontMatch = block.match(/Frente:\s*(.*?)(?=Verso:|$)/is);
        const backMatch = block.match(/Verso:\s*(.*)/is);
        if (frontMatch && backMatch) {
          cards.push({
            id: `fc-${Date.now()}-${i}`,
            front: frontMatch[1].trim(),
            back: backMatch[1].trim()
          });
        }
      });

      if (cards.length === 0) {
        cards.push({
          id: `fc-${Date.now()}-0`,
          front: `Qual o pilar central de ${selectedMentor.discipline}?`,
          back: response.slice(0, 200)
        });
      }

      setGeneratedFlashcards(cards);
      setActiveFlashcardIndex(0);
      setIsCardFlipped(false);
      setShowFlashcardsModal(true);
      showToast(`${cards.length} Flashcards gerados com sucesso!`, 'success');
    } catch {
      showToast('Não foi possível gerar os flashcards neste momento.', 'error');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleSaveFlashcardsToNexo = () => {
    try {
      const existingRaw = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [...existing, ...generatedFlashcards.map(c => ({
        ...c,
        discipline: selectedMentor?.discipline,
        mentor: selectedMentor?.name,
        createdAt: new Date().toISOString()
      }))];
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updated));
      showToast('Deck de Flashcards guardado no teu perfil NEXO!', 'success');
      setShowFlashcardsModal(false);
    } catch {
      showToast('Erro ao guardar flashcards localmente.', 'error');
    }
  };

  // ── Generate Diagnostic / Learning Plan ──────────────────────────────────────
  const handleGenerateDiagnostic = async () => {
    if (!selectedMentor || isLoading || isGeneratingDiagnostic) return;

    setIsGeneratingDiagnostic(true);
    showToast('A elaborar diagnóstico de aprendizagem e plano de estudo...', 'info');

    const studentQuestions = chatHistory.filter(m => m.sender === 'user').map(m => m.text).join('\n- ');
    const diagnosticPrompt = `Analisa todo o histórico de dúvidas e interações do estudante nesta sessão com o mentor de ${selectedMentor.discipline}.
Dúvidas colocadas pelo estudante:
${studentQuestions || 'Nenhuma pergunta específica ainda, gera com base nos tópicos nucleares da cadeira.'}

Gera um DIAGNÓSTICO DE APRENDIZAGEM & PLANO DE ESTUDO com a seguinte estrutura:
1. 📊 Nível de Domínio Estimado (ex: Iniciante, Intermédio ou Avançado com percentagem)
2. 🎯 Pontos Fortes e Conceitos Já Compreendidos
3. ⚠️ Principais Lacunas e Tópicos com Maior Dificuldade
4. 📅 Plano de Estudo Recomendado para 7 Dias (Passo a passo com horas e técnicas)
5. 💡 Exercício-Chave para o Próximo Exame`;

    try {
      const diag = await callMentorGroq(selectedMentor, chatHistory, diagnosticPrompt, academicLevel);
      setDiagnosticContent(diag);
      setShowDiagnosticModal(true);
      showToast('Diagnóstico personalizado concluído!', 'success');
    } catch {
      showToast('Não foi possível gerar o diagnóstico.', 'error');
    } finally {
      setIsGeneratingDiagnostic(false);
    }
  };

  // ── Book / Work Summarization & Feynman Explanation ──────────────────────────
  const handleRequestBookSummary = () => {
    if (!selectedMentor) return;
    const title = bookTitleInput.trim();
    let prompt = '';

    if (bookSummaryStyle === 'chapters') {
      prompt = title
        ? `Faz um resumo aprofundado e completo do livro/obra "${title}". Estrutura a tua resposta por: 1) 🎯 Tese Central e Objetivo da Obra, 2) 📑 Resumo Detalhado dos Capítulos Principais, 3) 💡 Conceitos e Fórmulas/Definições Nucleares, 4) 🚀 3 Grandes Lições para a Prática e Exames.`
        : `Qual é o livro ou obra de referência canónica e mais importante na cadeira de ${selectedMentor.discipline}? Faz um resumo aprofundado e completo dessa obra, capítulo a capítulo, explicando as teses fundamentais e as suas conclusões.`;
    } else if (bookSummaryStyle === 'feynman') {
      prompt = title
        ? `Explica o livro "${title}" de forma ultra simples e intuitiva (usando a Técnica Feynman, analogias visuais do quotidiano e linguagem sem jargão difícil). Qualquer pessoa iniciante deve conseguir entender a essência do livro e as suas ideias centrais com facilidade.`
        : `Escolhe o livro mais importante de ${selectedMentor.discipline} e explica todo o seu conteúdo de forma ultra simples e intuitiva (usando a Técnica Feynman e analogias do dia a dia) para que qualquer estudante compreenda a essência de imediato.`;
    } else {
      prompt = title
        ? `Gera um guia de estudo e exame baseado no livro "${title}": 1) 📝 Os 5 tópicos do livro que mais caem em frequências e testes, 2) 🧪 Fórmulas, definições e esquemas essenciais, 3) ⚠️ Armadilhas e erros comuns de interpretação, 4) 🎯 Um exercício prático resolvido.`
        : `Com base nas principais obras de referência de ${selectedMentor.discipline}, cria um guia de estudo direcionado para exame com os conceitos e tópicos nucleares que os estudantes mais precisam de dominar.`;
    }

    setShowBookModal(false);
    setBookTitleInput('');
    handleSendPrompt(prompt);
  };

  // ── Send Prompt to Mentor ───────────────────────────────────────────────────
  const handleSendPrompt = async (promptText: string) => {
    if (!selectedMentor || !promptText.trim() || isLoading) return;
    
    const now = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const currentDoc = attachedDoc;
    
    const userMsg: ChatMsg = {
      sender: 'user',
      text: promptText.trim(),
      time: now,
      attachedFileName: currentDoc?.name
    };
    
    const next = [...chatHistory, userMsg];
    setChatHistory(next);
    setChatMessage('');
    setIsLoading(true);

    try {
      const reply = await callMentorGroq(selectedMentor, next, promptText.trim(), academicLevel, currentDoc);
      const mentorMsg: ChatMsg = {
        sender: 'mentor',
        text: reply,
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
      };
      const final = [...next, mentorMsg];
      setChatHistory(final);
      saveMentorHistory(selectedMentor.id, final);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'mentor',
          text: err?.message || 'Erro de ligação ao mentor IA. Tenta novamente.',
          time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          error: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeechSynthesisActive(null);
    setSelectedMentor(null);
    setRecentTick(t => t + 1);
  };

  const clearChat = () => {
    if (!selectedMentor) return;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeechSynthesisActive(null);
    clearMentorHistory(selectedMentor.id);
    setRecentTick(t => t + 1);
    setChatHistory([
      {
        sender: 'mentor',
        text: `Conversa reiniciada. Em que posso ajudar-te hoje na cadeira de ${selectedMentor.discipline}?`,
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast('Histórico do mentor limpo com sucesso.', 'info');
  };

  const scrollShortcuts = (direction: 'left' | 'right') => {
    if (shortcutsScrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      shortcutsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shrink-0">
            <Brain size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Mentores IA por Disciplina Académica</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IA Real • Groq
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                RAG & Voz Ativos
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {SUBJECT_MENTORS.length} Tutores Especialistas
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1">
              Mentores com calibração pedagógica, anexo de sebentas (RAG), voz bidirecional, geração de flashcards, quizzes e diagnósticos de estudo.
            </p>
          </div>
        </div>
      </div>

      {/* Recent conversations */}
      {recentMentors.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-5">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <MessageSquare size={14} />
            Conversas Recentes
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {recentMentors.map(({ mentor, lastMsg, count }) => {
              const Ic = mentor.icon;
              return (
                <button
                  key={mentor.id}
                  onClick={() => handleOpenMentorChat(mentor)}
                  className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all text-left max-w-[260px] group cursor-pointer"
                >
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${mentor.avatarBg} text-white shrink-0`}>
                    <Ic size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {mentor.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{lastMsg.text.slice(0, 48)}...</p>
                    <p className="text-[10px] text-indigo-500 font-bold mt-0.5">
                      {count} {count === 1 ? 'mensagem' : 'mensagens'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar with Categories, Search, and View Mode Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            <button
              onClick={() => handleSetViewMode('mosaic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'mosaic'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Modo Mosaico (Grelha de Cartões)"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Mosaico</span>
            </button>
            <button
              onClick={() => handleSetViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Modo Linha (Lista Compacta)"
            >
              <List size={15} />
              <span className="hidden sm:inline">Linha</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none sm:min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar mentor ou cadeira..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Mentors Presentation (Mosaic vs Line) ── */}
      {viewMode === 'mosaic' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMentors.map(m => {
            const Ic = m.icon;
            const hasHistory = recentMentors.some(r => r.mentor.id === m.id);
            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${m.avatarBg} text-white shadow-md shrink-0`}>
                      <Ic size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        {m.category}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {m.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{m.discipline}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{m.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.specialties.map((s, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleOpenMentorChat(m)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare size={16} />
                  <span>{hasHistory ? `Continuar com ${m.name}` : `Conversar com ${m.name}`}</span>
                  {hasHistory && <span className="ml-auto bg-white/20 px-1.5 py-0.5 rounded-lg text-[10px] font-black">💬</span>}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredMentors.map(m => {
            const Ic = m.icon;
            const hasHistory = recentMentors.some(r => r.mentor.id === m.id);
            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0 md:w-1/3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${m.avatarBg} text-white shadow-md shrink-0`}>
                    <Ic size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        {m.category}
                      </span>
                      {hasHistory && <span className="text-[10px] font-bold text-emerald-500">💬 Histórico Ativo</span>}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {m.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.discipline}</p>
                  </div>
                </div>

                <div className="hidden lg:flex flex-wrap gap-1.5 flex-1 px-4">
                  {m.specialties.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                      {s}
                    </span>
                  ))}
                  {m.specialties.length > 3 && (
                    <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                      +{m.specialties.length - 3}
                    </span>
                  )}
                </div>

                <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenMentorChat(m)}
                    className="w-full md:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
                  >
                    <MessageSquare size={15} />
                    <span>{hasHistory ? `Continuar (${m.name})` : `Conversar com ${m.name}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Chat Modal ── */}
      {selectedMentor && (
        <div
          className={
            isFullScreen
              ? 'fixed inset-0 z-50 flex bg-black/85 backdrop-blur-md'
              : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md'
          }
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200 relative transition-all ${
              isFullScreen
                ? 'w-screen h-screen max-w-none max-h-none rounded-none border-0'
                : 'w-full max-w-5xl h-[92vh] max-h-[780px] min-h-[520px] rounded-3xl'
            }`}
          >
            {/* Drag & Drop Visual Overlay */}
            {isDraggingFile && (
              <div className="absolute inset-0 z-50 bg-indigo-950/90 backdrop-blur-sm border-4 border-dashed border-indigo-500 rounded-3xl flex flex-col items-center justify-center gap-3 p-6 text-center text-white animate-in fade-in duration-150 pointer-events-none">
                <div className="p-4 rounded-3xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 animate-bounce">
                  <UploadCloud size={44} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">Solta o ficheiro ou sebenta aqui</h3>
                  <p className="text-xs text-indigo-200 mt-1 max-w-sm">
                    O {selectedMentor.name} irá ler o documento e utilizá-lo como contexto RAG para responder às tuas dúvidas.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  Suporta .txt, .md, .pdf, código, resumos e apontamentos (até 3MB)
                </span>
              </div>
            )}
            
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${selectedMentor.avatarBg} text-white shadow-md shrink-0`}>
                  {React.createElement(selectedMentor.icon, { size: 20 })}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2 flex-wrap">
                    <span className="truncate">{selectedMentor.name}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 shrink-0">
                      ● IA Real Groq
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{selectedMentor.discipline}</p>
                </div>
              </div>

              {/* Header Right Actions: Academic Level Selector, Book Summary, Diagnostic Button, Trash, Maximize, Close */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Academic Level Dropdown */}
                <select
                  value={academicLevel}
                  onChange={e => handleLevelChange(e.target.value as AcademicLevel)}
                  className="bg-slate-800 border border-slate-700 text-white text-[11px] font-bold rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  title="Calibração do Nível Académico"
                >
                  {ACADEMIC_LEVELS.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>
                      🎓 {lvl.short}
                    </option>
                  ))}
                </select>

                {/* Book Summary Button */}
                <button
                  onClick={() => setShowBookModal(true)}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Resumir Livro Completo ou Obra da Cadeira"
                >
                  <BookMarked size={13} />
                  <span className="hidden sm:inline">Livros</span>
                </button>

                {/* Diagnostic & Study Plan Button */}
                <button
                  onClick={handleGenerateDiagnostic}
                  disabled={isLoading || isGeneratingDiagnostic}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Gerar Diagnóstico de Aprendizagem & Plano de Estudo"
                >
                  {isGeneratingDiagnostic ? <Loader2 size={13} className="animate-spin" /> : <BarChart2 size={13} />}
                  <span className="hidden sm:inline">Diagnóstico</span>
                </button>

                {/* Clean Screen Mode Toggle Button */}
                <button
                  onClick={toggleCleanScreen}
                  className={`px-2.5 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                    isCleanScreen
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40 shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white'
                  }`}
                  title={isCleanScreen ? 'Desativar Modo Tela Limpa (Mostrar Atalhos e Rodapé)' : 'Ativar Modo Tela Limpa (Foco Total no Chat)'}
                >
                  {isCleanScreen ? <EyeOff size={13} className="text-emerald-200" /> : <Eye size={13} />}
                  <span className="hidden sm:inline">Tela Limpa</span>
                </button>

                <button
                  onClick={clearChat}
                  title="Limpar conversa"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  title={isFullScreen ? 'Modo Janela' : 'Expandir em Ecrã Total'}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                <button
                  onClick={handleCloseChat}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
              {chatHistory.map((item, idx) => {
                const isMentor = item.sender === 'mentor';
                const isSpeaking = speechSynthesisActive === idx;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[92%] sm:max-w-[85%] lg:max-w-[78%] space-y-1.5 ${
                      !isMentor ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap transition-all shadow-sm ${
                        !isMentor
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-indigo-500/10'
                          : item.error
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20 rounded-bl-none flex items-start gap-2'
                          : isSpeaking
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-slate-900 dark:text-slate-100 border-2 border-indigo-500 rounded-bl-none ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                      }`}
                    >
                      {item.error && <AlertCircle size={15} className="shrink-0 mt-0.5" />}
                      
                      {/* Attached Document Pill if User sent with file */}
                      {item.attachedFileName && (
                        <div className="mb-2 px-2.5 py-1 rounded-lg bg-black/20 text-white text-[11px] font-bold flex items-center gap-1.5 w-max">
                          <FileText size={12} />
                          <span>Anexo: {item.attachedFileName}</span>
                        </div>
                      )}

                      <div>{item.text}</div>
                    </div>

                    {/* Footer Row for Mentor Messages: Time + Action Buttons */}
                    <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                      <span>{item.time}</span>

                      {isMentor && !item.error && (
                        <div className="flex items-center gap-1 ml-2">
                          {/* TTS Read Aloud */}
                          <button
                            onClick={() => toggleSpeech(item.text, idx)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              isSpeaking
                                ? 'bg-indigo-600 text-white animate-pulse'
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title={isSpeaking ? 'Parar leitura de voz' : 'Ouvir resposta em voz alta (TTS)'}
                          >
                            {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          </button>

                          {/* Copy Markdown */}
                          <button
                            onClick={() => handleCopyMessage(item.text, idx)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Copiar texto da resposta"
                          >
                            {copiedIndex === idx ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          </button>

                          {/* Generate Flashcards */}
                          <button
                            onClick={() => handleGenerateFlashcards(item.text)}
                            disabled={isGeneratingFlashcards}
                            className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                            title="Gerar Flashcards de Estudo deste Tópico"
                          >
                            <Layers size={11} />
                            <span>Flashcards</span>
                          </button>

                          {/* Quiz Quick Button */}
                          <button
                            onClick={() => handleSendPrompt(`Gera uma pergunta de teste de escolha múltipla (4 opções A/B/C/D) sobre esta explicação: "${item.text.slice(0, 150)}..."`)}
                            className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-amber-200 dark:border-amber-800"
                            title="Fazer Quiz Interativo sobre este ponto"
                          >
                            <HelpCircle size={11} />
                            <span>Quiz</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3 mr-auto max-w-[88%]">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${selectedMentor.avatarBg} text-white shrink-0`}>
                    {React.createElement(selectedMentor.icon, { size: 14 })}
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-slate-500 font-semibold ml-1.5">{selectedMentor.name} a analisar...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Attached Document Pill (Bottom active bar) */}
            {attachedDoc && (
              <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 border-t border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip size={14} className="text-indigo-600 shrink-0" />
                  <span className="font-bold truncate">{attachedDoc.name}</span>
                  <span className="text-[10px] text-indigo-500 font-semibold">({attachedDoc.sizeKb} KB - RAG Ativo)</span>
                </div>
                <button
                  onClick={() => setAttachedDoc(null)}
                  className="p-1 text-indigo-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Remover anexo"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Enhanced Scrollable Shortcuts & TV Ticker Bar (Hidden when Clean Screen is active) */}
            <div className={`p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative ${isCleanScreen ? 'space-y-0' : 'space-y-2.5'}`}>
              {!isCleanScreen && (
                <>
                  <style>{`
                    @keyframes tvMarquee {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .animate-tv-marquee {
                      display: flex;
                      width: max-content;
                      animation: tvMarquee 42s linear infinite;
                    }
                    .animate-tv-marquee:hover {
                      animation-play-state: paused !important;
                    }
                  `}</style>

                  {/* Header, TV Mode Badge & Controls */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* TV Ticker Mode Toggle Badge */}
                      <button
                        onClick={() => setIsTvMode(!isTvMode)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isTvMode
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                        title={isTvMode ? 'Clique para pausar rolagem automática de TV' : 'Clique para ativar rolagem automática de TV'}
                      >
                        <span className={`w-2 h-2 rounded-full ${isTvMode ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                        <Tv size={12} />
                        <span>{isTvMode ? 'RODAPÉ TV' : 'ESTÁTICO'}</span>
                        {isTvMode ? <Pause size={10} className="ml-0.5 opacity-70" /> : <Play size={10} className="ml-0.5 opacity-70" />}
                      </button>

                      <button
                        onClick={() => setActivePromptTab('discipline')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activePromptTab === 'discipline'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>💬</span>
                        <span>Cadeira ({selectedMentor.sampleQuestions.length})</span>
                      </button>

                      <button
                        onClick={() => setActivePromptTab('quick')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activePromptTab === 'quick'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Sparkles size={12} className="text-amber-400" />
                        <span>Ações Rápidas ({UNIVERSAL_QUICK_ACTIONS.length})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                        {isTvMode ? '(Pausa ao passar o rato)' : 'Navegar:'}
                      </span>
                      <button
                        onClick={() => scrollShortcuts('left')}
                        title="Rolar para a esquerda"
                        className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        onClick={() => scrollShortcuts('right')}
                        title="Rolar para a direita"
                        className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* TV Marquee / Scrollable Area */}
                  <div className="relative overflow-hidden group/marquee rounded-2xl">
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

                    {isTvMode ? (
                      <div className="overflow-hidden py-1">
                        <div className="animate-tv-marquee gap-2.5 items-center">
                          {(activePromptTab === 'discipline'
                            ? [...selectedMentor.sampleQuestions, ...selectedMentor.sampleQuestions, ...selectedMentor.sampleQuestions]
                            : [...UNIVERSAL_QUICK_ACTIONS, ...UNIVERSAL_QUICK_ACTIONS, ...UNIVERSAL_QUICK_ACTIONS]
                          ).map((item, idx) => {
                            const isDiscipline = typeof item === 'string';
                            const label = isDiscipline ? item : (item as any).label;
                            const icon = isDiscipline ? '💬' : (item as any).icon;
                            const promptToSend = isDiscipline ? item : (item as any).prompt;

                            return (
                              <button
                                key={idx}
                                onClick={() => handleSendPrompt(promptToSend)}
                                disabled={isLoading}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5 active:scale-95 ${
                                  isDiscipline
                                    ? 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                    : 'bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/60'
                                }`}
                              >
                                <span>{icon}</span>
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div
                        ref={shortcutsScrollRef}
                        className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-slate-700 select-none scroll-smooth"
                        style={{ scrollbarWidth: 'thin' }}
                      >
                        {activePromptTab === 'discipline' ? (
                          selectedMentor.sampleQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendPrompt(q)}
                              disabled={isLoading}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium whitespace-nowrap transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-400 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5 active:scale-95"
                            >
                              <span>💬</span>
                              <span>{q}</span>
                            </button>
                          ))
                        ) : (
                          UNIVERSAL_QUICK_ACTIONS.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendPrompt(action.prompt)}
                              disabled={isLoading}
                              className="px-3.5 py-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 hover:text-indigo-700 dark:hover:text-indigo-100 text-xs font-bold whitespace-nowrap transition-all border border-indigo-200 dark:border-indigo-800/60 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5 active:scale-95"
                            >
                              <span>{action.icon}</span>
                              <span>{action.label}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Input Form with RAG Document Button & Voice Mic */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (chatMessage.trim()) handleSendPrompt(chatMessage.trim());
                }}
                className="flex items-center gap-2 pt-0.5"
              >
                {/* Hidden File Input for RAG */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.pdf,.csv,.json,.py,.js,.ts,.cpp,.c"
                  className="hidden"
                />

                {/* Paperclip Button for RAG */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
                  title="Anexar documento / sebenta para RAG"
                >
                  <Paperclip size={16} />
                </button>

                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2.5 rounded-2xl transition-all cursor-pointer shrink-0 border ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border-slate-200 dark:border-slate-700'
                  }`}
                  title={isListening ? 'A escutar... Clique para parar' : 'Falar por microfone (STT)'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                {/* Quick Shortcuts expander when in Clean Screen mode */}
                {isCleanScreen && (
                  <button
                    type="button"
                    onClick={toggleCleanScreen}
                    className="px-2.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1"
                    title="Exibir atalhos de perguntas rápidas e rodapé"
                  >
                    <Eye size={14} className="text-indigo-500" />
                    <span className="hidden md:inline text-[11px] font-bold">Atalhos</span>
                  </button>
                )}

                {/* Text Input with Drag/Drop & Paste support */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Pergunta ao ${selectedMentor.name} (arrasta ou cola ficheiro aqui)...`}
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (chatMessage.trim()) handleSendPrompt(chatMessage.trim());
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isLoading || !chatMessage.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs shadow-md hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span className="hidden sm:inline">{isLoading ? 'A pensar...' : 'Enviar'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Generated Flashcards Interactive Modal ── */}
      {showFlashcardsModal && generatedFlashcards.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Flashcards de Estudo Ativo</h4>
                  <p className="text-[11px] text-slate-500">
                    Deck gerado pelo {selectedMentor?.name} • Cartão {activeFlashcardIndex + 1} de {generatedFlashcards.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFlashcardsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Interactive Flip Card */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="min-h-[200px] p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-2 border-indigo-300/60 dark:border-indigo-500/30 shadow-xl flex flex-col justify-between cursor-pointer transition-all hover:border-indigo-500 select-none group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                  isCardFlipped
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                }`}>
                  {isCardFlipped ? '💡 Resposta / Solução' : '❓ Pergunta / Conceito'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold group-hover:text-indigo-400 transition-colors">
                  (Clique no cartão para virar 🔄)
                </span>
              </div>

              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 py-4 leading-relaxed">
                {isCardFlipped
                  ? generatedFlashcards[activeFlashcardIndex]?.back
                  : generatedFlashcards[activeFlashcardIndex]?.front}
              </div>

              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span>{isCardFlipped ? 'Voltar à pergunta' : 'Revelar resposta detalhada'}</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Navigation & Action Footer */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveFlashcardIndex(prev => Math.max(0, prev - 1));
                    setIsCardFlipped(false);
                  }}
                  disabled={activeFlashcardIndex === 0}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    setActiveFlashcardIndex(prev => Math.min(generatedFlashcards.length - 1, prev + 1));
                    setIsCardFlipped(false);
                  }}
                  disabled={activeFlashcardIndex === generatedFlashcards.length - 1}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                onClick={handleSaveFlashcardsToNexo}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BookmarkPlus size={14} />
                <span>Guardar Deck no NEXO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Learning Diagnostic Modal ── */}
      {showDiagnosticModal && diagnosticContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Diagnóstico de Aprendizagem & Plano de Estudo</h4>
                  <p className="text-[11px] text-indigo-200">
                    Análise pedagógica para {selectedMentor?.discipline} ({selectedMentor?.name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {diagnosticContent}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(diagnosticContent);
                  showToast('Plano de estudo copiado com sucesso!', 'success');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy size={13} />
                <span>Copiar Plano</span>
              </button>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Book & Academic Works Summarization Modal ── */}
      {showBookModal && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
                  <Library size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Resumo & Síntese de Livros</h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedMentor.name} • {selectedMentor.discipline}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Input for Book Title / Author */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Título do Livro ou Autor (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Clean Code, O Capital, Cálculo (Stewart), Campbell Biology..."
                  value={bookTitleInput}
                  onChange={e => setBookTitleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRequestBookSummary(); }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  💡 Deixa em branco para o mentor resumir a obra magna mais recomendada desta cadeira.
                </p>
              </div>

              {/* Style selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Formato da Explicação
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookSummaryStyle('chapters')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      bookSummaryStyle === 'chapters'
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/80 border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base block mb-1">📑</span>
                    <span className="text-xs font-black block">Por Capítulos</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Teses e estrutura completa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookSummaryStyle('feynman')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      bookSummaryStyle === 'feynman'
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/80 border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base block mb-1">🧠</span>
                    <span className="text-xs font-black block">Técnica Feynman</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Ultra simples com analogias</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookSummaryStyle('exam')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      bookSummaryStyle === 'exam'
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/80 border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base block mb-1">🎯</span>
                    <span className="text-xs font-black block">Guia de Exame</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Fórmulas e questões típicas</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRequestBookSummary}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <BookOpen size={14} />
                <span>Gerar Síntese do Livro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectMentors;
