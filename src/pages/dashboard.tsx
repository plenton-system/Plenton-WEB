import { CONFIG } from 'src/config-global';
import { useTranslation } from 'react-i18next';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('pages.dashboard')} - ${CONFIG.appName}`}</title>

      <DashboardView />
    </>
  );
}
