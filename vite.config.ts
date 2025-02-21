import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "@svgr/rollup";

// https://vite.dev/config/
export default defineConfig({
    plugins: [svgr(), react()],
    base: "./queue-client",
    resolve: {
        alias: {
            src: "/src",
        },
    },
});
