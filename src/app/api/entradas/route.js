import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { data, valor, descricao, forma } = await request.json();

  console.log("FORMA RECEBIDA:", forma); // debug

  const { error } = await supabase.from("entradas").insert([
    {
      data,
      valor,
      descricao,
      formas_recebimento_id: forma,
    },
  ]);

  if (error) {
    return new Response(JSON.stringify({ message: "Erro ao salvar", error }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({ message: "Entrada salva com sucesso" }),
    { status: 201 }
  );
}
