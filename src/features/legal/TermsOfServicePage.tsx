import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, Scale, AlertCircle, CheckCircle2, UserCheck, HelpCircle } from 'lucide-react';
import { HeaderNav } from '../../components/layout/HeaderNav';
import { FooterSection } from '../landing/components/FooterSection';

export const TermsOfServicePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Termos de Serviço | NEXO Hub Digital';
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
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30 mb-4">
            <Scale size={14} className="text-indigo-400" />
            <span>Acordo de Utilização</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Termos de Serviço
          </h1>
          
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Bem-vindo ao <strong>NEXO Hub Digital</strong>. Estes Termos de Serviço regem o acesso e a utilização da nossa plataforma, produtos e serviços de produtividade com Inteligência Artificial.
          </p>

          <div className="mt-6 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            <span>Última atualização: <strong className="text-slate-200">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Versão: <strong className="text-slate-200">2.4.0</strong></span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> Válido &amp; Ativo
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-12 text-slate-300 leading-relaxed text-sm sm:text-base">
          
          {/* 1. Aceitação */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <FileText size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">1. Aceitação dos Termos</h2>
            </div>
            <p>
              Ao criar uma conta, autenticar-se através do Google OAuth ou aceder aos recursos do <strong>NEXO Hub Digital</strong> (disponível em <code>https://nexo-platform-omega.vercel.app</code>), concorda em ficar vinculado a estes Termos de Serviço e à nossa <Link to="/privacy" className="text-indigo-400 hover:underline">Política de Privacidade</Link>. Se não concordar com estes termos, não deverá utilizar a plataforma.
            </p>
          </section>

          {/* 2. Descrição dos Serviços */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <Shield size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">2. Descrição dos Serviços</h2>
            </div>
            <p>
              O NEXO é uma plataforma de organização pessoal, produtividade familiar e gestão de tempo enriquecida com Inteligência Artificial. Os serviços incluem, entre outros:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Gestão de tarefas, listas inteligentes e rotinas diárias;</li>
              <li>Calendário e planeamento de eventos e compromissos;</li>
              <li>Orçamento e finanças familiares partilhadas;</li>
              <li>Gestão de metas e objetivos de aprendizagem para estudantes;</li>
              <li>Assistente de IA integrado com tecnologia Google Gemini para auxílio produtivo.</li>
            </ul>
          </section>

          {/* 3. Registo e Segurança da Conta */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">3. Registo, Autenticação e Segurança</h2>
            </div>
            <p>
              Para utilizar as funcionalidades completas do NEXO, o utilizador deve registar-se utilizando um endereço de correio eletrónico válido ou a autenticação segura do Google OAuth.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>O utilizador é o único responsável pela confidencialidade das suas credenciais de acesso;</li>
              <li>O utilizador compromete-se a notificar de imediato o NEXO caso detete qualquer utilização não autorizada da sua conta;</li>
              <li>O NEXO reserva-se o direito de suspender contas que apresentem atividade fraudulenta, abusiva ou contrária à legislação vigente.</li>
            </ul>
          </section>

          {/* 4. Uso Aceitável */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30">
                <AlertCircle size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">4. Regras de Utilização Aceitável</h2>
            </div>
            <p>O utilizador concorda expressamente em <strong>NÃO</strong>:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Utilizar a plataforma para quaisquer fins ilícitos, discriminatórios, difamatórios ou prejudiciais;</li>
              <li>Tentar descompilar, realizar engenharia reversa ou contornar as medidas de segurança e controlo de acessos (RLS) da aplicação;</li>
              <li>Realizar sobrecarga intencional dos nossos servidores (DDoS) ou abusar das cotas da API de Inteligência Artificial;</li>
              <li>Falsificar identidades ou fazer-se passar por outros membros ou administradores da plataforma.</li>
            </ul>
          </section>

          {/* 5. Inteligência Artificial */}
          <section className="space-y-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-indigo-300">
              <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">5. Recursos de Inteligência Artificial (Google Gemini)</h2>
            </div>
            <p className="text-slate-200">
              As funcionalidades de IA disponibilizadas no NEXO destinam-se a fins de produtividade e apoio organizacional:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>
                <strong>Natureza Informativa:</strong> As respostas e sugestões geradas pelo assistente de IA são meramente consultivas. O NEXO não se responsabiliza por decisões financeiras, médicas, jurídicas ou académicas tomadas unicamente com base em outputs de IA.
              </li>
              <li>
                <strong>Verificação Recomendada:</strong> Recomendamos que o utilizador valide informações críticas antes de as tomar como definitivas.
              </li>
            </ul>
          </section>

          {/* 6. Propriedade Intelectual */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">6. Propriedade Intelectual</h2>
            <p>
              Todo o código-fonte, arquitetura de software, interfaces visuais, logótipos e marcas registadas do <strong>NEXO</strong> são de propriedade exclusiva dos seus criadores.
            </p>
            <p>
              O utilizador retém a totalidade da propriedade e direitos autorais sobre os dados, textos, notas e ficheiros que introduz na plataforma.
            </p>
          </section>

          {/* 7. Isenção e Limitação de Responsabilidade */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">7. Disponibilidade e Isenção de Garantias</h2>
            <p>
              A plataforma é disponibilizada no estado em que se encontra (&quot;as is&quot; e &quot;as available&quot;). Embora envidemos os maiores esforços técnicos para garantir 99.9% de uptime, backups e integridade dos dados, o NEXO não garante a ausência ininterrupta de falhas de rede ou interrupções provocadas por terceiros.
            </p>
          </section>

          {/* 8. Rescisão e Eliminação */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">8. Cancelamento e Encerramento de Contas</h2>
            <p>
              O utilizador pode a qualquer momento encerrar a sua conta e solicitar a eliminação dos seus dados diretamente nas configurações do seu perfil ou enviando um pedido para o email de suporte.
            </p>
          </section>

          {/* 9. Lei Aplicável */}
          <section className="space-y-4 border-t border-slate-800 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white">9. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos de Serviço regem-se pela legislação portuguesa e pelas diretivas europeias aplicáveis. Para a resolução de qualquer litígio emergente deste acordo, é competente o foro da comarca da sede do projeto, com renúncia expressa a qualquer outro.
            </p>
            <p className="text-indigo-400 font-semibold pt-2">
              Contacto para dúvidas: <a href="mailto:moisesdematos@gmail.com" className="underline hover:text-indigo-300">moisesdematos@gmail.com</a>
            </p>
          </section>

        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default TermsOfServicePage;
