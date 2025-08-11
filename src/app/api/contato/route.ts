import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { nome, email, whatsapp, mensagem } = await req.json();

    const resend = new Resend(process.env.RESEND_API_KEY!);

    await resend.emails.send({
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

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return new Response('Erro ao enviar e-mail', { status: 500 });
  }
}
