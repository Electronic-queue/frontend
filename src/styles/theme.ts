import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Palette {
        gray: {
            main: string;
        };
        lightBlueGray: {
            main: string;
        };
        lightGray: {
            main: string;
        };
        green: {
            main: string;
        };
        lightBlue: {
            main: string;
        };
        semiTransparentWhite: {
            main: string;
        };
    }

    interface PaletteOptions {
        gray?: {
            main: string;
        };
        lightBlueGray?: {
            main: string;
        };
        lightGray?: {
            main: string;
        };
        green?: {
            main: string;
        };
        lightBlue?: {
            main: string;
        };
        semiTransparentWhite?: {
            main: string;
        };
    }
}

const theme = createTheme({
    // components: {"MuiAccordion": {"styleOverrides": {"": {"borderRadius": 8}}}}, // Пример переопределения стилей компонента
    shape: { borderRadius: 8 },
    shadows: [
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
    ],
    palette: {
        primary: {
            main: "#3A6CB4",
        },
        secondary: {
            main: "#2E90FA",
        },
        background: {
            default: "#FFFFFF",
        },
        text: {
            primary: "#333333",
            secondary: "#666666",
        },
        gray: {
            main: "#f1e5e5",
        },
        lightBlueGray: {
            main: "#d0d4df",
        },
        lightGray: {
            main: "#f0f0f0",
        },
        green: {
            main: "#39CB21",
        },
        lightBlue: {
            main: "#f4f8fe",
        },
        semiTransparentWhite: {
            main: "rgba(255, 255, 255, 0.8)",
        },
    },
    typography: {
        fontFamily: `'Rubik', 'Arial', sans-serif`,
        h1: {
            fontSize: "2.5rem", // 40px
            fontWeight: 700,
        },
        h2: {
            fontSize: "2rem", // 32px
            fontWeight: 600,
        },
        h3: {
            fontSize: "1.75rem", // 28px
            fontWeight: 600,
        },
        h4: {
            fontSize: "1.5rem", // 24px
            fontWeight: 600,
        },
        h5: {
            fontSize: "1.25rem", // 20px
            fontWeight: 600,
        },
        h6: {
            fontSize: "16px",
            fontWeight: 400,
        },
        body1: {
            fontSize: "12px",
            fontWeight: 400,
        },
        body2: {
            fontSize: "48px",
            fontWeight: 700,
        },
    },
});

export default theme;
