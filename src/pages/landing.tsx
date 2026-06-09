import { CONFIG } from 'src/config-global';

import { LandingView } from 'src/sections/landing/view';

// ----------------------------------------------------------------------

const SITE_URL = CONFIG.siteUrl;
const TITLE = `${CONFIG.appName} — Software de gestão para nutricionistas`;
const DESCRIPTION =
  'Plataforma completa para nutricionistas: pacientes, planos alimentares, anamneses, agenda e dashboard em um único lugar. Experimente grátis.';
const OG_IMAGE = `${SITE_URL}/assets/og-cover.jpg`;

export default function Page() {
  return (
    <>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <link rel="canonical" href={`${SITE_URL}/`} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={CONFIG.appName} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={OG_IMAGE} />

      <LandingView />
    </>
  );
}
