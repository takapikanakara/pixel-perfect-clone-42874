import { useEffect, useState, type ReactNode } from "react";

export function CrossLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="relative h-10 w-24">
        <span className="cross-dot cross-dot-pink absolute left-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#ff4d63] mix-blend-multiply" />
        <span className="cross-dot cross-dot-blue absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#3b82f6] mix-blend-multiply" />
      </div>
      <style>{`
        @keyframes cross-move-right { 0%,100% { transform: translate(0,-50%) } 50% { transform: translate(56px,-50%) } }
        @keyframes cross-move-left { 0%,100% { transform: translate(0,-50%) } 50% { transform: translate(-56px,-50%) } }
        .cross-dot-pink { animation: cross-move-right 2s ease-in-out infinite; }
        .cross-dot-blue { animation: cross-move-left 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export function WithEntryLoader({ children, ms = 2000 }: { children: ReactNode; ms?: number }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return (
    <>
      {children}
      {loading && <CrossLoader />}
    </>
  );
}
