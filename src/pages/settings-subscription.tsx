import { CONFIG } from 'src/config-global';

import { SubscriptionManagementView } from 'src/sections/subscription';

export default function Page() {
  return (
    <>
      <title>{`Minha assinatura - ${CONFIG.appName}`}</title>
      <SubscriptionManagementView />
    </>
  );
}
