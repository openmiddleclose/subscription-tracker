// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Subscription Tracker",
        short_name: "SubTracker",
        description: "Track all your subscriptions easily",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    open: true, // Open browser automatically during dev
  },
  optimizeDeps: {
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
        manualChunks: undefined, // Let Vite handle code splitting
      },
      // external: ["axios", "dayjs"], // Optional externalization
    },
    chunkSizeWarningLimit: 2000, // Increase warning limit
  },
  resolve: {
    alias: {
      "@": "/src", // Cleaner imports
    },
  },
});
