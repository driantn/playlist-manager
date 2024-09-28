import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [TanStackRouterVite(), react()],
    server: {
      host: "localhost",
      port: 3000,
    },
    base: env.VITE_BASE,
  };
});
