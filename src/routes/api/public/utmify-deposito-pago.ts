import { createFileRoute } from "@tanstack/react-router";

// Webhook "Depósito Pago" — gateway notifica que o depósito foi pago.
// Reencaminhamos para a UTMify como status "paid".
export const Route = createFileRoute("/api/public/utmify-deposito-pago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return new Response("Bad Request", { status: 400 });
        }
        console.log("[Webhook Depósito Pago]", JSON.stringify(body).slice(0, 1000));
        const { forwardToUtmify } = await import("@/lib/utmify.server");
        const result = await forwardToUtmify(body, "paid");
        return Response.json({ received: true, utmify: result });
      },
      GET: async () => Response.json({ ok: true, endpoint: "deposito-pago" }),
    },
  },
});
