import { createContext, useState, useMemo, FC, ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, useMediaQuery } from "@mui/material";
import { getDesignTokens, commonSettings } from "src/styles/theme";

// Контекст для кнопки переключения
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const ThemeContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // 1. Проверяем системные настройки
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    
    // 2. State для режима
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const savedMode = localStorage.getItem('themeMode');
        if (savedMode === 'light' || savedMode === 'dark') return savedMode;
        return prefersDarkMode ? 'dark' : 'light';
    });

    // 3. Функция переключения
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('themeMode', newMode);
                    return newMode;
                });
            },
        }),
        []
    );

    // 4. Генерация темы
    // Мы берем commonSettings и добавляем туда palette из getDesignTokens
    const theme = useMemo(
        () => createTheme({
            ...commonSettings, // Тени, шрифты и т.д.
            palette: getDesignTokens(mode), // Цвета (зависят от mode)
        }),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};