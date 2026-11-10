import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react({ compiler: true }), tailwindcss()],
  server: { host: "localhost", port: 3000 },
  base: loadEnv(mode, process.cwd(), "").VITE_BASE,
}));
