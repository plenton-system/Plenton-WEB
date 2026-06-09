import { CONFIG } from 'src/config-global';

import { SubscriptionCheckoutView } from 'src/sections/subscription';

export default function Page() {
  return (
    <>
      <title>{`Assinatura - ${CONFIG.appName}`}</title>
      <SubscriptionCheckoutView />
    </>
  );
}
