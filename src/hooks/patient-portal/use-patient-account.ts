import type {
  PatientSelfProfile,
  PatientNutritionist,
} from 'src/types/domain/patient-portal';

import { useState, useEffect, useCallback } from 'react';

import { patientPortalService } from 'src/services/patientPortal/patientPortalService';

type Remote<T> = { data: T | null; loading: boolean; error: boolean; unavailable: boolean };

const initialRemote = <T>(): Remote<T> => ({
  data: null,
  loading: true,
  error: false,
  unavailable: false,
});

export function usePatientAccount() {
  const [profile, setProfile] = useState<Remote<PatientSelfProfile>>(initialRemote);
  const [nutritionist, setNutritionist] = useState<Remote<PatientNutritionist>>(initialRemote);

  const loadProfile = useCallback(async () => {
    setProfile((value) => ({ ...value, loading: true, error: false }));
    try {
      const result = await patientPortalService.getProfile();
      setProfile({
        data: result.data,
        loading: false,
        error: false,
        unavailable: result.status === 'unavailable',
      });
    } catch {
      setProfile({ data: null, loading: false, error: true, unavailable: false });
    }
  }, []);

  const loadNutritionist = useCallback(async () => {
    setNutritionist((value) => ({ ...value, loading: true, error: false }));
    try {
      setNutritionist({
        data: await patientPortalService.getNutritionist(),
        loading: false,
        error: false,
        unavailable: false,
      });
    } catch {
      setNutritionist({ data: null, loading: false, error: true, unavailable: false });
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    void loadNutritionist();
  }, [loadNutritionist, loadProfile]);

  return {
    profile,
    nutritionist,
    retryProfile: loadProfile,
    retryNutritionist: loadNutritionist,
  };
}
