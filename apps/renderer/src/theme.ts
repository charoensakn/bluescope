import {
  type Components,
  type CssVarsTheme,
  createTheme,
  type Theme,
  type TypographyVariantsOptions,
} from '@mui/material/styles';

export const baseThai = "'Noto Sans Thai Variable', sans-serif";
export const baseThaiLooped = "'Noto Sans Thai Looped Variable', sans-serif";
export const baseMono = "'Noto Sans Mono Variable', monospace";

const typography: TypographyVariantsOptions = {
  fontFamily: baseThaiLooped,

  h1: {
    fontFamily: baseThai,
    fontWeight: 700,
    fontSize: '1.6rem',
    lineHeight: 1.3,
  },
  h2: {
    fontFamily: baseThai,
    fontWeight: 700,
    fontSize: '1.4rem',
    lineHeight: 1.35,
  },
  h3: {
    fontFamily: baseThai,
    fontWeight: 700,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h4: {
    fontFamily: baseThai,
    fontWeight: 700,
    fontSize: '1.15rem',
    lineHeight: 1.45,
  },
  h5: {
    fontFamily: baseThai,
    fontWeight: 700,
    fontSize: '1.05rem',
    lineHeight: 1.5,
  },
  h6: {
    fontFamily: baseThai,
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: 1.55,
  },

  subtitle1: {
    fontWeight: 600,
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  subtitle2: {
    fontWeight: 600,
    fontSize: '0.8rem',
    lineHeight: 1.6,
  },

  body1: {
    fontSize: '0.95rem',
    lineHeight: 1.65,
  },
  body2: {
    fontSize: '0.85rem',
    lineHeight: 1.65,
  },

  caption: {
    fontFamily: baseMono,
    fontSize: '0.85rem',
    lineHeight: 1.6,
  },
};

const components: Components<Omit<Theme, 'palette' | 'components'> & CssVarsTheme> = {
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiInputBase-inputMultiline ': {
          lineHeight: 2,
        },
      },
    },
  },
};

export const light = createTheme({
  colorSchemes: { light: true },
  palette: {
    mode: 'light',
    background: {
      default: 'rgb(247, 249, 252)',
    },
  },
  typography,
  components,
});

export const dark = createTheme({
  colorSchemes: { dark: true },
  palette: {
    mode: 'dark',
    background: {
      default: 'rgb(2, 6, 23)',
    },
  },
  typography,
  components,
});
