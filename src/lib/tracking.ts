// Client-side TikTok Pixel + CAPI dispatch with shared event_id for deduplication.
// Pixel ID: D8U396RC77U9VN47P3OG (same pixel for UTMify and TikTok direct).

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: any, options?: { event_id?: string }) => void;
      page: () => void;
      identify?: (params: any) => void;
    };
    TiktokAnalyticsObject?: string;
    tikTokPixelId?: string;
  }
}

export type TikTokEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "PlaceAnOrder"
  | "CompletePayment";

export type TrackContent = {
  content_id: string;
  content_name?: string;
  content_type?: "product";
  quantity?: number;
  price?: number;
};

export type TrackUser = {
  email?: string;
  phone?: string; // E.164 ideally
};

function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function pageUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

async function sendCapi(payload: {
  event: TikTokEventName;
  event_id: string;
  event_time: number;
  url: string;
  user_agent: string;
  ttclid?: string;
  ttp?: string;
  user?: TrackUser;
  contents?: TrackContent[];
  value?: number;
  currency?: string;
}) {
  try {
    await fetch("/api/public/tiktok-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* swallow — pixel already fired */
  }
}

export function track(
  event: TikTokEventName,
  opts: {
    contents?: TrackContent[];
    value?: number;
    currency?: string;
    user?: TrackUser;
  } = {},
) {
  if (typeof window === "undefined") return;

  const event_id = newEventId();
  const event_time = Math.floor(Date.now() / 1000);
  const currency = opts.currency ?? "EUR";

  const pixelParams: any = {};
  if (opts.contents) pixelParams.contents = opts.contents;
  if (typeof opts.value === "number") pixelParams.value = opts.value;
  if (opts.contents || typeof opts.value === "number") pixelParams.currency = currency;

  // Identify user (hashed automatically by ttq when provided as raw)
  try {
    if (opts.user && window.ttq?.identify) {
      const id: any = {};
      if (opts.user.email) id.email = opts.user.email.trim().toLowerCase();
      if (opts.user.phone) id.phone_number = opts.user.phone;
      window.ttq.identify(id);
    }
  } catch {
    /* ignore */
  }

  try {
    window.ttq?.track(event, pixelParams, { event_id });
  } catch {
    /* ignore */
  }

  void sendCapi({
    event,
    event_id,
    event_time,
    url: pageUrl(),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    ttclid: getCookie("ttclid"),
    ttp: getCookie("_ttp"),
    user: opts.user,
    contents: opts.contents,
    value: opts.value,
    currency: opts.contents || typeof opts.value === "number" ? currency : undefined,
  });
}
