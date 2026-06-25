import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

export function CrossLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="relative h-4 w-12">
        <span className="cross-dot cross-dot-pink absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fe476c] mix-blend-multiply" />
        <span className="cross-dot cross-dot-blue absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#24CAF3] mix-blend-multiply" />
      </div>
      <style>{`
        @keyframes cross-move-right { 0%,100% { transform: translate(-150%,-50%) } 50% { transform: translate(50%,-50%) } }
        @keyframes cross-move-left { 0%,100% { transform: translate(50%,-50%) } 50% { transform: translate(-150%,-50%) } }
        .cross-dot-pink { animation: cross-move-right 2s ease-in-out infinite; }
        .cross-dot-blue { animation: cross-move-left 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export function WithEntryLoader({ children, ms = 2000 }: { children: ReactNode; ms?: number }) {
  const [entering, setEntering] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => setEntering(false), ms);
    return () => clearTimeout(id);
  }, [ms]);

  const navigateWithLoader = useCallback(
    (to: string) => {
      setLeaving(true);
      setTimeout(() => navigate({ to }), ms);
    },
    [navigate, ms],
  );

  return (
    <ExitLoaderContext.Provider value={navigateWithLoader}>
      {children}
      {(entering || leaving) && <CrossLoader />}
    </ExitLoaderContext.Provider>
  );
}

import { createContext, useContext } from "react";
const ExitLoaderContext = createContext<((to: string) => void) | null>(null);
export function useNavigateWithLoader() {
  const fn = useContext(ExitLoaderContext);
  const navigate = useNavigate();
  return fn ?? ((to: string) => navigate({ to }));
}
