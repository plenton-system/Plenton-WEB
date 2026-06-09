import { CONFIG } from 'src/config-global';

import { NoIndex } from 'src/components/seo';

import { ResetPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Nova senha - ${CONFIG.appName}`}</title>
      <NoIndex />

      <ResetPasswordView />
    </>
  );
}
