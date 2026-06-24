import { Sheet, SheetContent, SheetPortal } from "@/components/ui/sheet";
import { X, Check } from "lucide-react";

const PRICE = 97.9;
const OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",");
}

export function InstallmentsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetContent
          side="bottom"
          className="mx-auto flex max-h-[80vh] max-w-[480px] flex-col gap-0 rounded-t-2xl border-0 p-0"
        >
          <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <div className="text-[16px] font-semibold text-gray-900">Pague em parcelas</div>
              <div className="mt-0.5 text-[12px] text-gray-500">
                Total: <span className="font-semibold text-gray-900">€ {fmt(PRICE)}</span>
              </div>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-1.5" aria-label="Fechar">
              <X size={22} strokeWidth={1.8} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            <ul className="divide-y divide-gray-100">
              {OPTIONS.map((n) => {
                const value = PRICE / n;
                return (
                  <li key={n} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2 text-[15px] text-gray-900">
                      <span className="font-semibold">{n}x</span>
                      <span>de</span>
                      <span className="font-semibold">€ {fmt(value)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1f8a3d]">
                      <Check size={14} strokeWidth={2.5} />
                      sem juros
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="px-1 py-3 text-[12px] leading-relaxed text-gray-500">
              Parcelamento sem juros sujeito à aprovação do cartão. Valor total final pode variar
              conforme o método de pagamento.
            </p>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
