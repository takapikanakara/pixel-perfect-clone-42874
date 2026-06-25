import { useEffect, useState } from "react";
import { PRODUCTS, getProduct, type Product } from "./products";

const KEY = "cart_items_v2";
const LEGACY_KEY = "cart_qty_v1";

export type CartItems = Record<string, number>;

function read(): CartItems {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const out: CartItems = {};
        for (const [k, v] of Object.entries(parsed)) {
          const n = Math.max(0, Math.floor(Number(v) || 0));
          if (n > 0 && getProduct(k)) out[k] = n;
        }
        return out;
      }
    }
    // legacy migration: old single-qty cart was the Shark vacuum
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const n = Math.max(0, parseInt(legacy, 10) || 0);
      window.localStorage.removeItem(LEGACY_KEY);
      if (n > 0) {
        const migrated = { shark: n };
        window.localStorage.setItem(KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

function write(items: CartItems) {
  if (typeof window === "undefined") return;
  const clean: CartItems = {};
  for (const [k, v] of Object.entries(items)) {
    const n = Math.max(0, Math.floor(Number(v) || 0));
    if (n > 0) clean[k] = n;
  }
  window.localStorage.setItem(KEY, JSON.stringify(clean));
  window.dispatchEvent(new Event("cart:update"));
}

export type CartLine = { product: Product; qty: number };

export function useCart() {
  const [items, setItems] = useState<CartItems>({});

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener("cart:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const totalQty = Object.values(items).reduce((a, b) => a + b, 0);
  const lines: CartLine[] = Object.entries(items)
    .map(([id, qty]) => {
      const product = getProduct(id);
      return product ? { product, qty } : null;
    })
    .filter((x): x is CartLine => x !== null);
  const subtotal = lines.reduce((acc, l) => acc + l.product.price * l.qty, 0);

  return {
    items,
    lines,
    totalQty,
    qty: totalQty, // backward compat
    subtotal,
    add: (productId: string, n = 1) => {
      const current = read();
      const next = { ...current, [productId]: (current[productId] || 0) + n };
      write(next);
      const product = getProduct(productId);
      if (product) {
        // Lazy import to avoid SSR cycle
        import("./tracking").then(({ track }) => {
          track("AddToCart", {
            contents: [
              {
                content_id: product.id,
                content_name: product.shortName,
                content_type: "product",
                quantity: n,
                price: product.price,
              },
            ],
            value: product.price * n,
            currency: "EUR",
          });
        });
      }
    },
    set: (productId: string, n: number) => {
      const current = read();
      const next = { ...current, [productId]: n };
      if (n <= 0) delete next[productId];
      write(next);
    },
    remove: (productId?: string) => {
      if (productId === undefined) {
        write({});
        return;
      }
      const current = read();
      delete current[productId];
      write(current);
    },
    clear: () => write({}),
    has: (productId: string) => (read()[productId] || 0) > 0,
  };
}

export { PRODUCTS };
