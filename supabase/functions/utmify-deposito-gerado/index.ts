// Webhook "Depósito Gerado" — reencaminha para a UTMify como waiting_payment.
// URL pública: https://bkztqodvqqfkcwyjkhnl.supabase.co/functions/v1/utmify-deposito-gerado
import { forwardToUtmify } from "../_shared/utmify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method === "GET") {
    return Response.json({ ok: true, endpoint: "deposito-gerado" }, { headers: corsHeaders });
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
  console.log("[Webhook Depósito Gerado]", JSON.stringify(body).slice(0, 1000));

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("cf-connecting-ip");
  const result = await forwardToUtmify(body, "waiting_payment", ip);
  return Response.json({ received: true, utmify: result }, { headers: corsHeaders });
});
