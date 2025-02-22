import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "@svgr/rollup";

export default defineConfig({
    plugins: [svgr(), react()],
    base: "./queue-client",
    resolve: {
        alias: {
            src: "/src",
        },
    },
    server: {
        port: 3000,
    },
});
