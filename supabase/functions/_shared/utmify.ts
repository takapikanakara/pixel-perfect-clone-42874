// Shared helper to forward gateway webhook payloads to UTMify Orders API.
// Used by both edge functions (deposito-gerado and deposito-pago).
// Deno runtime — no Node imports.

export type UtmifyStatus =
  | "waiting_payment"
  | "paid"
  | "refused"
  | "refunded"
  | "chargedback";

type AnyRecord = Record<string, any>;

function pick<T = any>(obj: AnyRecord | undefined | null, ...keys: string[]): T | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = k.split(".").reduce<any>((acc, part) => (acc == null ? acc : acc[part]), obj);
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

function toUtcStamp(input: any): string {
  const d = input ? new Date(typeof input === "number" ? input : String(input)) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 19).replace("T", " ");
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function toCents(value: any): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function mapPaymentMethod(value: any): "pix" | "credit_card" | "billet" | "free_price" {
  const v = String(value ?? "").toLowerCase();
  if (v.includes("pix")) return "pix";
  if (v.includes("card") || v.includes("cart") || v.includes("credit")) return "credit_card";
  if (v.includes("boleto") || v.includes("billet") || v.includes("multibanco")) return "billet";
  return "pix";
}

export async function forwardToUtmify(
  rawBody: AnyRecord,
  status: UtmifyStatus,
): Promise<{ ok: boolean; status: number; body: string }> {
  const token = Deno.env.get("UTMIFY_API_TOKEN");
  if (!token) {
    return { ok: false, status: 500, body: "UTMIFY_API_TOKEN not set" };
  }

  const customer = pick<AnyRecord>(rawBody, "customer", "payer", "client", "transaction.payer", "data.customer") ?? {};
  const amountUnit = pick<number>(
    rawBody,
    "amount",
    "value",
    "total",
    "transaction.amount",
    "data.amount",
    "deposit.amount",
  );
  const totalInCents = toCents(amountUnit);

  const orderId = String(
    pick(rawBody, "id", "transactionID", "transaction_id", "transaction.id", "data.id") ??
      `unknown-${Date.now()}`,
  );

  const createdAt = toUtcStamp(
    pick(rawBody, "createdAt", "created_at", "transaction.createdAt", "data.createdAt"),
  );
  const approvedDate =
    status === "paid"
      ? toUtcStamp(
          pick(rawBody, "paidAt", "approvedAt", "updatedAt", "transaction.updatedAt") ?? Date.now(),
        )
      : null;
  const refundedAt = status === "refunded" ? toUtcStamp(pick(rawBody, "refundedAt")) : null;

  const paymentMethod = mapPaymentMethod(
    pick(rawBody, "method", "paymentMethod", "transaction.method", "data.method"),
  );

  const tracking = pick<AnyRecord>(rawBody, "trackingParameters", "tracking", "utm", "metadata.utm") ?? {};

  const products = [
    {
      id: orderId,
      name: String(
        pick(rawBody, "paymentDescription", "description", "transaction.paymentDescription") ??
          "Encomenda",
      ),
      planId: null,
      planName: null,
      quantity: 1,
      priceInCents: totalInCents,
    },
  ];

  const payload = {
    orderId,
    platform: "Lovable",
    paymentMethod,
    status,
    createdAt,
    approvedDate,
    refundedAt,
    customer: {
      name: pick<string>(customer, "name", "fullName") ?? "Cliente",
      email: pick<string>(customer, "email") ?? "no-reply@example.com",
      phone: pick<string>(customer, "phone", "phoneNumber") ?? null,
      document: pick<string>(customer, "document", "nif", "cpf", "vat") ?? null,
      country: pick<string>(customer, "country") ?? "PT",
      ip: pick<string>(rawBody, "ip", "clientIp", "transaction.ip") ?? null,
    },
    products,
    trackingParameters: {
      src: pick<string>(tracking, "src") ?? null,
      sck: pick<string>(tracking, "sck") ?? null,
      utm_source: pick<string>(tracking, "utm_source") ?? null,
      utm_campaign: pick<string>(tracking, "utm_campaign") ?? null,
      utm_medium: pick<string>(tracking, "utm_medium") ?? null,
      utm_content: pick<string>(tracking, "utm_content") ?? null,
      utm_term: pick<string>(tracking, "utm_term") ?? null,
    },
    commission: {
      totalPriceInCents: totalInCents,
      gatewayFeeInCents: 0,
      userCommissionInCents: totalInCents,
      currency: pick<string>(rawBody, "currency", "transaction.currency") ?? "EUR",
    },
    isTest: false,
  };

  const res = await fetch("https://api.utmify.com.br/api-credentials/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": token,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("[UTMify] forward failed", res.status, text.slice(0, 500));
  } else {
    console.log("[UTMify] forwarded", status, "orderId=", orderId);
  }
  return { ok: res.ok, status: res.status, body: text };
}
