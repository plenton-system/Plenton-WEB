import { varAlpha } from 'minimal-shared/utils';

import { grey, info, error, common, success, warning, secondary, primaryDark, primaryLight } from './palette';

import type { ThemeColorScheme } from '../types';

// ----------------------------------------------------------------------

/**
 * TypeScript (type definition and extension)
 * @to {@link file://./../extend-theme-types.d.ts}
 */

export interface CustomShadows {
  z1?: string;
  z4?: string;
  z8?: string;
  z12?: string;
  z16?: string;
  z20?: string;
  z24?: string;
  primary?: string;
  secondary?: string;
  info?: string;
  success?: string;
  warning?: string;
  error?: string;
  card?: string;
  dialog?: string;
  dropdown?: string;
}

// ----------------------------------------------------------------------

export function createShadowColor(colorChannel: string): string {
  return `0 8px 16px 0 ${varAlpha(colorChannel, 0.24)}`;
}

type ShadowPalette = {
  primaryChannel: string;
  secondaryChannel: string;
  infoChannel: string;
  successChannel: string;
  warningChannel: string;
  errorChannel: string;
};

function createCustomShadows(colorChannel: string, colors: ShadowPalette): CustomShadows {
  return {
    z1: `0 1px 2px 0 ${varAlpha(colorChannel, 0.16)}`,
    z4: `0 4px 8px 0 ${varAlpha(colorChannel, 0.16)}`,
    z8: `0 8px 16px 0 ${varAlpha(colorChannel, 0.16)}`,
    z12: `0 12px 24px -4px ${varAlpha(colorChannel, 0.16)}`,
    z16: `0 16px 32px -4px ${varAlpha(colorChannel, 0.16)}`,
    z20: `0 20px 40px -4px ${varAlpha(colorChannel, 0.16)}`,
    z24: `0 24px 48px 0 ${varAlpha(colorChannel, 0.16)}`,
    /********/
    dialog: `-40px 40px 80px -8px ${varAlpha(common.blackChannel, 0.24)}`,
    card: `0 0 2px 0 ${varAlpha(colorChannel, 0.2)}, 0 12px 24px -4px ${varAlpha(colorChannel, 0.12)}`,
    dropdown: `0 0 2px 0 ${varAlpha(colorChannel, 0.24)}, -20px 20px 40px -4px ${varAlpha(colorChannel, 0.24)}`,
    /********/
    primary: createShadowColor(colors.primaryChannel),
    secondary: createShadowColor(colors.secondaryChannel),
    info: createShadowColor(colors.infoChannel),
    success: createShadowColor(colors.successChannel),
    warning: createShadowColor(colors.warningChannel),
    error: createShadowColor(colors.errorChannel),
  };
}

export const customShadows: Partial<Record<ThemeColorScheme, CustomShadows>> = {
  light: createCustomShadows(grey['500Channel'], {
    primaryChannel: primaryLight.mainChannel,
    secondaryChannel: secondary.mainChannel,
    infoChannel: info.mainChannel,
    successChannel: success.mainChannel,
    warningChannel: warning.mainChannel,
    errorChannel: error.mainChannel,
  }),
  dark: createCustomShadows(common.blackChannel, {
    primaryChannel: primaryDark.mainChannel,
    secondaryChannel: secondary.mainChannel,
    infoChannel: info.mainChannel,
    successChannel: success.mainChannel,
    warningChannel: warning.mainChannel,
    errorChannel: error.mainChannel,
  }),
};