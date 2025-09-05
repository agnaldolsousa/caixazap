// src/lib/ocrspace.ts
export async function ocrSpaceExtractText(file: File): Promise<string> {
  const apiKey = process.env.OCRSPACE_API_KEY;
  if (!apiKey) throw new Error("Falta OCRSPACE_API_KEY");

  const form = new FormData();
  form.append("file", file);
  form.append("language", "por");
  form.append("isOverlayRequired", "false");

  const resp = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { apikey: apiKey },
    body: form,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status} OCRSpace: ${txt || resp.statusText}`);
  }

  const data = await resp.json().catch(() => null);
  // OCRSpace retorna algo como { ParsedResults: [{ ParsedText: "..." }], OCRExitCode: 1, ... }
  const parsed = data?.ParsedResults?.[0]?.ParsedText;
  if (!parsed || typeof parsed !== "string") {
    throw new Error(`Resposta OCR inválida: ${JSON.stringify(data)?.slice(0, 200)}`);
  }
  return parsed;
}
