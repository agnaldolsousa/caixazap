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
  total_bruto?: number | null; // somatório antes de desconto
  desconto?: number | null;    // total de descontos
  valor_pago?: number | null;  // total final (o que saiu do bolso)
  itens?: ItemCupom[];
};

const apiKey = process.env.OCRSPACE_API_KEY || process.env.GOOGLE_GEMINI_API_KEY; // só pra garantir
const genAi = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

/** Regras do prompt (curto e objetivo) */
const PROMPT = `
Você é um parser de cupom fiscal brasileiro. Extraia um JSON com:
- "fornecedor": apenas o NOME (sem endereço/CEP/telefone).
- "forma_pagamento": normalize para Pix/Débito/Crédito/Dinheiro.
- "total_bruto": número (sem desconto).
- "desconto": número (total de descontos).
- "valor_pago": número (após descontos, "valor a pagar"/"valor total").
- "itens": lista de itens com { descricao, quantidade, valorUnitario, subtotal }.
Responda somente JSON válido.
`;

/** Parser com Gemini – lança QUOTA_EXCEEDED quando a cota estoura */
export async function interpretarCupomGemini(texto: string): Promise<CupomEstruturado> {
  try {
    const model = genAi.getGenerativeModel({ model: "gemini-1.5-pro" });
    const res = await model.generateContent([
      { text: PROMPT },
      { text: "TEXTO DO CUPOM:" },
      { text: texto }
    ]);
    const out = await res.response;
    const raw = out.text().trim();

    // remove cercas de código se vierem
    const clean = raw.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(clean) as CupomEstruturado;
  } catch (err: any) {
    const msg = String(err?.message || err);
    // erros de quota (429) costumam vir com estes textos
    if (
      /quota|free tier|429|Too Many Requests|RATE_LIMIT/i.test(msg) ||
      /quotaFailure|quotaexceeded/i.test(msg)
    ) {
      const e: any = new Error("Gemini quota exceeded");
      e.code = "QUOTA_EXCEEDED";
      throw e;
    }
    // qualquer outro erro: propaga como “PARSE_FAILED”
    const e: any = new Error(msg || "Gemini parse failed");
    e.code = "PARSE_FAILED";
    throw e;
  }
}

/** Fallback simples baseado só no OCR (regex) */
export function interpretarBasicoPorRegex(texto: string): CupomEstruturado {
  // fornecedor: pega primeira linha não vazia, sem números longos
  const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let fornecedor = linhas[0] || "";
  fornecedor = fornecedor.replace(/\b\d[\d\.\-\/\s]{5,}\b/g, "").trim();

  // números (BR ou US)
  const parseNum = (s: string) => {
    const t = s.replace(/\./g, "").replace(",", ".");
    const n = parseFloat(t);
    return isNaN(n) ? null : n;
  };

  // total pago
  let valor_pago: number | null = null;
  const mPago =
    texto.match(/valor\s*(a\s*pagar|pago|total)\s*r?\$?\s*([\d\.,]+)/i) ||
    texto.match(/\btotal\s*r?\$?\s*([\d\.,]+)\b/i);
  if (mPago) valor_pago = parseNum(mPago[mPago.length - 1] || "");

  // total bruto
  let total_bruto: number | null = null;
  const mBruto =
    texto.match(/total\s*(bruto|itens)\s*r?\$?\s*([\d\.,]+)/i);
  if (mBruto) total_bruto = parseNum(mBruto[mBruto.length - 1] || "");

  // desconto
  let desconto: number | null = null;
  const mDesc = texto.match(/desconto\s*r?\$?\s*([\d\.,]+)/i);
  if (mDesc) desconto = parseNum(mDesc[1]);

  // forma de pagamento
  let forma_pagamento: Forma | string = "";
  if (/pix/i.test(texto)) forma_pagamento = "Pix";
  else if (/d[eé]bito|debito/i.test(texto)) forma_pagamento = "Débito";
  else if (/cr[eé]dito|credito/i.test(texto)) forma_pagamento = "Crédito";
  else if (/dinheiro|esp[ée]cie|cash/i.test(texto)) forma_pagamento = "Dinheiro";

  return {
    fornecedor,
    forma_pagamento,
    total_bruto,
    desconto,
    valor_pago,
    itens: [] // sem iteração de itens aqui; mantemos vazio no fallback
  };
}
