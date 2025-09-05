'use client'

import React, { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type Forma = '' | 'Pix' | 'Débito' | 'Crédito' | 'Dinheiro'
type DadosNota = {
  fornecedor: string
  forma_pagamento: Forma
  valor_total: string   // valor pago (exibido)
  total_bruto: string   // soma antes de desconto (exibido)
  desconto: string      // exibido
}

/* =========================
   HELPERS
========================= */
function normalizaFormaPagamento(v?: string): Forma {
  if (!v) return ''
  const s = v.toLowerCase()
  if (/\bpix\b/.test(s)) return 'Pix'
  if (/(d[eé]bito|debito|cart[aã]o\s*de?bito)\b/.test(s)) return 'Débito'
  if (/(cr[eé]dito|credito|cart[aã]o\s*cr[eé]dito)\b/.test(s)) return 'Crédito'
  if (/\b(dinheiro|cash|esp[eé]cie)\b/.test(s)) return 'Dinheiro'
  if (/\bdeb\b/.test(s)) return 'Débito'
  if (/\bcred\b/.test(s)) return 'Crédito'
  return ''
}

const toNumber = (val: any): number | null => {
  if (val === null || val === undefined) return null
  if (typeof val === 'number') return isFinite(val) ? val : null
  const s = String(val).replace(/\s+/g, ' ').replace(/[^\d,.\-]/g, '')
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  const n = parseFloat(normalized)
  return isNaN(n) ? null : n
}

const limpaDescricao = (texto: any): string => {
  let s = (texto ?? '').toString()
  s = s.replace(/\u00A0/g, ' ').trim()
  s = s.replace(/^[\s0-9\-\/\.]+(?=[A-Za-zÀ-ÿ])/u, '')
  s = s.replace(/\b\d[\d\s-]{5,}\b/g, ' ').trim()
  s = s.replace(/\s{2,}/g, ' ').replace(/^[\-–—]+\s*/, '').trim()
  return s
}

/* =========================
   PARSER OCR (embutido)
========================= */

type ParsedReceipt = {
  estabelecimento?: string
  cnpj?: string
  totalBruto?: number
  desconto?: number
  forma?: Forma
}

const MONEY_RX = /(?<!\d)(\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2})(?!\d)/g
const CNPJ_RX  = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/

/** nomes genéricos que não podem ser fornecedor */
const BAD_NAMES_RX = /\b(documento|auxiliar|nota\s*fiscal|cupom\s*fiscal|eletr[oô]nica|eletronico|sat|nfce|consumidor)\b/i

/** remove lixo e invalida nomes genéricos */
function sanitizeFornecedor(raw?: string): string {
  if (!raw) return ''
  const s = raw.replace(/\s+/g, ' ').trim()
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(s)) return ''
  if (BAD_NAMES_RX.test(s)) return ''
  return s.replace(/[.\-–—:;]+$/g, '')
}

