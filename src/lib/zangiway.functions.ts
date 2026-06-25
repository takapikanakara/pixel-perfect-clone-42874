import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const ZANGIWAY_BASE = "https://api.zangiway.com";

type Method = "mbway" | "multibanco";

type Payer = {
  email: string;
  name: string;
  document: string;
  phone: string;
};

type CreateInput = {
  amount: number;
  method: Method;
  payer: Payer;
  paymentDescription?: string;
};

export type ReferenceData = {
  entity?: string;
  reference?: string;
  expiresAt?: string;
};

export type CreatedTransaction = {
  transactionID: string;
  id: string;
  amount: number;
  method: Method;
  referenceData?: ReferenceData;
  generatedMBWay?: boolean;
  createdAt?: number;
};

function requireEnv() {
  const client_id = process.env.ZANGIWAY_CLIENT_ID;
  const client_secret = process.env.ZANGIWAY_CLIENT_SECRET;
  const account_email = process.env.ZANGIWAY_ACCOUNT_EMAIL;
  if (!client_id || !client_secret || !account_email) {
    throw new Error(
      "ZangiWay não configurado. Defina ZANGIWAY_CLIENT_ID, ZANGIWAY_CLIENT_SECRET e ZANGIWAY_ACCOUNT_EMAIL.",
    );
  }
  return { client_id, client_secret, account_email };
}

function originFromRequest(): string {
  try {
    const req = getRequest();
    const url = new URL(req.url);
    const fwdHost = req.headers.get("x-forwarded-host");
    const fwdProto = req.headers.get("x-forwarded-proto");
    const host = fwdHost ?? url.host;
    const proto = fwdProto ?? url.protocol.replace(":", "");
    return `${proto}://${host}`;
  } catch {
    return "";
  }
}

export const createZangiwayTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: CreateInput) => {
    if (!data || typeof data !== "object") throw new Error("Invalid input");
    if (typeof data.amount !== "number" || data.amount <= 0) throw new Error("Invalid amount");
    if (data.method !== "mbway" && data.method !== "multibanco") throw new Error("Invalid method");
    const p = data.payer;
    if (!p?.email || !p.name || !p.document || !p.phone) throw new Error("Invalid payer");
    return data;
  })
  .handler(async ({ data }): Promise<CreatedTransaction> => {
    const env = requireEnv();
    const origin = originFromRequest();
    const body = {
      client_id: env.client_id,
      client_secret: env.client_secret,
      account_email: env.account_email,
      amount: Number(data.amount.toFixed(2)),
      method: data.method,
      payer: data.payer,
      paymentDescription: (data.paymentDescription ?? "Encomenda Shark").slice(0, 50),
      currency: "EUR",
      ...(origin
        ? {
            callbackUrl: `${origin}/api/public/zangiway-webhook`,
            success_url: `${origin}/checkout/sucesso`,
            failed_url: `${origin}/checkout/erro`,
          }
        : {}),
    };

    const res = await fetch(`${ZANGIWAY_BASE}/transactions/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch {}
    if (!res.ok) {
      console.error("[ZangiWay] create failed", res.status, text);
      throw new Error(json?.message || `ZangiWay erro ${res.status}`);
    }
    return {
      transactionID: json.transactionID ?? json.id,
      id: json.id ?? json.transactionID,
      amount: json.amount ?? json.value,
      method: json.method,
      referenceData: json.referenceData,
      generatedMBWay: json.generatedMBWay,
      createdAt: json.createdAt,
    };
  });

export type TransactionInfo = {
  id: string;
  status: "PENDING" | "COMPLETED" | "DECLINED" | string;
  amount: number;
  method: string;
  referenceData?: ReferenceData;
  updatedAt?: number;
  createdAt?: number;
};

export const getZangiwayTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("Missing id");
    return data;
  })
  .handler(async ({ data }): Promise<TransactionInfo> => {
    requireEnv();
    const res = await fetch(`${ZANGIWAY_BASE}/transactions/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: data.id }),
    });
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch {}
    if (!res.ok) {
      console.error("[ZangiWay] info failed", res.status, text);
      throw new Error(json?.message || `ZangiWay erro ${res.status}`);
    }
    return json as TransactionInfo;
  });
