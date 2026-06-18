import { CONFIG } from 'src/config-global';
import { useTranslation } from 'react-i18next';

import { LandingView } from 'src/sections/landing/view';

// ----------------------------------------------------------------------

const SITE_URL = CONFIG.siteUrl;
const OG_IMAGE = `${SITE_URL}/assets/og-cover.jpg`;

export default function Page() {
  const { t, i18n } = useTranslation();
  const title = t('pages.landingTitle', { appName: CONFIG.appName });
  const description = t('pages.landingDescription');
  const ogLocale = i18n.resolvedLanguage === 'en-US' ? 'en_US' : i18n.resolvedLanguage === 'es' ? 'es_ES' : 'pt_BR';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE_URL}/`} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={CONFIG.appName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      <LandingView />
    </>
  );
}
