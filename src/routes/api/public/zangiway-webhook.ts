import { createFileRoute } from "@tanstack/react-router";

// ZangiWay webhook receiver. We currently just log the payload — the user
// can extend this later (e.g. persist orders, send confirmation emails).
export const Route = createFileRoute("/api/public/zangiway-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          console.log("[ZangiWay webhook]", JSON.stringify(body));
        } catch (err) {
          console.error("[ZangiWay webhook] invalid body", err);
          return new Response("Bad Request", { status: 400 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
