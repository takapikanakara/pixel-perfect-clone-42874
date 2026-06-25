import { createFileRoute } from "@tanstack/react-router";

// Webhook "Depósito Gerado" — gateway notifica que o depósito foi criado/pendente.
// Reencaminhamos para a UTMify como status "waiting_payment".
export const Route = createFileRoute("/api/public/utmify-deposito-gerado")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return new Response("Bad Request", { status: 400 });
        }
        console.log("[Webhook Depósito Gerado]", JSON.stringify(body).slice(0, 1000));
        const { forwardToUtmify } = await import("@/lib/utmify.server");
        const result = await forwardToUtmify(body, "waiting_payment");
        return Response.json({ received: true, utmify: result });
      },
      GET: async () => Response.json({ ok: true, endpoint: "deposito-gerado" }),
    },
  },
});
