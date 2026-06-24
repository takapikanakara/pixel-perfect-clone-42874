import { useEffect, useState } from "react";

const KEY = "cart_qty_v1";

function read(): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(KEY);
  return v ? Math.max(0, parseInt(v, 10) || 0) : 0;
}

function write(n: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, String(Math.max(0, n)));
  window.dispatchEvent(new Event("cart:update"));
}

export function useCart() {
  const [qty, setQty] = useState<number>(0);

  useEffect(() => {
    const sync = () => setQty(read());
    sync();
    window.addEventListener("cart:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    qty,
    add: (n = 1) => write(read() + n),
    set: (n: number) => write(n),
    remove: () => write(0),
  };
}
