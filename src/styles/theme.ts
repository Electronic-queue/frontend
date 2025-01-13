import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    gray?: {
      main: string;
    };
  }
  interface PaletteOptions {
    gray?: {
      main: string;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#3A6CB4',
    },
    secondary: {
      main: '#2E90FA',
    },
    background: {
      default: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    gray: {
      main: '#f1e5e5',
    },
  },
  typography: {
    fontFamily: `'Rubik', 'Arial', sans-serif`,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: `'Rubik', 'Arial', sans-serif`,
      fontSize: '16px',
      fontWeight: 400,
    },
  },
});

export default theme;
