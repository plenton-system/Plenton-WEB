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

const SECTIONS: LegalSection[] = [
  {
    id: 'quem-somos',
    heading: 'Quem somos',
    blocks: [
      {
        type: 'paragraph',
        text: `A ${CONFIG.appName} é uma plataforma de gestão para nutricionistas que reúne cadastro de pacientes, planos alimentares, anamneses, agenda e indicadores em um único lugar. Esta Política de Privacidade explica como tratamos os dados pessoais de quem utiliza a plataforma (nutricionistas e demais usuários da conta) e dos pacientes cujos dados são inseridos por esses profissionais.`,
      },
      {
        type: 'paragraph',
        text: 'Ao criar uma conta ou utilizar a plataforma, você declara estar ciente das práticas descritas neste documento.',
      },
    ],
  },
  {
    id: 'dados-coletados',
    heading: 'Dados que coletamos',
    blocks: [
      {
        type: 'paragraph',
        text: 'Coletamos diferentes categorias de dados, conforme a sua interação com a plataforma:',
      },
      {
        type: 'bullets',
        items: [
          'Dados cadastrais do usuário: nome, e-mail, telefone, documento profissional (ex.: CRN) e credenciais de acesso.',
          'Dados de assinatura e pagamento: plano contratado, status da assinatura e identificadores de cobrança processados pelo nosso provedor de pagamentos. Não armazenamos os dados completos do cartão de crédito.',
          'Dados de pacientes inseridos pelo usuário: informações de identificação, contato, dados clínicos, antropométricos, anamneses, planos alimentares e demais registros necessários ao atendimento nutricional.',
          'Dados de uso e técnicos: endereço IP, tipo de dispositivo e navegador, páginas acessadas, datas e horários de acesso e logs de atividade.',
          'Cookies e tecnologias similares: identificadores necessários para autenticação, preferências e melhoria da experiência.',
        ],
      },
    ],
  },
  {
    id: 'finalidade',
    heading: 'Finalidade do uso dos dados',
    blocks: [
      {
        type: 'paragraph',
        text: 'Utilizamos os dados pessoais para as seguintes finalidades, sempre amparadas em uma base legal prevista na Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD):',
      },
      {
        type: 'bullets',
        items: [
          'Permitir o cadastro, a autenticação e o funcionamento da conta (execução de contrato).',
          'Disponibilizar e operar os recursos da plataforma, como pacientes, planos alimentares, anamneses e agenda (execução de contrato).',
          'Processar assinaturas, cobranças e renovações (execução de contrato e cumprimento de obrigação legal/regulatória).',
          'Enviar comunicações operacionais e de suporte (legítimo interesse e execução de contrato).',
          'Garantir segurança, prevenir fraudes e cumprir obrigações legais (cumprimento de obrigação legal e legítimo interesse).',
          'Melhorar a plataforma a partir de dados de uso agregados (legítimo interesse).',
        ],
      },
    ],
  },
  {
    id: 'dados-pacientes',
    heading: 'Tratamento de dados de pacientes',
    blocks: [
      {
        type: 'paragraph',
        text: `Em relação aos dados de pacientes, o nutricionista (titular da conta) atua como controlador desses dados, definindo as finalidades do tratamento e sendo responsável por obter as bases legais adequadas, incluindo, quando aplicável, o consentimento para tratamento de dados de saúde (dados pessoais sensíveis). A ${CONFIG.appName} atua como operadora, tratando esses dados em nome e segundo as instruções do usuário.`,
      },
      {
        type: 'paragraph',
        text: 'Cabe ao usuário assegurar que possui base legal para inserir e tratar os dados de seus pacientes na plataforma e atender às solicitações de direitos exercidas por esses titulares.',
      },
    ],
  },
  {
    id: 'compartilhamento',
    heading: 'Compartilhamento de dados',
    blocks: [
      {
        type: 'paragraph',
        text: 'Não vendemos dados pessoais. Podemos compartilhar dados com terceiros estritamente nas seguintes situações:',
      },
      {
        type: 'bullets',
        items: [
          'Provedores de infraestrutura e hospedagem responsáveis por armazenar e processar os dados da plataforma.',
          'Provedores de pagamento, para processar assinaturas e cobranças.',
          'Provedores de comunicação e suporte, quando necessário para atender ao usuário.',
          'Autoridades competentes, mediante obrigação legal, regulatória ou ordem judicial.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Os terceiros que tratam dados em nosso nome são contratualmente obrigados a adotar medidas de segurança e a tratar os dados apenas conforme as nossas instruções.',
      },
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies e tecnologias de rastreamento',
    blocks: [
      {
        type: 'paragraph',
        text: 'Utilizamos cookies e tecnologias similares para manter você autenticado, lembrar preferências (como o tema da interface) e entender como a plataforma é utilizada. Os cookies essenciais são necessários para o funcionamento do serviço; os demais podem ser gerenciados nas configurações do seu navegador.',
      },
    ],
  },
  {
    id: 'seguranca',
    heading: 'Segurança da informação',
    blocks: [
      {
        type: 'paragraph',
        text: 'Adotamos medidas técnicas e organizacionais para proteger os dados pessoais, como criptografia em trânsito, isolamento de dados por conta (multi-tenant), controle de acesso e monitoramento. Nenhum método de transmissão ou armazenamento é 100% seguro, mas trabalhamos continuamente para reduzir riscos e responder a incidentes de forma adequada.',
      },
    ],
  },
  {
    id: 'retencao',
    heading: 'Retenção e eliminação de dados',
    blocks: [
      {
        type: 'paragraph',
        text: 'Mantemos os dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, atender a obrigações legais e regulatórias e exercer direitos em processos. Encerrada a conta, os dados podem ser eliminados ou anonimizados, respeitados os prazos legais de guarda aplicáveis.',
      },
    ],
  },
  {
    id: 'direitos-titular',
    heading: 'Direitos do titular',
    blocks: [
      {
        type: 'paragraph',
        text: 'Nos termos da LGPD, o titular dos dados pode solicitar, a qualquer momento:',
      },
      {
        type: 'bullets',
        items: [
          'Confirmação da existência de tratamento e acesso aos seus dados.',
          'Correção de dados incompletos, inexatos ou desatualizados.',
          'Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.',
          'Portabilidade dos dados a outro fornecedor de serviço.',
          'Informação sobre o compartilhamento de dados com terceiros.',
          'Revogação do consentimento, quando este for a base legal aplicável.',
        ],
      },
      {
        type: 'paragraph',
        text: <>Para exercer seus direitos, entre em contato pelo e-mail {contactLink}. Caso os dados se refiram a um paciente, a solicitação deve ser direcionada ao nutricionista responsável pela conta, que atua como controlador.</>,
      },
    ],
  },
  {
    id: 'alteracoes',
    heading: 'Alterações nesta política',
    blocks: [
      {
        type: 'paragraph',
        text: 'Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças legais, técnicas ou no serviço. A data da última atualização é sempre indicada no topo deste documento. Recomendamos a revisão periódica desta página.',
      },
    ],
  },
  {
    id: 'contato',
    heading: 'Encarregado e contato',
    blocks: [
      {
        type: 'paragraph',
        text: <>Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento de dados pessoais, entre em contato pelo e-mail {contactLink}.</>,
      },
    ],
  },
];

const DISCLAIMER =
  'Este documento é um modelo inicial e deve ser revisado por um profissional jurídico antes de entrar em vigor, a fim de refletir com precisão as práticas reais de tratamento de dados e a legislação aplicável.';

const INTRO = `A sua privacidade é importante para nós. Este documento descreve, de forma transparente, como a ${CONFIG.appName} coleta, utiliza, compartilha e protege os dados pessoais tratados na plataforma.`;

export function PrivacyPolicyView() {
  return (
    <PublicPageLayout
      eyebrow="Privacidade"
      title="Política de Privacidade"
      description={`Como a ${CONFIG.appName} trata e protege os dados pessoais na plataforma.`}
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
