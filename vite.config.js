import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Automatically open in browser during dev
  },
  optimizeDeps: {
    // Pre-bundle dependencies that sometimes break on Vercel
    include: ["axios", "dayjs", "react", "react-dom"],
  },
  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      // Usually not needed unless you want to externalize
      // external: ["axios", "dayjs"],
      output: {
        manualChunks: undefined, // Let Vite handle code splitting
      },
    },
  },
  resolve: {
    alias: {
      // Optional: fix path issues
      "@": "/src",
    },
  },
});
