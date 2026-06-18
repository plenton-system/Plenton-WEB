import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { SubscriptionCheckoutView } from 'src/sections/subscription';

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('pages.subscription')} - ${CONFIG.appName}`}</title>
      <SubscriptionCheckoutView />
    </>
  );
}
