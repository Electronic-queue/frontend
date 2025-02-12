import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "@svgr/rollup";

// https://vite.dev/config/
export default defineConfig({
    plugins: [svgr(), react()],
    base: "./",
    resolve: {
        alias: {
            src: "/src",
        },
    },
});
