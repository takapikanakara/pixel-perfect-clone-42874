import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

export function CrossLoader() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-transparent">
      <div className="relative h-6 w-12">
        <span className="cross-dot cross-dot-pink absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fe476c] mix-blend-multiply" />
        <span className="cross-dot cross-dot-blue absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#24CAF3] mix-blend-multiply" />
      </div>
      <style>{`
        @keyframes cross-move-right { 0%,100% { transform: translate(-90%,-50%) } 50% { transform: translate(-10%,-50%) } }
        @keyframes cross-move-left { 0%,100% { transform: translate(-10%,-50%) } 50% { transform: translate(-90%,-50%) } }
        .cross-dot-pink { animation: cross-move-right 2s ease-in-out infinite; }
        .cross-dot-blue { animation: cross-move-left 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// Global loader store — visible from anywhere without a provider
let visible = false;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
export const loaderStore = {
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  get() { return visible; },
  show() { visible = true; emit(); },
  hide() { visible = false; emit(); },
};

export function LoaderHost() {
  const v = useSyncExternalStore(loaderStore.subscribe, loaderStore.get, () => false);
  return v ? <CrossLoader /> : null;
}

const LOADER_MS = 2000;

export function useNavigateWithLoader() {
  const navigate = useNavigate();
  return (to: string) => {
    loaderStore.show();
    setTimeout(() => {
      loaderStore.hide();
      navigate({ to });
    }, LOADER_MS);
  };
}

// Kept for backwards compatibility with existing route wrappers — now a no-op
// passthrough that still shows an entry loader briefly when the route mounts
// directly (e.g. on hard refresh of /cart or /checkout).
export function WithEntryLoader({ children, ms = LOADER_MS }: { children: ReactNode; ms?: number }) {
  const [entering, setEntering] = useState(() => !loaderStore.get());
  useEffect(() => {
    if (!entering) return;
    loaderStore.show();
    const id = setTimeout(() => {
      loaderStore.hide();
      setEntering(false);
    }, ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}
