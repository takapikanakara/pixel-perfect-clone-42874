import { Sheet, SheetContent, SheetPortal } from "@/components/ui/sheet";
import { Package, MapPin, Ticket, ChevronRight, ChevronDown } from "lucide-react";

export function ShippingDrawer({
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
          <header className="border-b border-gray-100 px-5 py-4 text-center">
            <h2 className="text-[17px] font-bold text-gray-900">Envio</h2>
          </header>

          <div className="flex-1 overflow-y-auto px-5">
            {/* From / To */}
            <div className="py-5">
              <div className="flex items-center gap-3">
                <Package size={22} className="text-gray-900" strokeWidth={1.6} />
                <span className="text-[16px] text-gray-900">De Lisboa</span>
              </div>
              <div className="ml-[3px] mt-1">
                <ChevronDown size={18} className="text-gray-400" strokeWidth={1.8} />
              </div>
              <div className="mt-1 flex items-center gap-3">
                <MapPin size={22} className="text-gray-900" strokeWidth={1.6} />
                <span className="flex-1 text-[16px] text-gray-900">Lisboa, Lisboa, Portugal</span>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Coupon */}
            <div className="py-4">
              <div className="flex items-start gap-3 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <Ticket size={22} className="mt-0.5 shrink-0 text-gray-900" strokeWidth={1.6} />
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-gray-900">
                    Cupão de envio do TikTok Shop
                  </div>
                  <div className="mt-1 text-[13px] leading-snug text-gray-600">
                    Desconto de € 5 nos portes em encomendas acima de € 19
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Standard shipping */}
            <div className="flex items-start justify-between py-5">
              <div>
                <div className="text-[16px] font-bold text-gray-900">Envio padrão</div>
                <div className="mt-1 text-[14px] text-gray-500">Receba até 26 de jun</div>
              </div>
              <div className="flex items-center gap-1.5 text-[14px]">
                <span className="text-gray-500 line-through">€ 4,90</span>
                <span className="font-semibold text-[#1f8a3d]">Grátis</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
