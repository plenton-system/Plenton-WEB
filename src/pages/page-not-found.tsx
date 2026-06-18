import { CONFIG } from 'src/config-global';
import { useTranslation } from 'react-i18next';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation();

  return (
    <>
      <title>{`${t('pages.notFoundTitle')} - ${CONFIG.appName}`}</title>

      <NotFoundView />
    </>
  );
}
