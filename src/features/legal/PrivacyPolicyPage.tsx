import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Database, Sparkles, UserCheck, EyeOff, Globe, Server, CheckCircle2 } from 'lucide-react';
import { HeaderNav } from '../../components/layout/HeaderNav';
import { FooterSection } from '../landing/components/FooterSection';

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Política de Privacidade | NEXO Hub Digital';
  }, []);

  const lastUpdated = '10 de Setembro de 2026';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <HeaderNav />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb & Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar à Página Principal</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30 mb-4">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Conformidade RGPD &amp; Google OAuth</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Política de Privacidade
          </h1>
          
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            No <strong>NEXO Hub Digital</strong>, a privacidade e a segurança dos seus dados pessoais não são meros detalhes — são o pilar central da nossa arquitetura. Conheça como protegemos as suas informações.
          </p>

          <div className="mt-6 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            <span>Última atualização: <strong className="text-slate-200">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Versão: <strong className="text-slate-200">2.4.0</strong></span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> Certificado Seguro
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-12 text-slate-300 leading-relaxed text-sm sm:text-base">
          
          {/* 1. Introdução */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <Globe size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">1. Introdução e Âmbito</h2>
            </div>
            <p>
              Esta Política de Privacidade descreve as práticas do <strong>NEXO Hub Digital</strong> relativamente à recolha, utilização, armazenamento, processamento e proteção dos dados dos utilizadores que acedem à nossa aplicação web e serviços associados em <code>https://nexo-platform-omega.vercel.app</code>.
            </p>
            <p>
              Ao utilizar o NEXO, aceita as práticas descritas neste documento. Se não concordar com qualquer termo, solicitamos que não utilize os nossos serviços.
            </p>
          </section>

          {/* 2. Responsável pelo Tratamento */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">2. Responsável pelo Tratamento de Dados (DPO)</h2>
            </div>
            <p>
              O responsável pelo tratamento dos dados nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD - Regulamento UE 2016/679) é a equipa de engenharia e gestão de dados do <strong>NEXO Hub Digital</strong>.
            </p>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-300 space-y-1">
              <p><strong>Contacto Oficial de Privacidade:</strong> <code>moisesdematos@gmail.com</code></p>
              <p><strong>Encarregado de Proteção de Dados:</strong> Moisés de Matos</p>
              <p><strong>Jurisdição:</strong> União Europeia / Portugal</p>
            </div>
          </section>

          {/* 3. Dados Recolhidos */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <Database size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">3. Dados que Recolhemos e Origem</h2>
            </div>
            <p>
              Recolhemos apenas as informações estritamente necessárias para o funcionamento seguro e eficiente do assistente pessoal e da plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>
                <strong>Autenticação Google OAuth:</strong> Quando decide iniciar sessão com o Google, recebemos o seu nome completo, endereço de correio eletrónico (email) e imagem de perfil pública. <em>Nunca temos acesso às suas palavras-passe ou a outros ficheiros da sua conta Google</em>.
              </li>
              <li>
                <strong>Autenticação por Email e Senha:</strong> Endereço de correio eletrónico e palavra-passe encriptada de forma irreversível (hash criptográfico seguro via Supabase Auth).
              </li>
              <li>
                <strong>Conteúdo do Utilizador na Plataforma:</strong> Tarefas, listas, eventos de calendário, orçamentos familiares, notas e metas criadas voluntariamente por si.
              </li>
              <li>
                <strong>Dados Técnicos e de Sessão:</strong> Endereço IP anonimizado, tipo de navegador, sistema operativo e carimbos de data/hora para prevenção de fraudes e auditoria de segurança.
              </li>
            </ul>
          </section>

          {/* 4. Utilização dos Dados da Google API */}
          <section className="space-y-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
                <Lock size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">4. Conformidade com a Política de Dados de Utilizador da Google</h2>
            </div>
            <p className="text-slate-200">
              A utilização e transferência das informações recebidas através das APIs da Google para qualquer outra aplicação obedecerão rigorosamente à <strong>Google API Services User Data Policy</strong>, incluindo os requisitos de <em>Uso Limitado (Limited Use Requirements)</em>:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Utilizamos os dados do Google OAuth exclusivamente para autenticação e personalização da sua conta de utilizador.</li>
              <li>Não transferimos os seus dados de utilizador do Google a terceiros, exceto quando estritamente necessário para prestar o serviço ou exigido por lei.</li>
              <li>Não utilizamos os dados da sua conta Google para fins de publicidade personalizada ou venda a corretores de dados.</li>
            </ul>
          </section>

          {/* 5. Inteligência Artificial e Gemini API */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">5. Processamento por Inteligência Artificial (Google Gemini)</h2>
            </div>
            <p>
              O NEXO integra funcionalidades inteligentes com o modelo <strong>Google Gemini</strong> para gerar sugestões, organizar tarefas e responder a dúvidas:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>
                <strong>Privacidade em Primeiro Lugar:</strong> As mensagens enviadas ao assistente de IA são processadas em trânsito de forma segura através da API oficial da Google.
              </li>
              <li>
                <strong>Não-Utilização para Treino de Modelos:</strong> De acordo com as diretrizes empresariais da Google Cloud API, os dados enviados através de chamadas à API não são usados para treinar ou aperfeiçoar modelos fundacionais de IA para outros clientes.
              </li>
            </ul>
          </section>

          {/* 6. Armazenamento, Segurança e LocalFirst */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <Server size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">6. Armazenamento, Criptografia e Segurança</h2>
            </div>
            <p>
              A segurança das suas informações é implementada a múltiplos níveis:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li><strong>Criptografia em Trânsito:</strong> Todas as comunicações utilizam TLS/HTTPS com certificados SSL modernos (grau A+).</li>
              <li><strong>Criptografia em Repouso:</strong> As bases de dados no Supabase utilizam encriptação AES-256 e políticas de segurança por linha (Row Level Security - RLS), assegurando que cada utilizador só consegue aceder estritamente aos seus próprios dados.</li>
              <li><strong>Armazenamento Local (PWA / IndexedDB):</strong> Para permitir utilização offline rápida, preferências e rascunhos são mantidos em segurança no armazenamento do seu dispositivo.</li>
            </ul>
          </section>

          {/* 7. Cookies e Armazenamento Local */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <EyeOff size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">7. Cookies e Tecnologias Semelhantes</h2>
            </div>
            <p>
              Utilizamos apenas cookies e chaves de armazenamento local estritamente necessárias para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Manter a sua sessão autenticada de forma segura (Tokens de autenticação JWT).</li>
              <li>Memorizar as suas preferências visuais (Modo Escuro / Claro, tamanho da fonte, acessibilidade).</li>
              <li>Registar a sua aceitação do banner de consentimento de privacidade.</li>
            </ul>
            <p>
              <strong>Não utilizamos cookies invasivos de rastreio de terceiros para publicidade comportamental.</strong>
            </p>
          </section>

          {/* 8. Os Seus Direitos (RGPD & LGPD) */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">8. Os Seus Direitos enquanto Titular dos Dados</h2>
            </div>
            <p>
              Nos termos da legislação aplicável (incluindo o RGPD da UE e a LGPD do Brasil), assistem-lhe os seguintes direitos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-white mb-1">Direito de Acesso e Portabilidade</h3>
                <p className="text-xs text-slate-400">Pode consultar e exportar todos os seus dados pessoais e conteúdos a qualquer instante.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-white mb-1">Direito de Retificação</h3>
                <p className="text-xs text-slate-400">Pode corrigir os seus dados no painel de configurações da aplicação.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-white mb-1">Direito ao Esquecimento (Eliminação)</h3>
                <p className="text-xs text-slate-400">Pode requerer a eliminação total e definitiva da sua conta e de todos os registos associados.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-white mb-1">Direito de Oposição e Limitação</h3>
                <p className="text-xs text-slate-400">Pode revogar o seu consentimento de processamento a qualquer momento.</p>
              </div>
            </div>
          </section>

          {/* 9. Contacto e Reclamações */}
          <section className="space-y-4 border-t border-slate-800 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white">9. Dúvidas e Exercício de Direitos</h2>
            <p>
              Para exercer qualquer um dos seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, envie uma mensagem para o nosso canal dedicado:
            </p>
            <p className="text-indigo-400 font-semibold">
              Email: <a href="mailto:moisesdematos@gmail.com" className="underline hover:text-indigo-300">moisesdematos@gmail.com</a>
            </p>
            <p className="text-xs text-slate-500">
              Tem também o direito de apresentar reclamação junto da autoridade de controlo competente em matéria de proteção de dados (em Portugal, a CNPD - Comissão Nacional de Proteção de Dados).
            </p>
          </section>

        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default PrivacyPolicyPage;
