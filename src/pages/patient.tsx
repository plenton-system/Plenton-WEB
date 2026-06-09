import { CONFIG } from 'src/config-global';

import { PatientView } from 'src/sections/patient/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Paciente - ${CONFIG.appName}`}</title>

      <PatientView />
    </>
  );
}
