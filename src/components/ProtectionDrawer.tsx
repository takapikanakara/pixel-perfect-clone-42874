import { Sheet, SheetContent, SheetPortal } from "@/components/ui/sheet";
import { X, Package, CreditCard, DollarSign, Clock, ShieldCheck } from "lucide-react";

const SECTIONS = [
  {
    icon: Package,
    title: "Devoluções gratuitas em 30 dias",
    body: [
      "Devolução gratuita em até 30 dias após a recepção do seu produto. Os Termos e Condições aplicam-se.",
    ],
  },
  {
    icon: CreditCard,
    title: "Pagamento seguro",
    body: [
      "Para garantir a segurança, as informações do seu cartão são encriptadas e protegidas contra acesso não autorizado.",
      "A loja não vende, aluga nem cede os seus dados pessoais a terceiros para fins de marketing.",
    ],
  },
  {
    icon: DollarSign,
    title: "Reembolso se algo der errado",
    body: [
      "Se a sua encomenda for perdida ou danificada durante o transporte antes de chegar, reembolsaremos automaticamente o seu dinheiro. Não precisa de fazer nada.",
    ],
  },
  {
    icon: Clock,
    title: "Se a sua encomenda não for enviada no prazo",
    body: [
      "Não precisa de fazer nada. Se não for enviada dentro do prazo previsto, o reembolso será processado automaticamente para a sua forma de pagamento original.",
    ],
  },
];

export function ProtectionDrawer({
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
          className="mx-auto flex h-[88vh] max-w-[480px] flex-col gap-0 rounded-t-2xl border-0 bg-[#fbf3e6] p-0 [&>button.absolute]:hidden"
        >
          {/* Grabber */}
          <div className="flex justify-center pt-2.5">
            <span className="h-1 w-10 rounded-full bg-[#d9c9ad]" />
          </div>

          {/* Header */}
          <div className="relative px-5 pt-4">
            <div className="absolute right-3 top-0 pointer-events-none opacity-25 blur-[2px]">
              <ShieldCheck size={130} strokeWidth={1.2} fill="#e8c98a" className="text-[#d9b87a]" />
            </div>

            <h2 className="relative text-[26px] font-extrabold leading-tight text-[#7a4f10]">
              Protecção do cliente
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
              className="absolute right-4 top-2 p-1.5 text-[#5b3a0a]"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="mt-4 flex-1 overflow-y-auto px-5 pb-8">
            <div className="space-y-6">
              {SECTIONS.map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <div className="flex items-start gap-3">
                    <Icon size={22} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#a06b1a]" />
                    <h3 className="text-[17px] font-bold leading-snug text-[#7a4f10]">{title}</h3>
                  </div>
                  <div className="mt-2 space-y-3 pl-[34px]">
                    {body.map((p, i) => (
                      <p key={i} className="text-[14.5px] leading-relaxed text-gray-800">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
