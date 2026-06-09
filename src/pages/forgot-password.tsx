import { CONFIG } from 'src/config-global';

import { NoIndex } from 'src/components/seo';

import { ForgotPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Recuperar senha - ${CONFIG.appName}`}</title>
      <NoIndex />

      <ForgotPasswordView />
    </>
  );
}
