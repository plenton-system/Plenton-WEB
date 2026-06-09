import type { User } from 'src/types';

import { JwtUtils } from 'src/utils/jwt-utils';
import { authStorage } from 'src/utils/auth-storage';

import { authService } from 'src/services';

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
        profile
    };

    authStorage.setUser(userWithProfile);

    return userWithProfile;
}
