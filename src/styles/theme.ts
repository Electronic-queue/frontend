import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    gray: {
      main: string;
    };
  }
  interface PaletteOptions {
    gray: {
      main: string;
    };
  }
}

const theme = createTheme({
  // components: {"MuiAccordion": {"styleOverrides": {"": {"borderRadius": 8}}}}, // Пример переопределения стилей компонента
  shape: { borderRadius: 8 },
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
      fontSize: '2.5rem', // 40px
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem', // 32px
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
    },
    h6: {
      fontSize: '16px',
      fontWeight: 400,
    },
    body1: {
      fontSize: '12px',
      fontWeight: 400,
    },
  },
});

export default theme;
