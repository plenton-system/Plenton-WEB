import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { NoIndex } from 'src/components/seo';

import { ActivatePatientAccountView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation();

  return (
    <>
      <title>{`${t('pages.activatePatientAccount')} - ${CONFIG.appName}`}</title>
      <NoIndex />

      <ActivatePatientAccountView />
    </>
  );
}
