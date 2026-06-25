import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Check, Loader2, ShieldCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getZangiwayTransaction, type TransactionInfo } from "@/lib/zangiway.functions";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/pagamento/$id")({
  head: () => ({
    meta: [
      { title: "Pagamento" },
      { name: "description", content: "Conclua o pagamento da sua encomenda." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const getInfo = useServerFn(getZangiwayTransaction);
  const { remove } = useCart();

  const [info, setInfo] = useState<TransactionInfo | null>(null);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      try {
        const data = await getInfo({ data: { id } });
        if (stop) return;
        setInfo(data);
        setError("");
        if (data.status === "COMPLETED") {
          remove();
          return; // stop polling
        }
      } catch (e: any) {
        if (!stop) setError(e?.message ?? "Erro ao obter estado do pagamento");
      }
      if (!stop) timer = setTimeout(tick, 4000);
    }
    tick();
    return () => { stop = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copy = (label: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const status = info?.status ?? "PENDING";
  const isMultibanco = info?.method === "multibanco" || !!info?.referenceData?.reference;
  const ref = info?.referenceData;
  const fmt = (n?: number) => (n ?? 0).toFixed(2).replace(".", ",");

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-white">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-3">
          <button onClick={() => navigate({ to: "/shark-aspirador-de-maos" })} aria-label="Voltar" className="p-1.5">
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <div className="flex-1 text-center text-[17px] font-bold text-gray-900">Pagamento</div>
          <div className="w-8" />
        </header>

        {status === "COMPLETED" ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={32} strokeWidth={3} />
            </div>
            <h1 className="mt-4 text-[20px] font-bold text-gray-900">Pagamento confirmado</h1>
            <p className="mt-2 text-[14px] text-gray-600">Recebemos o seu pagamento. A sua encomenda já está em processamento.</p>
            <button
              onClick={() => navigate({ to: "/shark-aspirador-de-maos" })}
              className="mt-6 rounded-full bg-[#ff4d63] px-6 py-3 text-[15px] font-bold text-white"
            >
              Voltar à loja
            </button>
          </div>
        ) : status === "DECLINED" ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <h1 className="text-[20px] font-bold text-[#ff4d63]">Pagamento recusado</h1>
            <p className="mt-2 text-[14px] text-gray-600">Tente novamente ou escolha outro método de pagamento.</p>
            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="mt-6 rounded-full bg-[#ff4d63] px-6 py-3 text-[15px] font-bold text-white"
            >
              Voltar ao checkout
            </button>
          </div>
        ) : (
          <div className="flex-1 px-4 py-6">
            <div className="flex items-center justify-center gap-2 text-emerald-700">
              <ShieldCheck size={16} />
              <span className="text-[13px]">Aguardando pagamento — pode fechar esta página.</span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#fff5f6] px-4 py-3">
              <span className="text-[14px] text-gray-700">Total a pagar</span>
              <span className="text-[20px] font-extrabold text-[#ff4d63]">€ {fmt(info?.amount)}</span>
            </div>

            {isMultibanco ? (
              <div className="mt-5 rounded-xl border border-gray-200 p-4">
                <h2 className="text-[16px] font-bold text-gray-900">Referência Multibanco</h2>
                <p className="mt-1 text-[13px] text-gray-500">Pague no homebanking ou numa caixa multibanco.</p>
                <div className="mt-4 space-y-3">
                  <Row label="Entidade" value={ref?.entity ?? "—"} onCopy={ref?.entity ? () => copy("entidade", ref!.entity!) : undefined} copied={copied === "entidade"} />
                  <Row label="Referência" value={ref?.reference ?? "—"} onCopy={ref?.reference ? () => copy("referencia", ref!.reference!.replace(/\s/g, "")) : undefined} copied={copied === "referencia"} />
                  <Row label="Valor" value={`€ ${fmt(info?.amount)}`} onCopy={info?.amount ? () => copy("valor", String(info!.amount)) : undefined} copied={copied === "valor"} />
                  {ref?.expiresAt && (
                    <Row label="Válido até" value={ref.expiresAt} />
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-gray-200 p-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f2] text-[#ff4d63]">
                  <Loader2 size={22} className="animate-spin" />
                </div>
                <h2 className="mt-3 text-[16px] font-bold text-gray-900">Abra a app MB WAY</h2>
                <p className="mt-1 text-[13px] text-gray-500">
                  Enviámos um pedido de pagamento para o seu telemóvel. Confirme na app para concluir.
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              A verificar o estado do pagamento…
            </div>
            {error && <p className="mt-2 text-center text-[12px] text-[#ff4d63]">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, onCopy, copied }: { label: string; value: string; onCopy?: () => void; copied?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
      <div>
        <div className="text-[12px] text-gray-500">{label}</div>
        <div className="text-[16px] font-bold tracking-wide text-gray-900">{value}</div>
      </div>
      {onCopy && (
        <button onClick={onCopy} className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[12px] text-gray-700">
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      )}
    </div>
  );
}
