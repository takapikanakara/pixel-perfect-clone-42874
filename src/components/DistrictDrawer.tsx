import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetPortal } from "@/components/ui/sheet";
import { Search } from "lucide-react";

const DISTRICTS = [
  "Aveiro",
  "Açores",
  "Beja",
  "Braga",
  "Bragança",
  "Castelo Branco",
  "Coimbra",
  "Évora",
  "Faro",
  "Guarda",
  "Leiria",
  "Lisboa",
  "Madeira",
  "Portalegre",
  "Porto",
  "Santarém",
  "Setúbal",
  "Viana do Castelo",
  "Vila Real",
  "Viseu",
];

function firstLetter(name: string) {
  // Normalize accents so "Évora" → "E", "Açores" → "A"
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").charAt(0).toUpperCase();
}

export function DistrictDrawer({
  open,
  onOpenChange,
  selected,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selected: string;
  onSelect: (district: string) => void;
}) {
  const [tab, setTab] = useState<"pais" | "distrito">("distrito");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DISTRICTS;
    return DISTRICTS.filter((d) => d.toLowerCase().includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const d of filtered) {
      const l = firstLetter(d);
      if (!map.has(l)) map.set(l, []);
      map.get(l)!.push(d);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const letters = grouped.map(([l]) => l);
  const [activeLetter, setActiveLetter] = useState<string>("A");

  function pick(d: string) {
    onSelect(d);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetContent
          side="bottom"
          className="mx-auto flex h-[100vh] max-w-[480px] flex-col gap-0 rounded-t-2xl border-0 bg-white p-0"
        >
          <header className="border-b border-gray-100 px-5 py-4 text-center">
            <h2 className="text-[17px] font-bold text-gray-900">Seleccionar distrito</h2>
          </header>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-100 px-5 pt-3">
            <button
              onClick={() => setTab("pais")}
              className="relative pb-3 text-[15px]"
            >
              <span className={tab === "pais" ? "font-bold text-gray-900" : "text-gray-400"}>
                Portugal
              </span>
              {tab === "pais" && (
                <span className="absolute bottom-0 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-gray-900" />
              )}
            </button>
            <button
              onClick={() => setTab("distrito")}
              className="relative pb-3 text-[15px]"
            >
              <span className={tab === "distrito" ? "font-bold text-gray-900" : "text-gray-400"}>
                Distrito
              </span>
              {tab === "distrito" && (
                <span className="absolute bottom-0 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-gray-900" />
              )}
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2.5">
              <Search size={18} className="text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Procurar distrito"
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* List with side index */}
          <div className="relative flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pr-8">
              {grouped.map(([letter, items]) => (
                <div key={letter} id={`letter-${letter}`}>
                  <div className="px-5 pt-3 pb-1 text-[16px] font-bold text-gray-900">
                    {letter}
                  </div>
                  {items.map((d) => (
                    <button
                      key={d}
                      onClick={() => pick(d)}
                      className={`flex w-full items-center justify-between border-b border-gray-100 px-5 py-3.5 text-left text-[16px] ${
                        d === selected ? "font-semibold text-[#ff4d63]" : "text-gray-900"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              ))}
              {grouped.length === 0 && (
                <div className="px-5 py-10 text-center text-[14px] text-gray-400">
                  Sem resultados
                </div>
              )}
            </div>

            {/* Side alphabet index */}
            {letters.length > 1 && (
              <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 py-2">
                {letters.map((l) => {
                  const active = l === activeLetter;
                  return (
                    <button
                      key={l}
                      onClick={() => {
                        setActiveLetter(l);
                        const el = document.getElementById(`letter-${l}`);
                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={
                        active
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4d63] text-[11px] font-bold text-white"
                          : "flex h-5 w-5 items-center justify-center text-[11px] font-medium text-gray-400"
                      }
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
