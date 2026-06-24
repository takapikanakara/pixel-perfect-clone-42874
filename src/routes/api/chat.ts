import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `Você é a assistente virtual da loja oficial da Shark em Portugal. Responde sempre em português europeu, de forma simpática, breve e prestável.

Produto em destaque que o cliente está a ver:
- Nome: Shark Aspirador de Mão sem Fios, Leve e Portátil, com 600 g
- Preço promocional: €97,90 (oferta relâmpago, -72% sobre €355,00)
- Pagamento: até 8x de €12,24 sem juros
- Portes: grátis (normalmente €4,90), entrega estimada até 26 de junho
- Características: sem fios, ultra leve (600g), bateria recarregável, base de carregamento incluída, filtro lavável, acessórios para diferentes superfícies, ideal para casa, escritório e carro
- Garantias: devolução gratuita, reembolso se algo correr mal, pagamento seguro
- Avaliações: 5,0 estrelas (343 avaliações), 1324 vendidos

Responde dúvidas do cliente sobre o produto, envio, pagamento, garantia e uso. Se não souberes algo específico, diz que vais verificar com a equipa da loja. Não inventes preços, datas ou políticas diferentes das listadas.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
