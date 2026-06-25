import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Lock,
  MapPin,
  RotateCw,
  Zap,
  Ticket,
  ShoppingBag,
  Truck,
  DollarSign,
  ChevronUp,
  Smile,
  Minus,
  Plus,
} from "lucide-react";
import sharkVacuum from "@/assets/shark-vacuum.png.asset.json";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Resumo da encomenda" },
      { name: "description", content: "Finalize a sua encomenda Shark com segurança." },
    ],
  }),
  component: CheckoutPage,
});

type Shipping = "gratis" | "expressa";
type Payment = "mbway" | "multibanco";

function Field({
  placeholder,
  value,
  onChange,
  inputMode,
  maxLength,
  type,
}: {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  inputMode?: "text" | "numeric" | "tel" | "email";
  maxLength?: number;
  type?: string;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      type={type}
      inputMode={inputMode}
      maxLength={maxLength}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-gray-50/60 px-4 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
    />
  );
}

function formatPhonePT(v: string) {
  const d = v.replace(/\D/g, "").replace(/^351/, "").slice(0, 9);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  let rest = "";
  if (p2) rest += " " + p2;
  if (p3) rest += " " + p3;
  return "+351 " + (p1 + rest).trim();
}

function formatCP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 7);
  if (d.length <= 4) return d;
  return d.slice(0, 4) + "-" + d.slice(4);
}

function onlyDigits(v: string, max = 20) {
  return v.replace(/\D/g, "").slice(0, max);
}

