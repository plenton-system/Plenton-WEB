import Link from '@mui/material/Link';

import { CONFIG } from 'src/config-global';

import { LegalDocument } from '../components/legal-document';
import { PublicPageLayout } from '../components/public-page-layout';

import type { LegalSection } from '../components/legal-document';

// ----------------------------------------------------------------------

const LAST_UPDATED = '9 de junho de 2026';

const contactLink = (
  <Link href={`mailto:${CONFIG.contactEmail}`} underline="hover">
    {CONFIG.contactEmail}
  </Link>
);

const privacyLink = (
  <Link href="/privacidade" underline="hover">
    Política de Privacidade
  </Link>
);

const SECTIONS: LegalSection[] = [
  {
    id: 'aceitacao',
    heading: 'Aceitação dos termos',
    blocks: [
      {
        type: 'paragraph',
        text: (
          <>
            Estes Termos de Uso regulam o acesso e a utilização da plataforma {CONFIG.appName}. Ao
            criar uma conta, acessar ou utilizar a plataforma, você declara que leu, compreendeu e
            concorda integralmente com estes termos e com a {privacyLink}.
          </>
        ),
      },
      {
        type: 'paragraph',
        text: 'Caso não concorde com qualquer condição aqui prevista, você não deve utilizar a plataforma.',
      },
    ],
  },
  {
    id: 'plataforma',
    heading: 'Descrição da plataforma',
    blocks: [
      {
        type: 'paragraph',
        text: `A ${CONFIG.appName} é uma ferramenta de gestão voltada a nutricionistas e profissionais relacionados, que oferece recursos como cadastro de pacientes, criação de planos alimentares, anamneses, agenda e indicadores. A plataforma é um instrumento de apoio à atividade profissional e não substitui o julgamento técnico do profissional habilitado.`,
      },
    ],
  },
  {
    id: 'cadastro',
    heading: 'Cadastro e conta',
    blocks: [
      {
        type: 'paragraph',
        text: 'Para utilizar a plataforma, é necessário criar uma conta com informações verdadeiras, exatas e atualizadas. Você é responsável por manter a confidencialidade das suas credenciais e por todas as atividades realizadas em sua conta.',
      },
      {
        type: 'bullets',
        items: [
          'Você deve ter capacidade legal para contratar e, quando aplicável, possuir registro profissional válido.',
          'O acesso é pessoal e intransferível; o compartilhamento de credenciais é de sua exclusiva responsabilidade.',
          'Notifique-nos imediatamente em caso de uso não autorizado ou suspeita de violação de segurança da sua conta.',
        ],
      },
    ],
  },
  {
    id: 'uso-plataforma',
    heading: 'Uso da plataforma',
    blocks: [
      {
        type: 'paragraph',
        text: 'Você se compromete a utilizar a plataforma de forma lícita e de acordo com estes termos. É expressamente vedado:',
      },
      {
        type: 'bullets',
        items: [
          'Utilizar a plataforma para finalidades ilícitas ou que violem direitos de terceiros.',
          'Tentar acessar áreas, dados ou contas que não lhe pertencem.',
          'Realizar engenharia reversa, copiar, modificar ou explorar comercialmente a plataforma sem autorização.',
          'Introduzir códigos maliciosos ou comprometer a segurança, a integridade ou a disponibilidade do serviço.',
          'Sobrecarregar a infraestrutura por meio de automações não autorizadas.',
        ],
      },
    ],
  },
  {
    id: 'responsabilidades-usuario',
    heading: 'Responsabilidades do usuário',
    blocks: [
      {
        type: 'paragraph',
        text: 'Você é o único responsável pelos dados e conteúdos inseridos na plataforma, incluindo os dados de seus pacientes. Nesse contexto, você se compromete a:',
      },
      {
        type: 'bullets',
        items: [
          'Garantir que possui base legal para coletar e tratar os dados inseridos, em conformidade com a LGPD.',
          'Obter o consentimento ou outra base legal adequada para o tratamento de dados de saúde dos pacientes, quando aplicável.',
          'Atender às solicitações de direitos exercidas pelos titulares dos dados que você controla.',
          'Utilizar a plataforma de acordo com as normas do seu conselho profissional e a legislação vigente.',
        ],
      },
    ],
  },
  {
    id: 'planos-assinaturas',
    heading: 'Planos, assinaturas e pagamentos',
    blocks: [
      {
        type: 'paragraph',
        text: 'A plataforma é disponibilizada por meio de planos, que podem ser gratuitos ou pagos. Os valores, ciclos de cobrança e recursos de cada plano são apresentados no momento da contratação e podem ser atualizados mediante aviso prévio.',
      },
      {
        type: 'bullets',
        items: [
          'As assinaturas pagas são renovadas automaticamente ao fim de cada ciclo, salvo cancelamento prévio.',
          'Os pagamentos são processados por provedor terceirizado; eventuais falhas de pagamento podem suspender o acesso aos recursos pagos.',
          'Alterações de preço serão comunicadas com antecedência razoável e passam a valer no ciclo seguinte.',
        ],
      },
    ],
  },
  {
    id: 'periodo-teste',
    heading: 'Período de teste gratuito',
    blocks: [
      {
        type: 'paragraph',
        text: 'Podemos oferecer um período de teste gratuito para experimentação da plataforma. Ao término do período, o acesso aos recursos pagos depende da contratação de um plano. Reservamo-nos o direito de alterar ou encerrar a oferta de teste a qualquer momento.',
      },
    ],
  },
  {
    id: 'cancelamento',
    heading: 'Cancelamento',
    blocks: [
      {
        type: 'paragraph',
        text: 'Você pode cancelar a assinatura a qualquer momento pela própria plataforma. O cancelamento interrompe as renovações futuras e mantém o acesso até o fim do ciclo já pago. Salvo disposição legal em contrário, não há reembolso de valores referentes a períodos já utilizados.',
      },
    ],
  },
  {
    id: 'propriedade-intelectual',
    heading: 'Propriedade intelectual',
    blocks: [
      {
        type: 'paragraph',
        text: `Todos os direitos sobre a plataforma ${CONFIG.appName}, incluindo marca, software, design, textos e demais elementos, pertencem à ${CONFIG.appName} ou a seus licenciadores. O uso da plataforma não transfere qualquer direito de propriedade intelectual a você. Os dados e conteúdos inseridos por você permanecem de sua titularidade.`,
      },
    ],
  },
  {
    id: 'disponibilidade',
    heading: 'Disponibilidade e suporte',
    blocks: [
      {
        type: 'paragraph',
        text: 'Empenhamo-nos para manter a plataforma disponível e segura, mas o serviço pode sofrer interrupções programadas para manutenção ou eventuais indisponibilidades por fatores fora do nosso controle. Não garantimos disponibilidade ininterrupta. O suporte é prestado pelos canais indicados na plataforma.',
      },
    ],
  },
  {
    id: 'limitacao-responsabilidade',
    heading: 'Limitação de responsabilidade',
    blocks: [
      {
        type: 'paragraph',
        text: `Na máxima extensão permitida pela legislação aplicável, a ${CONFIG.appName} não se responsabiliza por decisões clínicas ou profissionais tomadas com base nas informações da plataforma, por danos indiretos, lucros cessantes ou perda de dados decorrentes de uso indevido, nem por conteúdos inseridos pelos usuários. A plataforma é fornecida "no estado em que se encontra".`,
      },
    ],
  },
  {
    id: 'suspensao',
    heading: 'Suspensão e encerramento de conta',
    blocks: [
      {
        type: 'paragraph',
        text: 'Podemos suspender ou encerrar o acesso à conta em caso de violação destes termos, uso fraudulento, determinação legal ou inadimplência. Você também pode encerrar sua conta a qualquer momento. O encerramento observa as regras de retenção descritas na Política de Privacidade.',
      },
    ],
  },
  {
    id: 'alteracoes-termos',
    heading: 'Alterações nos termos',
    blocks: [
      {
        type: 'paragraph',
        text: 'Estes Termos de Uso podem ser atualizados a qualquer momento. As alterações relevantes serão comunicadas pelos canais adequados, e a data da última atualização é sempre indicada no topo deste documento. O uso continuado da plataforma após as alterações representa a sua concordância com os termos vigentes.',
      },
    ],
  },
  {
    id: 'lei-aplicavel',
    heading: 'Lei aplicável e foro',
    blocks: [
      {
        type: 'paragraph',
        text: 'Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do usuário para dirimir eventuais controvérsias, salvo disposição legal em contrário.',
      },
    ],
  },
  {
    id: 'contato',
    heading: 'Contato',
    blocks: [
      {
        type: 'paragraph',
        text: <>Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail {contactLink}.</>,
      },
    ],
  },
];

const DISCLAIMER =
  'Este documento é um modelo inicial e deve ser revisado por um profissional jurídico antes de entrar em vigor, a fim de refletir com precisão as condições reais do serviço e a legislação aplicável.';

const INTRO = `Estes Termos de Uso estabelecem as regras para utilização da plataforma ${CONFIG.appName}. Leia com atenção antes de utilizar o serviço.`;

export function TermsOfUseView() {
  return (
    <PublicPageLayout
      eyebrow="Termos"
      title="Termos de Uso"
      description={`As regras e condições para utilização da plataforma ${CONFIG.appName}.`}
    >
      <LegalDocument
        lastUpdated={LAST_UPDATED}
        disclaimer={DISCLAIMER}
        intro={INTRO}
        sections={SECTIONS}
      />
    </PublicPageLayout>
  );
}
