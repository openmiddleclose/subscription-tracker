// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Vite configuration for React + Chakra UI + Supabase + Stripe
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Open browser automatically during dev
  },
  optimizeDeps: {
    // Pre-bundle dependencies to avoid Vercel build errors
    include: [
      "axios",
      "dayjs",
      "react",
      "react-dom",
      "@chakra-ui/react",
      "@chakra-ui/icons",
      "framer-motion",
      "recharts",
    ],
  },
  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Let Vite handle code splitting
        manualChunks: undefined,
      },
      // If you want to externalize specific modules in the future:
      // external: ["axios", "dayjs"],
    },
    chunkSizeWarningLimit: 2000, // optional, increase warning limit
  },
  resolve: {
    alias: {
      "@": "/src", // optional alias for cleaner imports
    },
  },
});
