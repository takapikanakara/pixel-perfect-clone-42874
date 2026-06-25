// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect the deploy target. Vercel sets `VERCEL=1` in its build environment.
// Outside the Lovable sandbox we must opt into nitro explicitly and pick the right preset.
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  // On Cloudflare (Lovable hosting) we redirect TanStack Start's bundled server entry
  // to src/server.ts (our SSR error wrapper, which exports a Workers `{ fetch }` handler).
  // That shape is incompatible with the Vercel/Node preset, so on Vercel we let
  // TanStack Start use its default Node-compatible server entry.
  tanstackStart: isVercel ? {} : { server: { entry: "server" } },

  // Force-enable nitro outside the Lovable sandbox and pin the preset to Vercel
  // so `vite build` emits the Vercel Build Output API (.vercel/output) — which is
  // what Vercel needs to route SSR/API requests and avoid the global 404.
  ...(isVercel ? { nitro: { preset: "vercel" } } : {}),
});
