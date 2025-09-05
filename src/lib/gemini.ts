// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ===== Tipos do retorno estruturado ===== */
export type Forma = "" | "Pix" | "Débito" | "Crédito" | "Dinheiro";

export type ItemCupom = {
  descricao: string;
  quantidade?: number | null;
  valorUnitario?: number | null;
  subtotal?: number | null;
};

export type CupomEstruturado = {
  fornecedor?: string;
  forma_pagamento?: Forma | string;
  total_bruto?: number | null; // antes de descontos
  desconto?: number | null;    // total de descontos
  valor_pago?: number | null;  // total final
  itens?: ItemCupom[];
};

const apiKey = process.env.GOOGLE_GEMINI_API_KEY as string;
if (!apiKey) {
  throw new Error("A variável GOOGLE_GEMINI_API_KEY não está definida no .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/** Remove crases ``` e tenta achar um JSON “puro” */
function pickJson(text: string): any {
  const t = text.trim();
  const try1 = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(try1);
  } catch {}

  // fallback: pega do 1º { até o último }
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const slice = t.slice(first, last + 1);
    return JSON.parse(slice);
  }
  throw new Error("Resposta do Gemini não está em JSON válido");
}

/** normaliza forma de pagamento vinda do modelo */
export function normalizaFormaPagamento(v: string | undefined): Forma {
  if (!v) return "";
  const s = v.toLowerCase();
  if (/\bpix\b/.test(s)) return "Pix";
  if (/(d[eé]bito|debito)/.test(s)) return "Débito";
  if (/(cr[eé]dito|credito)/.test(s)) return "Crédito";
  if (/(dinheiro|esp[eé]cie|cash)/.test(s)) return "Dinheiro";
  return "";
}

/** Chama o Gemini focado em ITENS e campos principais (mas sem confiar cegamente) */
export async function interpretarCupomGemini(texto: string): Promise<CupomEstruturado> {
  // prompt curto e objetivo; obriga JSON puro
  const prompt = `
Você é um parser de cupons fiscais do Brasil.
Extraia o máximo possível dos ITENS e campos principais.
Responda ESTRITAMENTE em JSON puro (sem markdown, sem comentários).

Regras:
- "fornecedor": nome simples (sem CEP/telefone/endereço).
- "forma_pagamento": uma de ["Pix","Débito","Crédito","Dinheiro"] se conseguir inferir.
- "total_bruto": número (antes de desconto), se aparecer.
- "desconto": número, se aparecer (0 se não houver).
- "valor_pago": número, total final (após desconto).
- "itens": lista com {descricao, quantidade, valorUnitario, subtotal} quando possível.

Retorne:
{
  "fornecedor": string|null,
  "forma_pagamento": string|null,
  "total_bruto": number|null,
  "desconto": number|null,
  "valor_pago": number|null,
  "itens": [ { "descricao": string, "quantidade": number|null, "valorUnitario": number|null, "subtotal": number|null } ]
}

Texto do cupom:
"""${texto}"""
`.trim();

  const resp = await model.generateContent([{ text: prompt }]);
  const raw = resp.response.text();
  let data: CupomEstruturado;

  try {
    data = pickJson(raw);
  } catch (e) {
    console.error("Resposta não-JSON do Gemini:", raw);
    throw e;
  }

  // ajustes leves
  if (data?.forma_pagamento) {
    data.forma_pagamento = normalizaFormaPagamento(String(data.forma_pagamento)) || "";
  }
  if (!Array.isArray(data.itens)) data.itens = [];

  return data;
}
