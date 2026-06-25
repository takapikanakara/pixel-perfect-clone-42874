import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChatSheet } from "@/components/ChatSheet";
import { InstallmentsDrawer } from "@/components/InstallmentsDrawer";
import { ShippingDrawer } from "@/components/ShippingDrawer";
import { ProtectionDrawer } from "@/components/ProtectionDrawer";
import { useCart } from "@/lib/cart";
import { useNavigateWithLoader } from "@/components/CrossLoader";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  ShoppingCart,
  MoreHorizontal,
  Zap,
  Wallet,
  ChevronRight,
  Bookmark,
  Star,
  Truck,
  Store,
  MessageCircle,
  ShieldCheck,
  Check,
} from "lucide-react";
import ninjaSlushi from "@/assets/ninja-slushi.webp.asset.json";
import shareIcon from "@/assets/share-icon.png.asset.json";

export const Route = createFileRoute("/maquina-de-granizados-ninja-slushi")({
  head: () => ({
    meta: [
      { title: "Máquina de Granizados Ninja SLUSHi — Bebidas geladas em minutos" },
      { name: "description", content: "Máquina de Granizados Ninja SLUSHi: prepare granizados, slushies e bebidas geladas em casa. Oferta relâmpago com -72% e portes grátis." },
    ],
  }),
  component: ProductPage,
});

