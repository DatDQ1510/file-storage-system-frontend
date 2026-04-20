import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/")

          if (normalizedId.includes("node_modules")) {
            if (normalizedId.includes("react-router")) return "router"
            if (normalizedId.includes("react-dom") || normalizedId.includes("/react/")) return "react-core"
            if (normalizedId.includes("lucide-react")) return "icons"
            if (normalizedId.includes("sonner")) return "notifications"
            if (normalizedId.includes("radix-ui")) return "radix-ui"
            return "vendor"
          }

          if (normalizedId.includes("/src/pages/system-admin/")) return "system-admin"
          if (normalizedId.includes("/src/pages/tenant-admin/")) return "tenant-admin"
          if (normalizedId.includes("/src/pages/user/")) return "user-pages"

          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
