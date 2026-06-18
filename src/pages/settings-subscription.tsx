import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { SubscriptionManagementView } from 'src/sections/subscription';

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('subscription.common.mySubscription')} - ${CONFIG.appName}`}</title>
      <SubscriptionManagementView />
    </>
  );
}
