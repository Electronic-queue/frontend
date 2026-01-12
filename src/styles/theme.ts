import { createTheme, PaletteMode } from "@mui/material";
import { PaletteOptions, Shadows } from "@mui/material/styles";

// 1. Расширение типов (как было)
declare module "@mui/material/styles" {
    interface Palette {
        gray: { main: string };
        lightBlueGray: { main: string };
        lightGray: { main: string };
        green: { main: string };
        lightBlue: { main: string };
        semiTransparentWhite: { main: string };
        indigoBlue: { main: string };
    }
    interface PaletteOptions {
        gray?: { main: string };
        lightBlueGray?: { main: string };
        lightGray?: { main: string };
        green?: { main: string };
        lightBlue?: { main: string };
        semiTransparentWhite?: { main: string };
        indigoBlue?: { main: string };
    }
}

// 2. Массив теней с явным типом Shadows (Исправление ошибки TS)
const shadows: Shadows = [
    "none",
    "2px 4px 10px rgba(0, 0, 0, 0.25)",
    "0px 2px 4px rgba(0, 0, 0, 0.15)",
    "0px 2px 7px rgba(0, 0, 0, 0.25)",
    "0px 8px 24px rgba(0, 0, 0, 0.1)",
    "0px 8px 24px rgba(0, 0, 0, 0.2)",
    "2px 4px 10px rgba(0, 0, 0, 0.25)",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
];

// 3. Функция цветов (Light/Dark)
export const getDesignTokens = (mode: PaletteMode): PaletteOptions => ({
    mode,
    ...(mode === "light"
        ? {
              // Light Mode
              primary: { main: "#3A6CB4" },
              secondary: { main: "#2E90FA" },
              background: { default: "#FFFFFF", paper: "#FFFFFF" },
              text: { primary: "#333333", secondary: "#666666" },
              gray: { main: "#f1e5e5" },
              lightBlueGray: { main: "#d0d4df" },
              lightGray: { main: "#f0f0f0" },
              green: { main: "#39CB21" },
              lightBlue: { main: "#f4f8fe" },
              semiTransparentWhite: { main: "rgba(255, 255, 255, 0.8)" },
              indigoBlue: { main: "#3f51b5" },
          }
        : {
              // Dark Mode
              primary: { main: "#3A6CB4" },
              secondary: { main: "#ce93d8" },
              background: { default: "#1e1e1e ", paper: "#121212" },
              text: { primary: "#ffffff", secondary: "#b0bec5" },
              gray: { main: "#303030" },
              lightBlueGray: { main: "#455a64" },
              lightGray: { main: "#424242" },
              green: { main: "#2e7d32" },
              lightBlue: { main: "#1a2327" },
              semiTransparentWhite: { main: "rgba(0, 0, 0, 0.5)" },
              indigoBlue: { main: "#303f9f" },
          }),
});

// 4. Общие настройки
export const commonSettings = {
    shape: { borderRadius: 8 },
    shadows: shadows, 
    typography: {
        fontFamily: `'Rubik', 'Arial', sans-serif`,
        h1: { fontSize: "2.5rem", fontWeight: 700 },
        h2: { fontSize: "2rem", fontWeight: 600 },
        h3: { fontSize: "1.75rem", fontWeight: 600 },
        h4: { fontSize: "1.5rem", fontWeight: 600 },
        h5: { fontSize: "1.25rem", fontWeight: 600 },
        h6: { fontSize: "16px", fontWeight: 400 },
        body1: { fontSize: "12px", fontWeight: 400 },
        body2: { fontSize: "48px", fontWeight: 700 },
    },
};

// 5. Default export для совместимости (чтобы не ломались старые импорты)
const defaultTheme = createTheme({
    ...commonSettings,
    palette: getDesignTokens("light"),
});

export default defaultTheme;