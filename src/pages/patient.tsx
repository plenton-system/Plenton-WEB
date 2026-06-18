import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { PatientView } from 'src/sections/patient/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('pages.patient')} - ${CONFIG.appName}`}</title>

      <PatientView />
    </>
  );
}
