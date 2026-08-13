import type { ReactNode } from 'react';

import { useAuth } from 'src/hooks/common/use-auth';
import { PatientPreferencesProvider } from 'src/hooks/patient-portal/use-patient-preferences';

import { DashboardLayout } from 'src/layouts/dashboard';

import { patientNavData } from './nav-config-patient';
import { PatientProfilePopover } from './patient-profile-popover';

export function PatientLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <PatientPreferencesProvider session={user}>
      <DashboardLayout
        navigation={patientNavData}
        slotProps={{
          header: {
            slots: { rightArea: <PatientProfilePopover /> },
          },
        }}
      >
        {children}
      </DashboardLayout>
    </PatientPreferencesProvider>
  );
}