function normLine(s: string) {
  return s
    .replace(/[|]+/g, 'I')
    .replace(/[‘’´`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}
function tokenize(texto: string): string[] {
  return texto.split(/\r?\n/).map(normLine).filter(Boolean)
}

function parseMoneyStr(raw?: string | null): number | undefined {
  if (!raw) return undefined
  let s = raw.replace(/[^\d,.\-]/g, '')
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? n : undefined
}
function findFirstMoneyIn(s: string): number | undefined {
  const m = s.match(MONEY_RX)
  if (!m) return
  const nums = m.map(parseMoneyStr).filter((v): v is number => v !== undefined && v >= 0 && v <= 99999.99)
  return nums.at(-1)
}
function isTotalLine(s: string): boolean {
  const x = s.toLowerCase()
  if (/(subtotal|itens|qtd|quantidade|total de itens)/.test(x)) return false
  return /(total a pagar|valor total|vlr total|total geral|\btotal\b)/.test(x)
}
function isDiscountLine(s: string): boolean {
  return /(desconto|desc\.?\b)/i.test(s)
}
function detectFormaPgto(lines: string[]): Forma {
  const t = lines.join(' ').toLowerCase()
  if (/\bcr[eé]dito\b/.test(t)) return 'Crédito'
  if (/\bd[eé]bito\b/.test(t)) return 'Débito'
  if (/\bpix\b/.test(t)) return 'Pix'
  if (/\b(dinheiro|esp[eé]cie)\b/.test(t)) return 'Dinheiro'
  return ''
}
function isCandidateName(s?: string) {
  if (!s) return false
  const hasLetters = /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(s)
  if (!hasLetters) return false
  if (BAD_NAMES_RX.test(s)) return false
  if (MONEY_RX.test(s) || CNPJ_RX.test(s)) return false
  return true
}
function detectCNPJAndEstabelecimento(
  lines: string[]
): { cnpj?: string; estabelecimento?: string } {
  let cnpj: string | undefined

  // onde o cabeçalho normalmente termina
  const STOP_RX =
    /\b(documento|doc\.?|cupom|extrato|nota|nfce|sat|danfce?|itens?|item|descri[cç][aã]o|qtd)\b/i

  // linhas que parecem endereço/metadata (ignorar)
  const ADDRESS_RX =
    /\b(rua|r\.|avenida|av\.?|rodovia|km|bairro|jardim|cep|tel|telefone|ie|inscri[cç][aã]o|loja|pdv|cidade|estado)\b/i

  // palavras típicas de razão social
  const COMPANY_WORD_RX =
    /\b(ltda|eireli|me|s\/?a|sa|com[eé]rcio|distribuidora|atacado|mercado|supermercado|center|carnes)\b/i

  const clean = (s: string) =>
    s.replace(/[^\p{L}\p{N}\s\/&.\-]/gu, '').replace(/\s+/g, ' ').trim()

  // captura CNPJ (se existir)
  for (const ln of lines) {
    const m = ln.match(CNPJ_RX)
    if (m) { cnpj = m[0]; break }
  }

  // pega o "cabeçalho" (do início até DOCUMENTO/CUPOM/ITENS… ou até 18 linhas)
  let end = lines.findIndex(l => STOP_RX.test(l))
  if (end < 0) end = Math.min(18, lines.length)
  const header = lines.slice(0, end).map(clean).filter(Boolean)

  // candidatos de nome
  const candidates: string[] = []

  // 1) junta linhas adjacentes que contenham palavras de empresa
  for (let i = 0; i < header.length; i++) {
    const a = header[i]
    if (!a || ADDRESS_RX.test(a)) continue
    const b = header[i + 1] && !ADDRESS_RX.test(header[i + 1]) ? header[i + 1] : ''
    if (COMPANY_WORD_RX.test(a) || (b && COMPANY_WORD_RX.test(b))) {
      const joined = (a + ' ' + b).trim()
      if (joined.length >= 8) candidates.push(joined)
    }
  }

  // 2) linhas únicas fortes (letras suficientes e não parecem endereço)
  for (const s of header) {
    if (ADDRESS_RX.test(s)) continue
    const letters = (s.match(/\p{L}/gu) || []).length
    if (letters >= 6) candidates.push(s)
  }

  // 3) caso especial: Sendas + Distribuidora em linhas separadas
  const hasSendas = header.some(s => /sendas/i.test(s))
  const hasDistrib = header.some(s => /\bdistribuidora\b/i.test(s))
  if (hasSendas && hasDistrib) {
    candidates.unshift('Sendas Distribuidora S/A')
  }

  // escolhe o "melhor" candidato
  const score = (s: string) => {
    const letters = (s.match(/\p{L}/gu) || []).length
    const uppers = (s.match(/[A-ZÀ-Ö]/g) || []).length
    const upperRatio = letters ? uppers / letters : 0
    let sc = letters
    if (upperRatio > 0.6) sc += 4
    if (COMPANY_WORD_RX.test(s)) sc += 3
    if (/\b(distribuidora|supermercado|mercado|atacado|carnes|center)\b/i.test(s)) sc += 1
    return sc
  }

  const best = candidates.sort((a, b) => score(b) - score(a))[0]
  const estabelecimento = best ? best.replace(/\s{2,}/g, ' ').trim() : undefined

  return { cnpj, estabelecimento }
}

function detectDiscount(lines: string[]): number | undefined {
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    if (isDiscountLine(ln)) {
      const vSame = findFirstMoneyIn(ln)
      if (vSame !== undefined) return vSame
      for (let k = 1; k <= 2; k++) {
        const v = findFirstMoneyIn(lines[i + k] || '')
        if (v !== undefined) return v
      }
    }
  }
  return undefined
}
function detectTotal(lines: string[]): number | undefined {
  for (let i = lines.length - 1; i >= 0; i--) {
    const ln = lines[i]
    if (isTotalLine(ln)) {
      const vSame = findFirstMoneyIn(ln)
      if (vSame !== undefined) return vSame
      for (let k = 1; k <= 2; k++) {
        const v = findFirstMoneyIn(lines[i + k] || '')
        if (v !== undefined) return v
      }
    }
  }
  for (let i = lines.length - 1; i >= 0; i--) {
    const v = findFirstMoneyIn(lines[i])
    if (v !== undefined && v >= 5) return v
  }
  return undefined
}
function parseReceiptBR(textoOCR: string): ParsedReceipt {
  const lines = tokenize(textoOCR)
  const { cnpj, estabelecimento } = detectCNPJAndEstabelecimento(lines)
  const desconto = detectDiscount(lines)
  const totalBruto = detectTotal(lines)
  const forma = detectFormaPgto(lines)
  return { cnpj, estabelecimento, desconto, totalBruto, forma }
}
function formatBR(n?: number) {
  if (n === undefined) return ''
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function isFornecedorRuim(s?: string) {
  if (!s) return true
  const raw = s.replace(/\s+/g, '')
  const letters = raw.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '')
  const digitsPunct = raw.length - letters.length
  return letters.length < 3 && digitsPunct >= 5
}
function detectValorPago(textoOCR: string): number | undefined {
  const lines = tokenize(textoOCR)
  const rxList = [
    /valor\s*pago\b/i,
    /valor\s*a\s*pagar\b/i,
    /vlr\s*a\s*pagar\b/i,
    /total\s*a\s*pagar\b/i,
    /\ba\s*pagar\b/i,
  ]
  for (const rx of rxList) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const ln = lines[i]
      if (rx.test(ln)) {
        const same = findFirstMoneyIn(ln)
        if (same !== undefined) return same
        for (let k = 1; k <= 2; k++) {
          const v = findFirstMoneyIn(lines[i + k] || '')
          if (v !== undefined) return v
        }
      }
    }
  }
  return undefined
}

/* =========================
   NORMALIZAÇÃO DE ITENS
========================= */
const ITEM_ALIASES: Array<[RegExp, string]> = [
  // Batata congelada (CHIC/CHIPS/CONG)
  [/(^|\s)(bat|bat\s*cong|cong|chic|chips)\b/i, 'Batata Congelada'],
  // Mussarela fatiada (Rondolac FT / MUSS FT)
  [/(muss|mussarela).*?(rondolac|rondo)?\s*.*\bft\b/i, 'Mussarela Fatiada'],
  // Pimenta Biquinho
  [/(pim|pimenta)\s*biqui?n?ho?.*okker/i, 'Pimenta Biquinho'],
  // Molho para salada (H SALAD / MOLHO SALADA)
  [/\bh\s*salad\b|molho.*salad/i, 'Molho para Salada'],
  // Saco de lixo (SAC ASSAÍ / 58x70)
  [/(sac(o)?\s*assai|saco\s*assai|58x?70)/i, 'Saco de Lixo'],
  // Refrigerante Coca 350
  [/ref\s*coca\s*cola.*350/i, 'Refrigerante Coca-Cola 350ml'],
]
function extraiMedida(s: string): string {
  const m = s.match(/(\d+(?:[,.]\d+)?)\s*(kg|g|ml|l)\b/i)
  if (!m) return ''
  return (m[1] + m[2]).replace(',', '.')
}
function normalizaDescricaoItem(raw: any): string {
  let s = limpaDescricao(raw)
  let nome = s
  for (const [rx, pretty] of ITEM_ALIASES) {
    if (rx.test(s)) { nome = pretty; break }
  }
  const medida = extraiMedida(s)
  return medida ? `${nome} ${medida}` : nome
}

/* =========================
   COMPONENTE
========================= */

export default function UploadNotaPage() {
  const [preview, setPreview] = useState<string | null>(null)

  const [dados, setDados] = useState<DadosNota>({
    fornecedor: '',
    forma_pagamento: '',
    valor_total: '',
    total_bruto: '',
    desconto: '',
  })

  const [iaData, setIaData] = useState<any | null>(null)
  const [erroIa, setErroIa] = useState<string | null>(null)
  const [salvandoItens, setSalvandoItens] = useState(false)

  // zoom
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)
  const abrirZoom = () => { if (preview) { setZoomSrc(preview); setZoomOpen(true) } }
  const fecharZoom = () => { setZoomOpen(false); setTimeout(() => setZoomSrc(null), 200) }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const limparTudo = () => {
    setPreview(null)
    setDados({ fornecedor: '', forma_pagamento: '', valor_total: '', total_bruto: '', desconto: '' })
    setIaData(null)
    setErroIa(null)
    setSalvandoItens(false)
    setZoomOpen(false)
    setZoomSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Upload + OCR + IA
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // limpa o formulário para não “herdar” nota anterior
    setDados({ fornecedor: '', forma_pagamento: '', valor_total: '', total_bruto: '', desconto: '' })

    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    try {
      setErroIa(null)
      setIaData(null)

      const form = new FormData()
      form.append('file', file)

      const resp = await fetch('/api/extrair-nota', { method: 'POST', body: form })
      const json = await resp.json().catch(() => null)

      if (!resp.ok || !json) {
        setErroIa(`Falha HTTP ${resp.status}: ${resp.statusText}`)
        return
      }
      if (!json.ok) {
        setErroIa(json.error || 'IA não retornou dados.')
        return
      }

      const d = json.data || {}
      setIaData(d)

      // 1) Dados estruturados vindos da IA
      const fornecedorSrv: string | undefined = d.fornecedor || d.estabelecimento
      const formaSrv = normalizaFormaPagamento(
        d.forma_pagamento || d.formaPagamento || d.pagamento || d.metodoPagamento
      )
      const totalPagoNum =
        typeof d.valor_total === 'number' && d.valor_total > 0 ? d.valor_total :
        typeof d.total === 'number' && d.total > 0 ? d.total : undefined
      const brutoNum = typeof d.total_bruto === 'number' ? d.total_bruto : undefined
      const descontoNum = typeof d.desconto === 'number' ? d.desconto : undefined

      // 2) Texto bruto do OCR para fallback
      const textoOCR: string = d.texto || d.text || d.ocr || d.raw || d.fullText || ''

      // Parser de fallback
      let parsed: ParsedReceipt | null = null
      if (textoOCR && typeof textoOCR === 'string') {
        parsed = parseReceiptBR(textoOCR)
      }

      // >>> Fornecedor: usar **exatamente** o nome da NF (IA ou OCR), sem apelidos
      const fornecedorSrvClean   = sanitizeFornecedor(fornecedorSrv)
      const parsedEstabelecClean = sanitizeFornecedor(parsed?.estabelecimento)
      let fornecedorCandidato  = fornecedorSrvClean || parsedEstabelecClean || ''
      if (isFornecedorRuim(fornecedorCandidato)) fornecedorCandidato = ''

      // Valor pago: IA > OCR ("pago/a pagar") > (bruto - desconto)
      const valorPagoFinal =
        totalPagoNum !== undefined
          ? totalPagoNum
          : (textoOCR ? detectValorPago(textoOCR) : undefined) ??
            (brutoNum !== undefined && descontoNum !== undefined
              ? +(brutoNum - descontoNum).toFixed(2)
              : undefined)

      const totalBrutoFinal = brutoNum !== undefined ? brutoNum : parsed?.totalBruto
      const descontoFinal   = descontoNum !== undefined ? descontoNum : parsed?.desconto
      const formaFinal      = (formaSrv || parsed?.forma || '') as Forma

      setDados(old => ({
        fornecedor: fornecedorCandidato || old.fornecedor,
        forma_pagamento: formaFinal || old.forma_pagamento,
        valor_total:  valorPagoFinal   !== undefined ? formatBR(valorPagoFinal)   : old.valor_total,
        total_bruto:  totalBrutoFinal  !== undefined ? formatBR(totalBrutoFinal)  : old.total_bruto,
        desconto:     descontoFinal    !== undefined ? formatBR(descontoFinal)    : old.desconto,
      }))
    } catch (err: any) {
      console.error('❌ Erro ao enviar para o endpoint:', err)
      setErroIa(err?.message || 'Erro desconhecido ao chamar o endpoint.')
    }
  }

  const salvarNoSupabase = async () => {
    if (!dados.fornecedor || !dados.valor_total) {
      alert('Preencha fornecedor e valor total (pago) antes de salvar!')
      return
    }
    const valorPago = parseFloat(dados.valor_total.replace(/\./g, '').replace(',', '.'))
    const { error } = await supabase.from('saida').insert([{
      data: new Date().toISOString().slice(0,10),
      fornecedor: dados.fornecedor,
      descricao: 'Nota Fiscal (OCR)',
      valor: valorPago,
      forma_pagamento_id: dados.forma_pagamento
    }])
    if (error) {
      console.error('Erro ao salvar:', error.message)
      alert('❌ Erro ao salvar no Supabase.')
    } else {
      alert('✅ Salvo com sucesso!')
    }
  }

  const salvarItensEmInsumos = async () => {
    if (!iaData?.itens?.length) { alert('Nenhum item da IA para salvar.'); return }
    setSalvandoItens(true)
    try {
      const upserts: Array<{ nome_insumo: string; preco_unitario: number | null }> = []
      for (const raw of iaData.itens) {
        const nome = normalizaDescricaoItem(raw?.descricao)
        if (!nome) continue
        let unit = toNumber(raw?.valorUnitario)
        const qtd = toNumber(raw?.quantidade)
        const sub = toNumber(raw?.subtotal)
        if ((unit === null || isNaN(unit)) && sub !== null && qtd !== null && qtd > 0) {
          unit = +(sub / qtd).toFixed(2)
        }
        upserts.push({ nome_insumo: nome, preco_unitario: unit ?? null })
      }
      if (!upserts.length) { alert('Itens sem descrição válida.'); return }
      const { error } = await supabase.from('insumos').upsert(upserts, { onConflict: 'nome_norm' })
      if (error) throw error
      alert('✅ Itens atualizados/criados em "insumos".')
    } catch (e: any) {
      console.error('Falha ao salvar itens em insumos:', e?.message || e)
      alert('❌ Falha ao salvar itens em "insumos". Veja o console.')
    } finally {
      setSalvandoItens(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h2 className="mb-4 text-2xl font-bold text-white drop-shadow">Upload de Nota Fiscal (OCR)</h2>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Escolher arquivo</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange}
              className="w-full rounded-lg border border-gray-400 bg-gray-50 p-2 text-base font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Forma de pagamento</label>
            <select value={dados.forma_pagamento}
              onChange={(e)=>setDados({...dados, forma_pagamento: e.target.value as Forma})}
              className="w-full rounded-lg border border-gray-400 bg-gray-50 p-2 text-base font-bold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600">
              <option value="">Selecione...</option>
              <option value="Pix">Pix</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fornecedor</label>
            <input type="text" value={dados.fornecedor}
              onChange={(e)=>setDados({...dados, fornecedor: e.target.value})}
              placeholder="Ex: Assaí"
              className="w-full rounded-lg border border-gray-400 bg-gray-50 p-2 font-bold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Valor Total (R$) — pago</label>
            <input type="text" value={dados.valor_total}
              onChange={(e)=>setDados({...dados, valor_total: e.target.value})}
              placeholder="Ex: 178,10"
              className="w-full rounded-lg border border-gray-400 bg-gray-50 p-2 font-bold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Total Bruto (R$)</label>
            <input type="text" value={dados.total_bruto}
              onChange={(e)=>setDados({...dados, total_bruto: e.target.value})}
              placeholder="Ex: 186,10"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Desconto (R$)</label>
            <input type="text" value={dados.desconto}
              onChange={(e)=>setDados({...dados, desconto: e.target.value})}
              placeholder="Ex: 0,50"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>
        </div>

        {preview && (
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <div className="relative">
              <img src={preview} alt="Nota Fiscal"
                className="mx-auto max-h-72 rounded-lg border shadow cursor-zoom-in transition-transform duration-300 hover:scale-[1.25]"
                onClick={abrirZoom}/>
              <button type="button" onClick={abrirZoom}
                className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow"
                title="Ampliar imagem">🔍 Ampliar</button>
            </div>
            <button onClick={limparTudo} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
              Excluir imagem
            </button>
          </div>
        )}

        {zoomOpen && zoomSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
               onClick={fecharZoom} role="dialog" aria-modal="true">
            <img src={zoomSrc} alt="Nota ampliada"
                 className="max-h-[95vh] max-w-[95vw] rounded-lg shadow-2xl"
                 onClick={(e)=>e.stopPropagation()}/>
            <button onClick={fecharZoom}
              className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 shadow">
              Fechar
            </button>
          </div>
        )}

        {erroIa && (
          <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-800">{erroIa}</p>
        )}

        {iaData?.itens?.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-bold text-gray-800">Itens da Nota</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="border px-2 py-2 text-left font-bold">Descrição</th>
                  <th className="border px-2 py-2 text-left font-bold">Quantidade</th>
                  <th className="border px-2 py-2 text-left font-bold">Valor Unit.</th>
                  <th className="border px-2 py-2 text-left font-bold">Subtotal</th>
                </tr>
                </thead>
                <tbody>
                {iaData.itens.map((item: any, idx: number) => {
                  const nomePretty = normalizaDescricaoItem(item.descricao)
                  return (
                    <tr key={idx} className="odd:bg-gray-50">
                      <td className="border px-2 py-2 font-semibold text-gray-900">{nomePretty}</td>
                      <td className="border px-2 py-2 text-gray-800">{item.quantidade ?? '-'}</td>
                      <td className="border px-2 py-2 text-gray-800">{item.valorUnitario ?? '-'}</td>
                      <td className="border px-2 py-2 text-gray-800">{item.subtotal ?? '-'}</td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={salvarItensEmInsumos} disabled={salvandoItens}
                className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow disabled:opacity-50">
                {salvandoItens ? 'Salvando itens...' : 'Salvar itens em Insumos (beta)'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={salvarNoSupabase}
            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow">
            Salvar no Supabase
          </button>
        </div>
      </div>
    </div>
  )
}
