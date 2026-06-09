import { CONFIG } from 'src/config-global';

import { ContactView } from 'src/sections/institutional/view';

// ----------------------------------------------------------------------

const TITLE = `Contato — ${CONFIG.appName}`;
const DESCRIPTION = `Fale com a equipe ${CONFIG.appName}. Tire dúvidas, envie sugestões ou solicite suporte sobre a plataforma de gestão para nutricionistas.`;
const CANONICAL = `${CONFIG.siteUrl}/contato`;

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

      <ContactView />
    </>
  );
}
