import type { User } from 'src/types';

import { JwtUtils } from 'src/utils/jwt-utils';
import { authStorage } from 'src/utils/auth-storage';

import { authService } from 'src/services';
import i18n, { SUPPORTED_LANGUAGES } from 'src/i18n';
import { systemSettingsService } from 'src/services/systemSettings/systemSettingsService';

// ----------------------------------------------------------------------

export async function buildAndStoreUser(token?: string): Promise<User> {
    const payload = JwtUtils.getPayload(token);

    if (!payload)
        throw new Error('Token inválido ou payload ausente');

    const userData: Omit<User, 'profile'> = {
        id: payload.id ?? '',
        email: payload.email ?? '',
        name: payload.name ?? '',
        role: payload.role ?? '',
        tenantId: payload.tenantId ?? '',
    };

    const profile = await authService.getUserProfile();

    const userWithProfile: User = {
        ...userData,
        name: profile?.name?.trim() || userData.name,
        profile,
    };

    try {
        const settings = await systemSettingsService.getByUserId(userData.id);
        const preferredLanguage = settings.preferenceDto?.preferredLanguage;

        if (
            preferredLanguage &&
            SUPPORTED_LANGUAGES.includes(preferredLanguage as (typeof SUPPORTED_LANGUAGES)[number])
        ) {
            await i18n.changeLanguage(preferredLanguage);
        }
    } catch {
        // A sessão continua válida mesmo se as preferências ainda não existirem.
    }

    authStorage.setUser(userWithProfile);

    return userWithProfile;
}
