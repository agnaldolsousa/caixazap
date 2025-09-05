// src/app/api/extrair-nota/route.ts
export const runtime = "nodejs";           // evita Edge (Buffer quebra no Edge)
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const toNumber = (val: any): number | undefined => {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "number" && isFinite(val)) return val;
  const s = String(val)
    .replace(/[^\d,.\-]/g, "")
    .replace(/\.(?=.*\.)/g, "")
    .replace(",", ".");
  const n = parseFloat(s);
  return isFinite(n) ? n : undefined;
};

const formatPgto = (s?: string) => {
  if (!s) return "";
  const t = s.toLowerCase();
  if (t.includes("crédit") || t.includes("credito")) return "Crédito";
  if (t.includes("déb") || t.includes("debito")) return "Débito";
  if (t.includes("pix")) return "Pix";
  if (t.includes("dinheiro") || t.includes("espécie")) return "Dinheiro";
  return "";
};

function getGemini() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY não definida no .env.local");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

async function interpretarCupomGemini(imageBase64: string, mimeType = "image/jpeg") {
  const model = getGemini();

  const prompt = `
Você é um extrator de dados de cupom/nota (BR).
NÃO normalize/renomeie marcas. Retorne o nome exatamente como impresso no cupom.
Responda **somente** um JSON no formato:

{
  "fornecedor": "Razão social exatamente como aparece na NF (sem normalizar)",
  "cnpj": "string|null",
  "forma_pagamento": "Pix|Débito|Crédito|Dinheiro|''",
  "total_bruto": number|null,
  "desconto": number|null,
  "valor_total": number|null,
  "itens": [
    { "descricao": "string", "quantidade": number|null, "valorUnitario": number|null, "subtotal": number|null }
  ]
}
`.trim()


  // imagem deve ser apenas o base64 (sem prefixo data:)
  const data64 = imageBase64.includes(",") ? imageBase64.split(",")[1]! : imageBase64;

  const request = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: data64, mimeType } },
        ],
      },
    ],
  };

  const result = await model.generateContent(request as any);
  const raw = result.response.text().trim();

  const cleaned = raw.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Gemini retornou um formato inesperado.");
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json(
        { ok: false, error: "Envie a imagem no corpo (multipart/form-data)." },
        { status: 400 }
      );
    }

    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { ok: false, error: "Campo 'file' é obrigatório." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");
    const mime = file.type || "image/jpeg";

    const g = await interpretarCupomGemini(base64, mime);

    // depois (retorna exatamente como está na NF)
const fornecedorRaw =
  g?.fornecedor || g?.estabelecimento?.nome || g?.estabelecimento || "";
const fornecedor = String(fornecedorRaw || "").trim();

    const forma = formatPgto(g?.forma_pagamento || g?.resumo?.forma_pagamento) || "";

    const total_bruto = toNumber(g?.total_bruto ?? g?.resumo?.valor_total) ?? null;
    const desconto    = toNumber(g?.desconto    ?? g?.resumo?.desconto)     ?? null;
    const valor_total = toNumber(g?.valor_total ?? g?.resumo?.valor_a_pagar) ?? null;

    const itens = Array.isArray(g?.itens) ? g.itens : [];

    return NextResponse.json(
      {
        ok: true,
        data: {
          fornecedor,
          forma_pagamento: forma,
          total_bruto,
          desconto,
          valor_total,
          itens,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ /api/extrair-nota:", err?.stack || err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Falha no servidor ao processar a nota." },
      { status: 500 }
    );
  }
}
