import type { ReactNode } from 'react';
import type { CapabilityResult, PatientPreferences } from 'src/types/domain/patient-portal';

import { useState, useEffect, useContext, useCallback, createElement, createContext } from 'react';

import { useThemeMode } from 'src/hooks/common/use-theme-mode';

import i18n, { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from 'src/i18n';
import { patientPortalService } from 'src/services/patientPortal/patientPortalService';

const THEME_STORAGE_KEY = 'theme';
const preferenceLoadsBySession = new WeakMap<
  object,
  Promise<CapabilityResult<PatientPreferences>>
>();

function loadPreferencesForSession(session: object) {
  const currentLoad = preferenceLoadsBySession.get(session);
  if (currentLoad) return currentLoad;

  const load = patientPortalService.getPreferences();
  preferenceLoadsBySession.set(session, load);
  return load;
}

function cachePreferencesForSession(session: object, preferences: PatientPreferences) {
  preferenceLoadsBySession.set(
    session,
    Promise.resolve({ status: 'available', data: preferences })
  );
}

function cachedPreferences(): PatientPreferences {
  const cachedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const cachedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return {
    theme:
      cachedTheme === 'light' || cachedTheme === 'dark' || cachedTheme === 'system'
        ? cachedTheme
        : 'system',
    preferredLanguage:
      cachedLanguage === 'pt-BR' || cachedLanguage === 'en-US' || cachedLanguage === 'es'
        ? cachedLanguage
        : DEFAULT_LANGUAGE,
  };
}

function usePatientPreferencesState(session: object) {
  const { setMode } = useThemeMode();
  const [confirmed, setConfirmed] = useState<PatientPreferences>(cachedPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readFallback, setReadFallback] = useState(false);
  const [writeError, setWriteError] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const apply = useCallback(
    async (value: PatientPreferences) => {
      setMode(value.theme);
      await i18n.changeLanguage(value.preferredLanguage);
      localStorage.setItem(THEME_STORAGE_KEY, value.theme);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, value.preferredLanguage);
    },
    [setMode]
  );

  useEffect(() => {
    let active = true;
    void loadPreferencesForSession(session)
      .then(async (result) => {
        if (!active) return;
        if (result.status === 'available') {
          setConfirmed(result.data);
          await apply(result.data);
        } else {
          setUnavailable(true);
          setReadFallback(true);
          await apply(cachedPreferences());
        }
      })
      .catch(async () => {
        if (!active) return;
        setReadFallback(true);
        await apply(cachedPreferences());
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apply, session]);

  const update = useCallback(
    async (next: PatientPreferences) => {
      setSaving(true);
      setWriteError(false);
      await apply(next);
      try {
        const persisted = await patientPortalService.updatePreferences(next);
        setConfirmed(persisted);
        cachePreferencesForSession(session, persisted);
        await apply(persisted);
        return true;
      } catch {
        setWriteError(true);
        await apply(confirmed);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [apply, confirmed, session]
  );

  return { preferences: confirmed, loading, saving, readFallback, writeError, unavailable, update };
}

type PatientPreferencesContextValue = ReturnType<typeof usePatientPreferencesState>;

const PatientPreferencesContext = createContext<PatientPreferencesContextValue | null>(null);

export function PatientPreferencesProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: object;
}) {
  const value = usePatientPreferencesState(session);
  return createElement(PatientPreferencesContext.Provider, { value }, children);
}

export function usePatientPreferences(): PatientPreferencesContextValue {
  const context = useContext(PatientPreferencesContext);
  if (!context) {
    throw new Error('usePatientPreferences must be used within PatientPreferencesProvider');
  }
  return context;
}
