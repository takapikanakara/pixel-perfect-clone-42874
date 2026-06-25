// Webhook "Depósito Pago" — reencaminha para a UTMify como paid.
// Dispara quando o cliente paga o Multibanco ou MB WAY.
// URL pública: https://bkztqodvqqfkcwyjkhnl.supabase.co/functions/v1/utmify-deposito-pago
import { forwardToUtmify } from "../_shared/utmify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method === "GET") {
    return Response.json({ ok: true, endpoint: "deposito-pago" }, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400, headers: corsHeaders });
  }
  console.log("[Webhook Depósito Pago]", JSON.stringify(body).slice(0, 1000));

  // Aceita um status explícito no payload; por defeito = paid.
  const status = String(body?.status ?? body?.transaction?.status ?? "").toUpperCase();
  let utmStatus: "paid" | "refused" | "refunded" = "paid";
  if (status === "DECLINED" || status === "REFUSED" || status === "FAILED") utmStatus = "refused";
  else if (status === "REFUNDED") utmStatus = "refunded";

  const result = await forwardToUtmify(body, utmStatus);
  return Response.json({ received: true, utmify: result }, { headers: corsHeaders });
});
