import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { nome, email, whatsapp, mensagem } = await req.json();

    // 1) Checagem rápida das envs (só loga no Vercel)
    console.log('CONTACT_FROM?', !!process.env.CONTACT_FROM);
    console.log('CONTACT_TO?', !!process.env.CONTACT_TO);
    console.log('RESEND_API_KEY?', process.env.RESEND_API_KEY ? 'OK' : 'MISSING');

    // 2) Monta o texto
    const text = `
Nome: ${nome}
E-mail: ${email}
WhatsApp: ${whatsapp}

Mensagem:
${mensagem}
    `.trim();

    // 3) Dispara no Resend
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const result = await resend.emails.send({
      from: process.env.CONTACT_FROM!,   // ex: 'CaixaZap <onboarding@resend.dev>'
      to: process.env.CONTACT_TO!,       // seu e-mail destino
      subject: `Contato - ${nome}`,
      text,
      headers: { 'Reply-To': email }
    });

    // 4) Logs no servidor (ver em Vercel → Logs)
    console.log('Resend result:', JSON.stringify(result));

    // 5) Retorna pro navegador o que o Resend respondeu
    return Response.json({
      ok: !result.error,
      id: result.data?.id ?? null,
      error: result.error ?? null,
    });
  } catch (e: any) {
    console.error('API /contato error:', e);
    return new Response('Erro ao enviar e-mail', { status: 500 });
  }
}
