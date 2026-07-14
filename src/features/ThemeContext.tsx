import { FC, ReactNode, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import {
    commonSettings,
    getDesignTokens,
} from "src/styles/theme";

export const ThemeContextProvider: FC<{
    children: ReactNode;
}> = ({ children }) => {
    const theme = useMemo(
        () =>
            createTheme({
                ...commonSettings,
                palette: getDesignTokens("light"),
            }),
        []
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};