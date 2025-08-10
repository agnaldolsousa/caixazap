import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const body = await request.json()

  const { data, fornecedor, descricao, valor, forma_pagamento_id } = body

  const { error } = await supabase.from('saida').insert([
    {
      data,
      fornecedor,
      descricao,
      valor,
      forma_pagamento_id
    }
  ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Saída registrada com sucesso!' }, { status: 201 })
}
