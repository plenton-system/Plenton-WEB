import { it, vi, expect, describe, beforeEach } from 'vitest';

import { JwtUtils } from 'src/utils/jwt-utils';
import { authStorage } from 'src/utils/auth-storage';

import { authService } from 'src/services';
import { systemSettingsService } from 'src/services/systemSettings/systemSettingsService';

import { buildAndStoreUser } from './auth-helpers';

vi.mock('src/utils/jwt-utils', () => ({ JwtUtils: { getPayload: vi.fn() } }));
vi.mock('src/utils/auth-storage', () => ({ authStorage: { setUser: vi.fn() } }));
vi.mock('src/services', () => ({ authService: { getUserProfile: vi.fn() } }));
vi.mock('src/services/systemSettings/systemSettingsService', () => ({
  systemSettingsService: { getByUserId: vi.fn() },
}));
vi.mock('src/i18n', () => ({
  default: { t: (key: string) => key, changeLanguage: vi.fn() },
  SUPPORTED_LANGUAGES: ['pt-BR', 'en-US', 'es'],
}));

describe('buildAndStoreUser role-aware settings bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getUserProfile).mockResolvedValue({
      id: 'profile',
      photo: '',
      status: 'Active',
      name: 'User',
    });
  });

  it('does not call the Nutritionist settings endpoint for Patient sessions', async () => {
    vi.mocked(JwtUtils.getPayload).mockReturnValue({
      id: 'patient',
      email: 'patient@test.dev',
      name: 'Patient',
      role: 'Patient',
      tenantId: 'tenant',
      exp: 1,
    });
    await buildAndStoreUser('token');
    expect(systemSettingsService.getByUserId).not.toHaveBeenCalled();
    expect(authStorage.setUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'Patient' }));
  });

  it('preserves the existing Nutritionist settings bootstrap', async () => {
    vi.mocked(JwtUtils.getPayload).mockReturnValue({
      id: 'nutritionist',
      email: 'nutritionist@test.dev',
      name: 'Nutritionist',
      role: 'Nutritionist',
      tenantId: 'tenant',
      exp: 1,
    });
    vi.mocked(systemSettingsService.getByUserId).mockResolvedValue({
      id: 'settings',
      userId: 'nutritionist',
      generalDto: { orderBy: 'Name', autoSendBirthdayEmail: false },
      anamnesisDto: { defaultTemplateId: null },
      preferenceDto: { preferredLanguage: 'pt-BR', theme: 'system' },
      appSystemSettingsDto: { showAnthropometry: true, showPrescriptions: true },
    });
    await buildAndStoreUser('token');
    expect(systemSettingsService.getByUserId).toHaveBeenCalledWith('nutritionist');
  });
});
