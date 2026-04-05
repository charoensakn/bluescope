import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { dark, light } from '../theme';

export type AppThemeProps = {
  mode: string;
};

export function AppTheme({ mode, children }: PropsWithChildren<AppThemeProps>) {
  const theme = mode === 'light' ? light : dark;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <GlobalStyles
        styles={{
          body: {
            width: '100%',
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          },
          '#root': {
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
          },
          '.titlebar': {
            appRegion: 'drag',
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}
