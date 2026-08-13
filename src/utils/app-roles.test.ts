import { it, expect, describe } from 'vitest';

import {
  normalizeRoles,
  resolveHomePath,
  resolvePrimaryRole,
  isPathCompatibleWithRoles,
  resolvePostSignInDestination,
} from './app-roles';

describe('app role resolution', () => {
  it.each([
    ['single role', 'Patient', ['Patient']],
    ['comma-separated claims', 'Patient, Nutritionist', ['Patient', 'Nutritionist']],
    ['array claims', ['patient', 'ADMIN', 'unknown'], ['Patient', 'Admin']],
    ['missing claims', undefined, []],
  ])('normalizes %s', (_, input, expected) => {
    expect(normalizeRoles(input)).toEqual(expected);
  });

  it.each([
    [['Patient', 'Nutritionist'], 'Nutritionist', '/dashboard'],
    [['Patient', 'Admin'], 'Admin', '/admin'],
    [['Nutritionist', 'Admin', 'Patient'], 'Admin', '/admin'],
    [['Patient'], 'Patient', '/portal'],
    [['Unknown'], null, '/404'],
  ])('uses deterministic precedence for %j', (roles, primary, home) => {
    expect(resolvePrimaryRole(roles)).toBe(primary);
    expect(resolveHomePath([...roles].reverse())).toBe(home);
  });

  it('accepts return locations only for a compatible role tree', () => {
    expect(isPathCompatibleWithRoles('/portal/meal-plan', 'Patient')).toBe(true);
    expect(isPathCompatibleWithRoles('/dashboard', 'Patient')).toBe(false);
    expect(isPathCompatibleWithRoles('/admin/users', ['Nutritionist', 'Admin'])).toBe(true);
  });

  it('never sends a Patient to a pending Nutritionist checkout', () => {
    expect(resolvePostSignInDestination('Patient', null, 'price-old')).toBe('/portal');
    expect(resolvePostSignInDestination('Nutritionist', null, 'price-current')).toBe(
      '/subscription/checkout?planPriceId=price-current'
    );
  });
});
