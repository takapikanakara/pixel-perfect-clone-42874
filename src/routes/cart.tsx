import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Truck, Trash2, Minus, Plus, ShieldCheck, Check } from "lucide-react";
import sharkVacuum from "@/assets/shark-vacuum.png.asset.json";
import { useCart } from "@/lib/cart";
import { useNavigateWithLoader } from "@/components/CrossLoader";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Carrinho" },
      { name: "description", content: "O seu carrinho de compras." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const navLoader = useNavigateWithLoader();
  const { qty, set, remove } = useCart();
  const unit = 97.9;
  const total = unit * qty;
  const fmt = (n: number) => n.toFixed(2).replace(".", ",");

  const empty = qty <= 0;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-white pb-28">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-2 bg-white px-3 py-3">
          <button onClick={() => navLoader("/shark-aspirador-de-maos")} aria-label="Voltar" className="p-1.5">
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <div className="flex-1 text-center text-[17px] font-bold text-gray-900">
            Carrinho ({qty})
          </div>
          <div className="w-8" />
        </header>

        {/* Striped divider */}
        <div
          className="h-2 w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #ef4444 0 14px, #ffffff 14px 18px, #60a5fa 18px 32px, #ffffff 32px 36px)",
          }}
        />

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
            <div className="text-[16px] font-semibold text-gray-900">O seu carrinho está vazio</div>
            <button
              onClick={() => navLoader("/shark-aspirador-de-maos")}
              className="mt-5 rounded-full bg-[#ff4d63] px-6 py-2.5 text-[14px] font-semibold text-white"
            >
              Continuar a comprar
            </button>
          </div>
        ) : (
          <>
            {/* Loja */}
            <div className="px-4 pt-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4d63] text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="text-[16px] font-bold text-gray-900">Loja ({qty})</span>
              </div>
            </div>

            {/* Free shipping banner */}
            <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-[#e6f5ec] px-3 py-2.5">
              <Truck size={20} className="text-emerald-700" strokeWidth={2} />
              <span className="text-[13.5px] text-gray-800">
                Parabéns! Portes grátis para todo Portugal!
              </span>
            </div>

            {/* Product row */}
            <div className="mt-4 flex gap-3 px-4 pb-5">
              <div className="flex shrink-0 items-start pt-10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4d63] text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
              </div>
              <div className="flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-lg bg-white">
                <img src={sharkVacuum.url} alt="Shark" className="h-[90%] w-[90%] object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] leading-snug text-gray-900">
                  Shark Aspirador de Mão sem Fios, Leve e Portátil, com 600 g
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[13px] font-bold text-[#ff4d63]">€</span>
                  <span className="text-[20px] font-extrabold text-[#ff4d63]">{fmt(total)}</span>
                </div>
                <div className="text-[12.5px] text-gray-400 line-through">€ {fmt(355 * qty)}</div>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-[#ff4d63]">-72%</span>
                    <button onClick={() => remove()} aria-label="Remover">
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 rounded-md bg-gray-100 px-3 py-1.5">
                    <button onClick={() => set(Math.max(1, qty - 1))} aria-label="Diminuir">
                      <Minus size={16} className="text-gray-700" />
                    </button>
                    <span className="w-4 text-center text-[14px] font-semibold">{qty}</span>
                    <button onClick={() => set(qty + 1)} aria-label="Aumentar">
                      <Plus size={16} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Protecção do cliente */}
            <div className="px-3 pb-5">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#a06b1a]" />
                  <span className="text-[15px] font-bold text-gray-900">Protecção do cliente</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-[14px] text-gray-700">
                  {[
                    "Devolução gratuita",
                    "Reembolso automático por danos",
                    "Pagamento seguro",
                    "Cupão por atraso na recolha",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-gray-400" strokeWidth={2.4} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Você pode gostar */}
            <div className="border-t-[6px] border-gray-100 px-4 pt-5">
              <h2 className="text-[17px] font-bold text-gray-900">Você pode gostar</h2>
              <p className="text-[13px] text-gray-400">Recomendações para você</p>
              <div className="mt-3 grid grid-cols-2 gap-3 pb-6">
                {["Aspirador Shark Pro", "Robô Aspirador"].map((n) => (
                  <div key={n} className="overflow-hidden rounded-xl bg-white">
                    <div className="flex aspect-square items-center justify-center bg-gray-50">
                      <img src={sharkVacuum.url} alt={n} className="h-[78%] w-[78%] object-contain" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom action bar */}
      {!empty && (
        <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3">
          <div>
            <div className="text-[12px] text-gray-500">Total ({qty} item{qty > 1 ? "s" : ""}):</div>
            <div className="text-[18px] font-extrabold text-[#ff4d63]">€ {fmt(total)}</div>
          </div>
          <button
            onClick={() => navLoader("/checkout")}
            className="flex-1 rounded-full bg-[#ff4d63] px-6 py-3.5 text-center text-[15px] font-bold text-white"
          >
            Finalizar compra ({qty})
          </button>
        </div>
      )}
    </div>
  );
}
