import type { CommonColors } from '@mui/material/styles';

import type { ThemeCssVariables } from './types';
import type { PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------

type ThemeScheme = {
  primary: PaletteColorNoChannels;
  background: {
    default: string;
    paper: string;
  };
};

type ThemeConfig = {
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: {
    light: ThemeScheme;
    dark: ThemeScheme;
    secondary: PaletteColorNoChannels;
    info: PaletteColorNoChannels;
    success: PaletteColorNoChannels;
    warning: PaletteColorNoChannels;
    error: PaletteColorNoChannels;
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
};

/** **************************************
 * Brand — Plenton (Esmeralda)
 * --------------------------------------
 * No modo claro a primary é mais profunda (esmeralda-600) sobre fundo branco.
 * No escuro ela clareia (esmeralda-400) para se destacar como acento, com texto
 * escuro nos botões. O fundo escuro é quase neutro, com um leve toque esmeralda,
 * para não deixar a interface "esverdeada".
 *************************************** */
const brandPrimary = {
  light: {
    lighter: '#D1FAE5',
    light: '#34D399',
    main: '#059669',
    dark: '#047857',
    darker: '#064E3B',
    contrastText: '#FFFFFF',
  },
  dark: {
    lighter: '#A7F3D0',
    light: '#34D399',
    main: '#059669',
    dark: '#047857',
    darker: '#064E3B',
    contrastText: '#FFFFFF',
  },
} as const;

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  classesPrefix: 'minimal',

  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'DM Sans Variable',
    secondary: 'Barlow',
  },

  /** **************************************
   * Palette
   *************************************** */
  palette: {
    light: {
      primary: brandPrimary.light,
      background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
      },
    },

    dark: {
      primary: brandPrimary.dark,
      background: {
        // Cinza neutro quase-preto no estilo Supabase (sem tom esverdeado).
        default: '#1C1C1C',
        paper: '#202020',
      },
    },

    secondary: {
      lighter: '#EFD6FF',
      light: '#C684FF',
      main: '#8E33FF',
      dark: '#5119B7',
      darker: '#27097A',
      contrastText: '#FFFFFF',
    },

    info: {
      lighter: '#CAFDF5',
      light: '#61F3F3',
      main: '#00B8D9',
      dark: '#006C9C',
      darker: '#003768',
      contrastText: '#FFFFFF',
    },

    success: {
      lighter: '#D3FCD2',
      light: '#77ED8B',
      main: '#22C55E',
      dark: '#118D57',
      darker: '#065E49',
      contrastText: '#ffffff',
    },

    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },

    error: {
      lighter: '#FFE9D5',
      light: '#FFAC82',
      main: '#FF5630',
      dark: '#B71D18',
      darker: '#7A0916',
      contrastText: '#FFFFFF',
    },

    grey: {
      '50': '#FCFDFD',
      '100': '#F9FAFB',
      '200': '#F4F6F8',
      '300': '#DFE3E8',
      '400': '#C4CDD5',
      '500': '#919EAB',
      '600': '#637381',
      '700': '#2B2B2B',
      '800': '#1C1C1C',
      '900': '#141414',
    },
    common: {
      black: '#000000',
      white: '#FFFFFF'
    },
  },

  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
