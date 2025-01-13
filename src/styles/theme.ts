import { createTheme } from '@mui/material/styles';
import { Palette, PaletteOptions } from '@mui/material/styles';

// Расширяем типы Palette и PaletteOptions
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
      main: '#3A6CB4', // Цвет основных элементов голубой
    },
    secondary: {
      main: '#2E90FA', // Вторичный цвет ярко голубой
    },
    background: {
      default: '#FFFFFF', // Цвет фона
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    gray: {
      main: '#f1e5e5', // Новый цвет gray
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
  },
});

export default theme;
