import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  optimizeDeps: {
    include: ["three", "@react-three/fiber", "@react-three/drei"],
  },
  build: {
    // The WebGL chunk (three + fiber + drei) is lazy-loaded after idle and is ~300 kB gzipped.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // No manual "three" chunk: three, fiber and drei must stay inside the lazily imported
        // ArchitectureScene chunk. A manual chunk would also capture the few three/src curve
        // modules the SVG plan imports and make the entry preload all of three.js.
        manualChunks: {
          motion: ["framer-motion", "gsap", "@gsap/react"],
        },
      },
    },
  },
})
