import { CONFIG } from 'src/config-global';

import { SubscriptionPendingView } from 'src/sections/subscription';

export default function Page() {
  return (
    <>
      <title>{`Pagamento pendente - ${CONFIG.appName}`}</title>
      <SubscriptionPendingView />
    </>
  );
}
