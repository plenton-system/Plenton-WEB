import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { SubscriptionStatusRouteView } from 'src/sections/subscription';

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('subscription.statusRoute.cancelTitle')} - ${CONFIG.appName}`}</title>
      <SubscriptionStatusRouteView state="cancel" />
    </>
  );
}
