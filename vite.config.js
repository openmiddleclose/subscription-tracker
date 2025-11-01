import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    // Pre-bundle these dependencies to prevent Vercel build errors
    include: ["axios", "dayjs"],
  },
  build: {
    rollupOptions: {
      // Optional: explicitly mark axios and dayjs as external if needed
      // external: ["axios", "dayjs"],
    },
  },
});
