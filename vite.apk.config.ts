import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/**
 * Client-only SPA build bundled into the Android APK.
 * Do not use this for the live preview — keep vite.config.ts for :8080.
 */
export default defineConfig({
  define: {
    "import.meta.env.VITE_APK": JSON.stringify("1"),
    "import.meta.env.VITE_AUTH_ENABLED": JSON.stringify("false"),
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      spa: { enabled: true },
    }),
    nitro({
      preset: "static",
    }),
    viteReact(),
  ],
});
