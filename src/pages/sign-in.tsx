import { CONFIG } from 'src/config-global';
import { useTranslation } from 'react-i18next';

import { SignInView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('pages.signIn')} - ${CONFIG.appName}`}</title>

      <SignInView />
    </>
  );
}
