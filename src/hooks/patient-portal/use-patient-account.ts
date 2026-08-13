import type {
  PatientSelfProfile,
  PatientNutritionist,
  UpdatePatientSelfProfile,
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

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

  const updateProfile = useCallback(async (payload: UpdatePatientSelfProfile) => {
    setSaving(true);
    setSaveError(false);
    try {
      const data = await patientPortalService.updateProfile(payload);
      setProfile({ data, loading: false, error: false, unavailable: false });
      return true;
    } catch {
      setSaveError(true);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    profile,
    nutritionist,
    saving,
    saveError,
    retryProfile: loadProfile,
    retryNutritionist: loadNutritionist,
    updateProfile,
  };
}
