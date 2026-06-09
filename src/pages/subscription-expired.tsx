import { CONFIG } from 'src/config-global';

import { SubscriptionStatusRouteView } from 'src/sections/subscription';

export default function Page() {
  return (
    <>
      <title>{`Checkout expirado - ${CONFIG.appName}`}</title>
      <SubscriptionStatusRouteView state="expired" />
    </>
  );
}