function useCountdown(initialSeconds: number) {
  const [s, setS] = useState(initialSeconds);
  useEffect(() => {
    const i = setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-[#f5b400] text-[#f5b400]" : "fill-none text-[#e5e7eb]"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

const TABS = [
  { id: "visao", label: "Visão geral" },
  { id: "avaliacoes", label: "Avaliações" },
  { id: "descricao", label: "Descrição" },
  { id: "recomendacoes", label: "Recomendações" },
] as const;


type TabId = (typeof TABS)[number]["id"];

function ProductPage() {
  const navigate = useNavigate();
  const navLoader = useNavigateWithLoader();
  const countdown = useCountdown(3 * 3600 + 45 * 60 + 36);
  const { qty: cartQty, add: addToCart } = useCart();
  const [addedToast, setAddedToast] = useState(false);

  const [tab, setTab] = useState<TabId>("visao");
  const [descOpen, setDescOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [installmentsOpen, setInstallmentsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [protectionOpen, setProtectionOpen] = useState(false);
  const [reviewToast, setReviewToast] = useState(false);


  const [showTabs, setShowTabs] = useState(false);
  const clickLockRef = useRef(false);

  useEffect(() => {
    const ids: TabId[] = ["visao", "descricao", "avaliacoes", "recomendacoes"];
    const OFFSET = 120;

    function onScroll() {
      setShowTabs(window.scrollY > 200);
      if (clickLockRef.current) return;
      let current: TabId = ids[0];
      for (const id of ids) {
        const el = document.getElementById(`sec-${id}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - OFFSET <= 0) current = id;
      }
      setTab((prev) => (prev === current ? prev : current));
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  function goToTab(id: TabId) {
    setTab(id);
    clickLockRef.current = true;
    const el = document.getElementById(`sec-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    window.setTimeout(() => {
      clickLockRef.current = false;
    }, 700);
  }


  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[480px] bg-white pb-24">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-2 bg-white px-3 py-2.5 border-b border-gray-100">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-4 py-2 min-w-0">
            <Search size={18} className="shrink-0 text-gray-500" />
            <span className="truncate whitespace-nowrap text-[15px] text-gray-700">ninja slushi máquina granizados</span>
          </div>
          <button
            onClick={async () => {
              const shareData = {
                title: "Máquina de Granizados Ninja SLUSHi",
                text: "Olha que oferta na Máquina de Granizados Ninja SLUSHi!",
                url: typeof window !== "undefined" ? window.location.href : "",
              };
              try {
                if (typeof navigator !== "undefined" && navigator.share) {
                  await navigator.share(shareData);
                } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                  await navigator.clipboard.writeText(shareData.url);
                  alert("Link copiado para a área de transferência!");
                }
              } catch {
                /* user cancelled */
              }
            }}
            aria-label="Compartilhar"
            className="p-1.5"
          >
            <img src={shareIcon.url} alt="Compartilhar" className="h-10 w-10 object-contain" />
          </button>
          <button onClick={() => navLoader("/cart")} className="relative p-1.5">
            <ShoppingCart size={22} strokeWidth={1.8} />
            {cartQty > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff4d63] px-1 text-[11px] font-bold leading-none text-white">
                {cartQty}
              </span>
            )}
          </button>
          <button className="p-1.5">
            <MoreHorizontal size={22} strokeWidth={1.8} />
          </button>
        </header>

        {/* Sticky section tabs */}
        <nav
          className={`sticky top-[56px] z-10 flex items-center justify-between gap-2 bg-white px-4 pt-3 border-b border-gray-100 transition-all duration-200 ${
            showTabs ? "opacity-100 max-h-20 pointer-events-auto" : "opacity-0 max-h-0 overflow-hidden pointer-events-none pt-0 border-b-0"
          }`}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => goToTab(t.id)}
              className="relative pb-3 text-[14px] whitespace-nowrap"
            >
              <span className={tab === t.id ? "font-semibold text-gray-900" : "text-gray-500"}>
                {t.label}
              </span>
              {tab === t.id && (
                <span className="absolute bottom-0 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-gray-900" />
              )}
            </button>
          ))}
        </nav>


        {/* Visão geral */}
        <div id="sec-visao" />

        {/* Product image */}
        <div className="flex items-center justify-center bg-white py-6">

          <img
            src={ninjaSlushi.url}
            alt="Máquina de Granizados Ninja SLUSHi"
            width={1024}
            height={1024}
            className="h-auto w-[80%] object-contain"
          />
        </div>

        {/* Flash sale bar */}
        <div className="relative flex items-stretch justify-between overflow-hidden bg-[#FE476C] px-3 pt-2.5 pb-3 text-white">
          <svg
            viewBox="0 0 100 140"
            className="pointer-events-none absolute top-1/2 right-[132px] h-[78px] w-auto -translate-y-1/2"
            style={{
              WebkitMaskImage: "linear-gradient(100deg, black 25%, transparent 90%)",
              maskImage: "linear-gradient(100deg, black 25%, transparent 90%)",
            }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <path
              d="M58 4 L18 78 L44 78 L34 136 L86 52 L58 52 Z"
              fill="url(#boltGrad)"
            />
          </svg>

          <div className="relative flex flex-col">
            <div className="flex items-end gap-1.5">
              <span className="mb-1 rounded-md bg-white/25 px-1.5 py-0.5 text-[10px] font-semibold">
                -72%
              </span>
              <div className="flex items-end leading-none">
                <span className="mb-0.5 text-[14px] font-semibold">€</span>
                <span className="text-[26px] font-extrabold tracking-tight">109,90</span>
              </div>
              <svg
                viewBox="0 0 24 24"
                className="mb-1.5 ml-0.5 h-[14px] w-[14px] -rotate-12 fill-none stroke-white"
                strokeWidth={1.8}
              >
                <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
                <path d="M12 7v10" strokeDasharray="1.5 2" />
              </svg>
            </div>
            <div className="ml-[42px] mt-0.5 text-[11px] line-through opacity-90">€ 285,00</div>
          </div>

          <div className="relative flex flex-col items-end justify-center">
            <div className="flex items-center gap-1 text-[12px] font-bold tracking-wide">
              <Zap size={13} className="fill-white text-white" strokeWidth={0} />
              OFERTA RELÂMPAGO
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="opacity-95">Termina em</span>
              <span className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider">
                {countdown}
              </span>
            </div>
          </div>
        </div>

        {/* Installments */}
        <button onClick={() => setInstallmentsOpen(true)} className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left">
          <Wallet size={22} className="text-gray-800" />
          <span className="text-[14px] text-gray-900">
            8x <span className="font-semibold">€ 12,24</span>{" "}
            <span className="font-semibold text-[#ff6a3d]">sem juros</span>
          </span>
          <ChevronRight size={18} className="ml-auto text-gray-400" />
        </button>

        {/* Title + rating */}
        <section className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[17px] font-medium leading-snug text-gray-900">
              Máquina de Granizados Ninja SLUSHi — Bebidas Geladas em Casa
            </h1>
            <button className="shrink-0 p-1">
              <Bookmark size={22} strokeWidth={1.6} className="text-gray-700" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[13px]">
            <Star size={16} className="fill-[#f5b400] text-[#f5b400]" />
            <span className="font-semibold text-gray-900">5,0</span>
            <span className="text-[#1c7ed6]">(650)</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">2314 vendidos</span>
          </div>
        </section>

        {/* Shipping */}
        <button onClick={() => setShippingOpen(true)} className="flex w-full items-center gap-3 px-4 py-3 text-left border-b-[6px] border-gray-100">
          <Truck size={26} className="text-gray-500" strokeWidth={1.5} />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="rounded bg-[#e8f5ec] px-2 py-0.5 text-[12px] font-medium text-[#1f8a3d]">
                Portes grátis
              </span>
              <span className="text-gray-500 line-through">€ 4,90</span>
            </div>
            <div className="mt-1 text-[13px] text-gray-700">Receba até 26 de jun</div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>




        {/* Customer protection */}
        <section className="px-4 pt-5 pb-4 border-b-[6px] border-gray-100">
          <button onClick={() => setProtectionOpen(true)} className="flex w-full items-center gap-2">
            <ShieldCheck size={22} className="text-[#a06b1a]" />
            <span className="text-[15px] font-semibold text-[#7a4f10]">Protecção do cliente</span>
            <ChevronRight size={18} className="ml-auto text-gray-400" />
          </button>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[14px] text-gray-800">
            <div className="flex items-start gap-2">
              <Check size={16} className="mt-1 shrink-0 text-gray-500" strokeWidth={2.5} />
              <span>Devolução gratuita</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="mt-1 shrink-0 text-gray-500" strokeWidth={2.5} />
              <span>Reembolso se algo der errado</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="mt-1 shrink-0 text-gray-500" strokeWidth={2.5} />
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="mt-1 shrink-0 text-gray-500" strokeWidth={2.5} />
              <span className="truncate">Se a sua encomenda não f…</span>
            </div>
          </div>
        </section>

        {/* Description */}
        <div id="sec-descricao" />
        <section className="px-4 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-gray-900">Descrição do produto</h2>
          <div
            className={`relative mt-3 overflow-hidden text-[15px] leading-relaxed text-gray-800 ${
              descOpen ? "" : "max-h-[110px]"
            }`}
          >
            <p>
              Transforme qualquer bebida em granizado em minutos com a Máquina de Granizados
              Ninja SLUSHi. Prepare slushies, frozen cocktails, sumos gelados e sobremesas
              cremosas no conforto de casa, com a qualidade Ninja.
            </p>
            {descOpen && (
              <div className="mt-3 space-y-3">
                <p>
                  Equipada com tecnologia avançada de congelamento rápido, a Ninja SLUSHi
                  arrefece e mistura automaticamente, libertando-o do trabalho manual. Vários
                  programas para granizado, slushie, frappé e bebidas frozen.
                </p>
                <p>
                  Design compacto e elegante para a bancada da cozinha. Reservatório
                  transparente para acompanhar o processo, peças removíveis e fáceis de
                  limpar. Perfeito para festas, verão e momentos em família.
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Capacidade: 2,1 litros</li>
                  <li>Vários programas pré-definidos</li>
                  <li>Congelamento rápido sem necessidade de gelo</li>
                  <li>Peças amovíveis aptas para máquina de lavar</li>
                </ul>
              </div>
            )}
            {!descOpen && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
          <button
            onClick={() => setDescOpen((v) => !v)}
            className="mt-2 text-[15px] font-semibold text-gray-900"
          >
            {descOpen ? "Ver menos" : "Ler mais"}
          </button>
          <p className="mt-4 text-[13px] leading-relaxed text-gray-500">
            Imagens meramente ilustrativas. Pequenas variações de cor podem ocorrer devido à
            iluminação e configurações da tela.
          </p>
        </section>

        {/* Reviews */}
        <div id="sec-avaliacoes" />
        <section className="px-4 pt-5 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-gray-900">Avaliações (3)</h2>
            <button
              onClick={() => {
                setReviewToast(true);
                window.setTimeout(() => setReviewToast(false), 2500);
              }}
              className="rounded-full border border-gray-300 px-5 py-1.5 text-[14px] font-medium text-gray-900"
            >
              Avaliar
            </button>

          </div>

          <div className="mt-5 flex items-start gap-6">
            <div className="flex flex-col items-center">
              <div className="text-[40px] font-bold leading-none text-gray-900">4,7</div>
              <div className="mt-2">
                <Stars value={5} size={14} />
              </div>
              <div className="mt-2 text-[13px] text-gray-500">3 avaliações</div>
            </div>
            <div className="flex-1 space-y-1.5 pt-1">
              {[
                { n: 5, c: 2, p: 90 },
                { n: 4, c: 1, p: 45 },
                { n: 3, c: 0, p: 0 },
                { n: 2, c: 0, p: 0 },
                { n: 1, c: 0, p: 0 },
              ].map((r) => (
                <div key={r.n} className="flex items-center gap-2 text-[13px] text-gray-700">
                  <span className="w-3">{r.n}</span>
                  <Star size={12} className="fill-[#f5b400] text-[#f5b400]" />
                  <div className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#f5b400]"
                      style={{ width: `${r.p}%` }}
                    />
                  </div>
                  <span className="w-3 text-right">{r.c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {[
              { initial: "M", name: "Mariana Costa", date: "22/06/2026", stars: 5 },
              { initial: "R", name: "Rui Pereira", date: "22/06/2026", stars: 4 },
            ].map((rev) => (
              <div key={rev.name} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-700 text-[15px] font-semibold text-white">
                  {rev.initial}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-gray-900">{rev.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[13px] text-gray-500">{rev.date}</span>
                    <Stars value={rev.stars} size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recomendações */}
        <div id="sec-recomendacoes" />
        <section className="px-4 pt-5 pb-8">
          <h2 className="text-[17px] font-semibold text-gray-900">Recomendações</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { name: "Ninja Blender Profissional", price: "129,90", old: "199,00" },
              { name: "Máquina de Gelado Ninja CREAMi", price: "249,00", old: "399,00" },
              { name: "Copos Reutilizáveis para Slushie", price: "14,90", old: "24,90" },
              { name: "Kit de Xaropes para Granizados", price: "9,90", old: "16,90" },
            ].map((p) => (
              <div key={p.name} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <div className="flex aspect-square items-center justify-center bg-gray-50">
                  <img src={ninjaSlushi.url} alt={p.name} className="h-[78%] w-[78%] object-contain" />
                </div>
                <div className="p-2.5">
                  <div className="line-clamp-2 text-[13px] leading-snug text-gray-900">{p.name}</div>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-[14px] font-bold text-[#ff4d63]">€ {p.price}</span>
                    <span className="text-[11px] text-gray-400 line-through">€ {p.old}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>



      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[480px] -translate-x-1/2 items-center gap-2 border-t border-gray-100 bg-white px-3 py-2">
        <button className="flex flex-col items-center gap-0.5 px-2 text-[11px] text-gray-700">
          <Store size={22} strokeWidth={1.6} />
          Loja
        </button>
        <button onClick={() => setChatOpen(true)} className="flex flex-col items-center gap-0.5 px-2 text-[11px] text-gray-700">
          <MessageCircle size={22} strokeWidth={1.6} />
          Chat
        </button>
        <button
          onClick={() => {
            addToCart(1);
            setAddedToast(true);
            window.setTimeout(() => setAddedToast(false), 1800);
          }}
          className="ml-1 flex-1 rounded-full bg-gray-100 px-3 py-2.5 text-center text-[13px] font-semibold leading-tight text-gray-900"
        >
          Adicionar
          <div className="text-[12px] font-normal">ao carrinho</div>
        </button>
        <button
          onClick={() => navLoader("/checkout")}
          className="flex-1 rounded-full bg-[#ff4d63] px-3 py-2.5 text-center text-[14px] font-semibold leading-tight text-white"
        >
          Comprar agora
          <div className="text-[11px] font-normal opacity-90">Portes grátis</div>
        </button>

      </div>

      <ChatSheet open={chatOpen} onOpenChange={setChatOpen} />
      <InstallmentsDrawer open={installmentsOpen} onOpenChange={setInstallmentsOpen} />
      <ShippingDrawer open={shippingOpen} onOpenChange={setShippingOpen} />
      <ProtectionDrawer open={protectionOpen} onOpenChange={setProtectionOpen} />

      {reviewToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 pointer-events-none">
          <div className="rounded-2xl bg-[#3a3a3a]/95 px-7 py-5 text-center text-[15px] leading-relaxed text-white shadow-xl max-w-[280px]">
            Avaliações disponíveis somente após a compra do produto.
          </div>
        </div>
      )}

      {addedToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 pointer-events-none">
          <div className="rounded-2xl bg-[#3a3a3a]/95 px-6 py-4 text-center text-[14px] font-medium text-white shadow-xl">
            Adicionado ao carrinho
          </div>
        </div>
      )}



    </div>
  );
}
