import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import sharkVacuum from "@/assets/shark-vacuum.png.asset.json";
import { Sheet, SheetContent, SheetPortal } from "@/components/ui/sheet";

const SUGGESTIONS = [
  "Quanto tempo dura a bateria?",
  "Quando recebo a encomenda?",
  "Posso devolver se não gostar?",
  "Serve para pêlos de animais?",
];

const WELCOME: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Olá! 👋 Sou a assistente da loja Shark. Em que posso ajudá-lo com o Aspirador de Mão sem Fios?",
    },
  ],
};

export function ChatSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { messages, sendMessage, status } = useChat({
    id: "shark-product-chat",
    messages: [WELCOME],
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (open && !isLoading) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open, isLoading]);

  async function submit(text: string) {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetContent
          side="bottom"
          className="mx-auto flex h-[88vh] max-w-[480px] flex-col gap-0 rounded-t-2xl border-0 p-0"
        >
          {/* Header */}
          <header className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff4d63] text-[14px] font-bold text-white">
                S
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-gray-900">Chat com a loja</div>
                <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Online · resposta imediata
                </div>
              </div>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-1.5" aria-label="Fechar">
              <X size={22} strokeWidth={1.8} />
            </button>
          </header>

          {/* Product context card */}
          <div className="border-b border-gray-100 bg-gray-50/60 px-3 py-2.5">
            <div className="flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100">
              <img src={sharkVacuum.url} alt="Shark Aspirador" className="h-12 w-12 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-gray-900">
                  Shark Aspirador de Mão sem Fios, 600 g
                </div>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-[14px] font-bold text-[#ff4d63]">€ 97,90</span>
                  <span className="text-[11px] text-gray-400 line-through">€ 355,00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-3">
              {messages.map((m) => {
                const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={
                        isUser
                          ? "max-w-[78%] rounded-2xl rounded-br-md bg-[#ff4d63] px-3.5 py-2 text-[14px] leading-relaxed text-white"
                          : "max-w-[82%] rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2 text-[14px] leading-relaxed text-gray-900 whitespace-pre-wrap"
                      }
                    >
                      {text}
                    </div>
                  </div>
                );
              })}
              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva a sua dúvida..."
              className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-[14px] outline-none placeholder:text-gray-400 focus:bg-gray-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff4d63] text-white disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
