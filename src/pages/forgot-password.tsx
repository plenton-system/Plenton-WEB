import { CONFIG } from 'src/config-global';
import { useTranslation } from 'react-i18next';

import { NoIndex } from 'src/components/seo';

import { ForgotPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('pages.forgotPassword')} - ${CONFIG.appName}`}</title>
      <NoIndex />

      <ForgotPasswordView />
    </>
  );
}
