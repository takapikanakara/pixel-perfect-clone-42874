import { createFileRoute } from "@tanstack/react-router";

const TIKTOK_PIXEL_ID = "D8U396RC77U9VN47P3OG";
const TIKTOK_API = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Body = {
  event: string;
  event_id: string;
  event_time: number;
  url?: string;
  user_agent?: string;
  ttclid?: string;
  ttp?: string;
  user?: { email?: string; phone?: string };
  contents?: Array<{
    content_id: string;
    content_name?: string;
    content_type?: string;
    quantity?: number;
    price?: number;
  }>;
  value?: number;
  currency?: string;
};

export const Route = createFileRoute("/api/public/tiktok-capi")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
        if (!accessToken) {
          return new Response(JSON.stringify({ ok: false, error: "missing_token" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("bad json", { status: 400 });
        }

        const fwd = request.headers.get("x-forwarded-for") ?? "";
        const ip = fwd.split(",")[0]?.trim() || undefined;
        const ua = body.user_agent || request.headers.get("user-agent") || undefined;

        const user: Record<string, string> = {};
        if (body.user?.email) user.email = await sha256Hex(body.user.email);
        if (body.user?.phone) user.phone = await sha256Hex(body.user.phone);
        if (ip) user.ip = ip;
        if (ua) user.user_agent = ua;
        if (body.ttclid) user.ttclid = body.ttclid;
        if (body.ttp) user.ttp = body.ttp;

        const properties: Record<string, unknown> = {};
        if (body.contents) properties.contents = body.contents;
        if (typeof body.value === "number") properties.value = body.value;
        if (body.currency) properties.currency = body.currency;

        const payload = {
          event_source: "web",
          event_source_id: TIKTOK_PIXEL_ID,
          data: [
            {
              event: body.event,
              event_time: body.event_time || Math.floor(Date.now() / 1000),
              event_id: body.event_id,
              user,
              properties,
              page: body.url ? { url: body.url } : undefined,
            },
          ],
        };

        try {
          const res = await fetch(TIKTOK_API, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Token": accessToken,
            },
            body: JSON.stringify(payload),
          });
          const text = await res.text();
          return new Response(JSON.stringify({ ok: res.ok, status: res.status, body: text }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
