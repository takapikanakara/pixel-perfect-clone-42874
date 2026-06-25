import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "src",
  "sck",
  "xcod",
  "gclid",
  "fbclid",
  "ttclid",
] as const;

const STORAGE_KEY = "lovable_utm_params_v1";

function readStored(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStored(params: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    /* ignore */
  }
}

/**
 * Persist UTM / click-id parameters across the whole session.
 *
 * - On first arrival, captures utm_* (and friends) from the URL into sessionStorage.
 * - On every navigation, if the current URL is missing any of the stored
 *   parameters, re-appends them via history.replaceState (no extra navigation).
 *
 * This means the UTMs follow the user from product page → cart → checkout →
 * payment without changing any <Link to=...> call sites.
 */
export function UtmPersistor() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const stored = readStored();

    // 1. Capture any new UTM-like params present in the current URL.
    let captured = false;
    for (const key of UTM_KEYS) {
      const v = url.searchParams.get(key);
      if (v) {
        stored[key] = v;
        captured = true;
      }
    }
    if (captured) writeStored(stored);

    // 2. Re-append any stored params missing from the current URL.
    let mutated = false;
    for (const [k, v] of Object.entries(stored)) {
      if (!url.searchParams.has(k)) {
        url.searchParams.set(k, v);
        mutated = true;
      }
    }
    if (mutated) {
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, [pathname]);

  return null;
}

/** Read the persisted UTM params (e.g. to forward into server fns). */
export function getStoredUtmParams(): Record<string, string> {
  return readStored();
}
