import type { ReactNode } from 'react';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useThemeMode } from 'src/hooks/common/use-theme-mode';

import i18n from 'src/i18n';
import { patientPortalService } from 'src/services/patientPortal/patientPortalService';

import { usePatientPreferences, PatientPreferencesProvider } from './use-patient-preferences';

vi.mock('src/hooks/common/use-theme-mode', () => ({ useThemeMode: vi.fn() }));
vi.mock('src/i18n', () => ({
  default: { changeLanguage: vi.fn().mockResolvedValue(undefined) },
  DEFAULT_LANGUAGE: 'pt-BR',
  LANGUAGE_STORAGE_KEY: 'language',
}));
vi.mock('src/services/patientPortal/patientPortalService', () => ({
  patientPortalService: { getPreferences: vi.fn(), updatePreferences: vi.fn() },
}));

describe('usePatientPreferences', () => {
  const setMode = vi.fn();
  let session: object;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <PatientPreferencesProvider session={session}>{children}</PatientPreferencesProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    session = {};
    vi.mocked(useThemeMode).mockReturnValue({
      mode: 'system',
      setMode,
      systemMode: 'light',
      resolvedMode: 'light',
    });
  });

  it('applies and caches canonical server preferences', async () => {
    vi.mocked(patientPortalService.getPreferences).mockResolvedValue({
      status: 'available',
      data: { theme: 'dark', preferredLanguage: 'en-US' },
    });
    const { result } = renderHook(() => usePatientPreferences(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(setMode).toHaveBeenCalledWith('dark');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en-US');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.getItem('language')).toBe('en-US');
  });

  it('hydrates preferences only once when the Patient provider remounts in the same session', async () => {
    vi.mocked(patientPortalService.getPreferences).mockResolvedValue({
      status: 'available',
      data: { theme: 'dark', preferredLanguage: 'en-US' },
    });
    const firstMount = renderHook(() => usePatientPreferences(), { wrapper });
    await waitFor(() => expect(firstMount.result.current.loading).toBe(false));
    firstMount.unmount();

    const secondMount = renderHook(() => usePatientPreferences(), { wrapper });
    await waitFor(() => expect(secondMount.result.current.loading).toBe(false));

    expect(patientPortalService.getPreferences).toHaveBeenCalledOnce();
  });

  it('continues with cached values when the backend capability is unavailable', async () => {
    localStorage.setItem('theme', 'light');
    localStorage.setItem('language', 'es');
    vi.mocked(patientPortalService.getPreferences).mockResolvedValue({
      status: 'unavailable',
      data: null,
    });
    const { result } = renderHook(() => usePatientPreferences(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.unavailable).toBe(true);
    expect(result.current.readFallback).toBe(true);
    expect(setMode).toHaveBeenCalledWith('light');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('es');
  });

  it('rolls back optimistic changes when persistence fails', async () => {
    vi.mocked(patientPortalService.getPreferences).mockResolvedValue({
      status: 'available',
      data: { theme: 'dark', preferredLanguage: 'pt-BR' },
    });
    vi.mocked(patientPortalService.updatePreferences).mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => usePatientPreferences(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.update({ theme: 'light', preferredLanguage: 'es' });
    });
    expect(result.current.writeError).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.getItem('language')).toBe('pt-BR');
  });
});