function titleCase(v: string) {
  return v
    .toLocaleLowerCase("pt-PT")
    .replace(/(^|[\s'-])\p{L}/gu, (m) => m.toLocaleUpperCase("pt-PT"));
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { qty: cartQty, set: setCartQty } = useCart();
  const qty = Math.max(1, cartQty);
  const setQty = (n: number) => setCartQty(Math.max(1, n));
  const [shipping, setShipping] = useState<Shipping>("gratis");
  const [payment, setPayment] = useState<Payment>("mbway");
  const [secondsLeft, setSecondsLeft] = useState(3 * 60 + 45);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cp, setCp] = useState("");
  const [distrito, setDistrito] = useState("");
  const [cidade, setCidade] = useState("");
  const [freguesia, setFreguesia] = useState("");
  const [morada, setMorada] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState("");
  const [mbwayPhone, setMbwayPhone] = useState("");

  useEffect(() => {
    const clean = cp.replace(/\D/g, "");
    if (clean.length !== 7) {
      setCpError("");
      return;
    }
    const cp4 = clean.slice(0, 4);
    const cp3 = clean.slice(4);
    const ctrl = new AbortController();
    setCpLoading(true);
    setCpError("");
    fetch(`https://json.geoapi.pt/cp/${cp4}-${cp3}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((data: any) => {
        if (data?.Distrito) setDistrito(data.Distrito);
        if (data?.Concelho) setCidade(data.Concelho);
        if (data?.Localidade) setFreguesia(data.Localidade);
        const rua = data?.partes?.[0]?.["Artéria"];
        if (rua) setMorada(rua);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setCpError("Código postal não encontrado");
      })
      .finally(() => setCpLoading(false));
    return () => ctrl.abort();
  }, [cp]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = Math.floor(secondsLeft / 3600);
  const mm = Math.floor((secondsLeft % 3600) / 60);
  const ss = secondsLeft % 60;
  const timer = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;

  const unit = 97.9;
  const subtotal = unit * qty;
  const shippingCost = shipping === "expressa" ? 8 : 0;
  const total = subtotal + shippingCost;
  const fmt = (n: number) => n.toFixed(2).replace(".", ",");

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-white pb-32">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-start gap-3 border-b border-gray-100 bg-white px-3 py-3">
          <button onClick={() => navigate({ to: "/" })} aria-label="Voltar" className="p-1.5">
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <div className="flex-1 text-center">
            <div className="text-[17px] font-bold text-gray-900">Resumo da encomenda</div>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[13px] text-emerald-700">
              <Lock size={13} strokeWidth={2} />
              Os seus dados estão seguros connosco
            </div>
          </div>
          <div className="w-8" />
        </header>

        {/* Morada de entrega */}
        <section className="px-4 pt-5 pb-5">
          <div className="flex items-center gap-2">
            <MapPin size={20} strokeWidth={2.2} className="text-gray-900" />
            <h2 className="text-[17px] font-bold text-gray-900">Morada de entrega</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Field placeholder="Nome completo" value={nome} onChange={(v) => setNome(titleCase(v))} />
            <Field placeholder="+351 912 345 678" value={telefone} onChange={(v) => setTelefone(formatPhonePT(v))} inputMode="tel" maxLength={17} />
            <Field placeholder="E-mail" value={email} onChange={(v) => setEmail(v.trim().toLowerCase())} inputMode="email" type="email" />
            <div>
              <Field placeholder="Código postal (1234-567)" value={cp} onChange={(v) => setCp(formatCP(v))} inputMode="numeric" maxLength={8} />
              {cpLoading && <p className="mt-1 px-1 text-[12px] text-gray-500">A procurar morada…</p>}
              {cpError && <p className="mt-1 px-1 text-[12px] text-[#ff4d63]">{cpError}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field placeholder="Distrito" value={distrito} onChange={(v) => setDistrito(titleCase(v))} />
              <Field placeholder="Cidade" value={cidade} onChange={(v) => setCidade(titleCase(v))} />
            </div>
            <Field placeholder="Freguesia" value={freguesia} onChange={(v) => setFreguesia(titleCase(v))} />
            <Field placeholder="Morada (rua, avenida...)" value={morada} onChange={(v) => setMorada(titleCase(v))} />
            <div className="grid grid-cols-2 gap-3">
              <Field placeholder="Número" value={numero} onChange={(v) => setNumero(onlyDigits(v, 6))} inputMode="numeric" />
              <Field placeholder="Complemento" value={complemento} onChange={setComplemento} />
            </div>
          </div>
        </section>

        {/* Striped divider */}
        <div
          className="h-2 w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #ef4444 0 14px, #ffffff 14px 18px, #60a5fa 18px 32px, #ffffff 32px 36px)",
          }}
        />

        {/* Product line */}
        <section className="px-4 pt-4 pb-5">
          <div className="flex gap-3">
            <div className="flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
              <img src={sharkVacuum.url} alt="Shark" className="h-[88%] w-[88%] object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 text-[15px] leading-snug text-gray-900">
                  Shark Aspirador de Mão sem Fios, Leve e...
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 px-2 py-1">
                  <button onClick={() => setQty(qty - 1)} aria-label="Diminuir">
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-[14px] font-medium">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} aria-label="Aumentar">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#ff4d63] px-2 py-0.5 text-[12px] font-bold text-white">
                  Oferta Relâmpago <Zap size={12} fill="currentColor" />
                </span>
                <span className="text-[13px] font-bold text-[#ff4d63]">{timer}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-gray-700">
                <RotateCw size={14} className="text-blue-500" strokeWidth={2.2} />
                Devolução gratuita
              </div>
              <div className="mt-1.5 text-[18px] font-extrabold text-[#ff4d63]">€ {fmt(unit)}</div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[13px] text-gray-400 line-through">€ 355,00</span>
                <span className="rounded-md bg-[#ffe5e9] px-1.5 py-0.5 text-[12px] font-bold text-[#ff4d63]">
                  -72%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Opções de envio */}
        <section className="px-4 pb-5">
          <h2 className="text-[17px] font-bold text-gray-900">Opções de envio</h2>
          <div className="mt-3 space-y-3">
            <button
              type="button"
              onClick={() => setShipping("gratis")}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left ${
                shipping === "gratis"
                  ? "border-[#ff4d63] bg-[#fff5f6]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Radio active={shipping === "gratis"} />
              <div className="flex-1">
                <div className="text-[15px] font-bold text-gray-900">Entrega Gratis</div>
                <div className="text-[13px] text-gray-500">Entrega de 7 a 14 dias</div>
              </div>
              <div className="text-[14px] font-bold text-emerald-700">Grátis</div>
            </button>
            <button
              type="button"
              onClick={() => setShipping("expressa")}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left ${
                shipping === "expressa"
                  ? "border-[#ff4d63] bg-[#fff5f6]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Radio active={shipping === "expressa"} />
              <div className="flex-1">
                <div className="text-[15px] font-bold text-gray-900">Entrega Expressa</div>
                <div className="text-[13px] text-gray-500">Entrega de 3 a 4 dias</div>
              </div>
              <div className="text-[14px] font-bold text-gray-900">€ 8,00</div>
            </button>
          </div>
        </section>

        {/* Desconto especial */}
        <section className="px-4">
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2.5">
              <Ticket size={20} className="text-[#ff4d63]" />
              <span className="text-[15px] text-gray-900">Desconto especial</span>
            </div>
            <span className="rounded-md bg-[#ffe5e9] px-2 py-1 text-[14px] font-bold text-[#ff4d63]">
              - € 257,10
            </span>
          </div>
        </section>

        {/* Resumo */}
        <section className="mt-4 border-t border-gray-100 px-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-gray-900">Resumo da encomenda</h3>
            <ChevronUp size={18} className="text-gray-500" />
          </div>
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[14.5px] text-gray-800">
                <ShoppingBag size={18} className="text-gray-500" />
                Subtotal ({qty} artigo{qty > 1 ? "s" : ""})
              </div>
              <span className="text-[14.5px] text-gray-900">€ {fmt(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[14.5px] text-gray-800">
                <Truck size={18} className="text-gray-500" />
                Portes de envio
              </div>
              <span className={`text-[14.5px] font-bold ${shippingCost === 0 ? "text-emerald-700" : "text-gray-900"}`}>
                {shippingCost === 0 ? "Grátis" : `€ ${fmt(shippingCost)}`}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-start justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-gray-900" />
              <span className="text-[17px] font-bold text-gray-900">Total</span>
            </div>
            <div className="text-right">
              <div className="text-[18px] font-extrabold text-gray-900">€ {fmt(total)}</div>
              <div className="text-[12px] text-gray-500">Impostos incluídos</div>
            </div>
          </div>
        </section>

        {/* Forma de pagamento */}
        <section className="mt-5 border-t border-gray-100 px-4 pt-5">
          <h2 className="text-[17px] font-bold text-gray-900">Forma de pagamento</h2>
          <div className="mt-3 space-y-3">
            <button
              type="button"
              onClick={() => setPayment("mbway")}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left ${
                payment === "mbway" ? "border-[#ff4d63] bg-white" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[10px] font-extrabold leading-none text-[#ff4d63]">
                <div className="text-center">
                  <div className="text-[13px]">MB</div>
                  <div className="text-[9px] tracking-wider">WAY</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-gray-900">MB WAY</div>
                <div className="text-[13px] text-gray-500">
                  Pague com o telemóvel e confirme na app.
                </div>
              </div>
              <Radio active={payment === "mbway"} />
            </button>

            {payment === "mbway" && (
              <div>
                <Field placeholder="+351 9XX XXX XXX" value={mbwayPhone} onChange={(v) => setMbwayPhone(formatPhonePT(v))} inputMode="tel" maxLength={17} />
                <p className="mt-2 text-[13px] text-gray-500">
                  Receberá um pedido de pagamento na app MB WAY associada a este número.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPayment("multibanco")}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left ${
                payment === "multibanco" ? "border-[#ff4d63] bg-white" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[10px] font-extrabold leading-none text-blue-700">
                <div className="text-center">
                  <div className="text-[13px]">MB</div>
                  <div className="text-[7px] tracking-wider">MULTIBANCO</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-gray-900">Multibanco</div>
                <div className="text-[13px] text-gray-500">
                  Receba referência para pagar no homebanking ou ATM.
                </div>
              </div>
              <Radio active={payment === "multibanco"} />
            </button>
          </div>

          <p className="mt-5 text-center text-[13px] leading-relaxed text-gray-600">
            Ao efectuar uma encomenda, concorda com os{" "}
            <span className="underline">Termos de utilização e venda</span> e reconhece que leu e
            concorda com a <span className="underline">Política de privacidade</span>.
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#fff0f2] px-3 py-2.5 text-[14px] text-[#ff4d63]">
            <Smile size={18} />
            Parabéns! Está a poupar € 257,10 nesta encomenda.
          </div>
        </section>
      </div>

      {/* Bottom action bar */}
      {(() => {
        const phoneDigits = telefone.replace(/\D/g, "").replace(/^351/, "");
        const mbwayDigits = mbwayPhone.replace(/\D/g, "").replace(/^351/, "");
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const addressOk =
          nome.trim().length > 2 &&
          phoneDigits.length === 9 &&
          emailOk &&
          cp.replace(/\D/g, "").length === 7 &&
          distrito.trim() &&
          cidade.trim() &&
          freguesia.trim() &&
          morada.trim() &&
          numero.trim();
        const paymentOk = payment === "multibanco" || (payment === "mbway" && mbwayDigits.length === 9);
        const canSubmit = Boolean(addressOk && paymentOk);
        return (
          <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-gray-100 bg-white px-4 py-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[15px] font-bold text-gray-900">Total ({qty} artigo{qty > 1 ? "s" : ""})</span>
              <span className="text-[18px] font-extrabold text-[#ff4d63]">€ {fmt(total)}</span>
            </div>
            <button
              disabled={!canSubmit}
              onClick={() => {
                if (!canSubmit) return;
                alert("Pagamento em breve — gateway será integrado.");
              }}
              className={`w-full rounded-xl px-4 py-3 text-center transition-colors ${
                canSubmit ? "bg-[#ff4d63]" : "bg-gray-100"
              }`}
            >
              <div className={`text-[16px] font-bold ${canSubmit ? "text-white" : "text-gray-500"}`}>
                Finalizar encomenda
              </div>
              <div className={`text-[12px] ${canSubmit ? "text-white/90" : "text-gray-500"}`}>
                {canSubmit
                  ? payment === "mbway"
                    ? "Pagar com MB WAY"
                    : "Gerar referência Multibanco"
                  : "Preencha todos os dados para continuar"}
              </div>
            </button>
          </div>
        );
      })()}
    </div>
  );
}

function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        active ? "border-[#ff4d63]" : "border-gray-300"
      }`}
    >
      {active && <span className="h-2.5 w-2.5 rounded-full bg-[#ff4d63]" />}
    </span>
  );
}
