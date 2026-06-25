import { createFileRoute } from "@tanstack/react-router";

// ZangiWay webhook receiver. Quando o pagamento (MB WAY ou Multibanco) é
// confirmado, reencaminha para a UTMify como "paid".
export const Route = createFileRoute("/api/public/zangiway-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: any = {};
        try {
          body = await request.json();
        } catch (err) {
          console.error("[ZangiWay webhook] invalid body", err);
          return new Response("Bad Request", { status: 400 });
        }
        console.log("[ZangiWay webhook]", JSON.stringify(body).slice(0, 1000));

        const status = String(
          body?.status ?? body?.transaction?.status ?? body?.data?.status ?? "",
        ).toUpperCase();

        if (status === "COMPLETED" || status === "PAID" || status === "APPROVED") {
          try {
            const { forwardToUtmify } = await import("@/lib/utmify.server");
            await forwardToUtmify(body, "paid");
          } catch (e) {
            console.error("[UTMify] paid forward failed", e);
          }
        } else if (status === "DECLINED" || status === "REFUSED" || status === "FAILED") {
          try {
            const { forwardToUtmify } = await import("@/lib/utmify.server");
            await forwardToUtmify(body, "refused");
          } catch (e) {
            console.error("[UTMify] refused forward failed", e);
          }
        } else if (status === "REFUNDED") {
          try {
            const { forwardToUtmify } = await import("@/lib/utmify.server");
            await forwardToUtmify(body, "refunded");
          } catch (e) {
            console.error("[UTMify] refunded forward failed", e);
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
