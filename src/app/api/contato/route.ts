import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { nome, email, whatsapp, mensagem } = await req.json();

    // 📌 Log para debug
    console.log("📩 Dados recebidos do formulário:", { nome, email, whatsapp, mensagem });

    const resend = new Resend(process.env.RESEND_API_KEY!);

    const resultado = await resend.emails.send({
      from: process.env.CONTACT_FROM!,   // ex: "CaixaZap <onboarding@resend.dev>"
      to: process.env.CONTACT_TO!,       // seu e-mail de destino
      subject: `Contato - ${nome}`,
      text: `
Nome: ${nome}
E-mail: ${email}
WhatsApp: ${whatsapp}

Mensagem:
${mensagem}
      `.trim(),
      headers: {
        'Reply-To': email                // permite responder direto ao cliente
      }
    });

    // 📌 Log para debug
    console.log("📬 Resposta da API Resend:", resultado);

    return Response.json({ ok: true, resultado });
  } catch (e) {
    console.error("❌ Erro ao enviar e-mail:", e);
    return new Response('Erro ao enviar e-mail', { status: 500 });
  }
}
