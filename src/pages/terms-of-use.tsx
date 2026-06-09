import { CONFIG } from 'src/config-global';

import { TermsOfUseView } from 'src/sections/institutional/view';

// ----------------------------------------------------------------------

const TITLE = `Termos de Uso — ${CONFIG.appName}`;
const DESCRIPTION = `Conheça as regras e condições para utilização da plataforma ${CONFIG.appName}: cadastro, assinaturas, responsabilidades e cancelamento.`;
const CANONICAL = `${CONFIG.siteUrl}/termos`;

export default function Page() {
  return (
    <>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <link rel="canonical" href={CANONICAL} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={CONFIG.appName} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={CANONICAL} />
      <meta property="og:locale" content="pt_BR" />

      <TermsOfUseView />
    </>
  );
}
