import { CONFIG } from 'src/config-global';

import { PrivacyPolicyView } from 'src/sections/institutional/view';

// ----------------------------------------------------------------------

const TITLE = `Política de Privacidade — ${CONFIG.appName}`;
const DESCRIPTION = `Saiba como a ${CONFIG.appName} coleta, utiliza, compartilha e protege os dados pessoais na plataforma, em conformidade com a LGPD.`;
const CANONICAL = `${CONFIG.siteUrl}/privacidade`;

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

      <PrivacyPolicyView />
    </>
  );
}
