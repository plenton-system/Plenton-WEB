import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { PrivacyPolicyView } from 'src/sections/institutional/view';

// ----------------------------------------------------------------------

const CANONICAL = `${CONFIG.siteUrl}/privacidade`;

export default function Page() {
  const { t, i18n } = useTranslation();
  const title = `${t('institutional.privacy.title')} — ${CONFIG.appName}`;
  const description = t('institutional.privacy.description', { appName: CONFIG.appName });
  const ogLocale = i18n.resolvedLanguage === 'en-US' ? 'en_US' : i18n.resolvedLanguage === 'es' ? 'es_ES' : 'pt_BR';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={CANONICAL} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={CONFIG.appName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={CANONICAL} />
      <meta property="og:locale" content={ogLocale} />

      <PrivacyPolicyView />
    </>
  );
}
