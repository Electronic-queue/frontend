import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./i18n";
import App from "./App.tsx";
import store from "./store/store.ts";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./styles/theme.ts";
import { ThemeContextProvider } from "./features/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <ThemeContextProvider>
                    <App />
                </ThemeContextProvider>
            </BrowserRouter>
        </Provider>
    </StrictMode>
);
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {})
        .catch((err) => {
            console.error("❌ Ошибка при регистрации Service Worker:", err);
        });
}
