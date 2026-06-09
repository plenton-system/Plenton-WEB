import type { ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { createTheme } from './create-theme';

import type { } from './extend-theme-types';
import type { ThemeOptions } from './types';

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps> & {
  themeOverrides?: ThemeOptions;
  defaultMode?: 'light' | 'dark' | 'system';
  modeStorageKey?: string;
};

export function ThemeProvider({
  themeOverrides,
  children,
  defaultMode = 'system',
  modeStorageKey = 'theme',
  ...other
}: ThemeProviderProps) {
  const theme = createTheme({
    themeOverrides,
  });

  return (
    <MuiThemeProvider
      disableTransitionOnChange
      theme={theme}
      defaultMode={defaultMode}
      modeStorageKey={modeStorageKey}
      {...other}
    >
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
