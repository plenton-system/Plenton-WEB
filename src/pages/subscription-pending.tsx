import { CONFIG } from 'src/config-global';
import { useTranslation } from 'react-i18next';

import { SubscriptionPendingView } from 'src/sections/subscription';

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('pages.pendingPayment')} - ${CONFIG.appName}`}</title>
      <SubscriptionPendingView />
    </>
  );
}
