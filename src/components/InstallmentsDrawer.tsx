import { Sheet, SheetContent, SheetPortal } from "@/components/ui/sheet";

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
          className="mx-auto flex max-h-[85vh] max-w-[480px] flex-col gap-0 rounded-t-2xl border-0 bg-white p-0"
        >
          <header className="px-5 pt-5 pb-2 text-center">
            <h2 className="text-[17px] font-bold text-gray-900">Plano em prestações</h2>
          </header>

          <p className="px-5 pb-2 text-[15px] leading-snug text-gray-500">
            Escolha um método de pagamento em prestações na finalização da compra.
          </p>

          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <ul>
              {OPTIONS.map((n, i) => {
                const value = PRICE / n;
                return (
                  <li
                    key={n}
                    className={`py-5 ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <div className="text-[20px] font-semibold text-gray-900">
                      {n}x € {fmt(value)}
                    </div>
                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="text-[14px] text-gray-500">
                        Taxa mensal das prestações:
                      </span>
                      <span className="rounded-md bg-[#ffe5ea] px-2.5 py-1 text-[13px] font-semibold text-[#ff3355]">
                        Sem juros
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
