import nodemailer from 'nodemailer'

// Criado como função para garantir leitura das env vars em runtime (não no boot do módulo)
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: (Number(process.env.SMTP_PORT) || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendSignatureRequest({
  toName,
  toEmail,
  signLink,
  contractTitle,
  senderName,
}: {
  toName: string
  toEmail: string
  signLink: string
  contractTitle: string
  senderName: string
}) {
  const whatsappText = encodeURIComponent(
    `Olá ${toName}, você recebeu o contrato "${contractTitle}" para assinar. Acesse o link: ${signLink}`
  )
  const whatsappLink = `https://wa.me/?text=${whatsappText}`

  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"${senderName}" <${process.env.SMTP_FROM}>`,
    to: toEmail,
    bcc: process.env.SMTP_FROM, // Cópia para o remetente
    subject: `Contrato para assinar: ${contractTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; background:#f9f6f0; margin:0; padding:40px 0;">
        <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:8px; padding:48px; border:1px solid #e8e0d0;">
          <p style="font-size:13px; color:#888; letter-spacing:2px; text-transform:uppercase; margin:0 0 32px;">Assinatura de Contrato</p>
          <h2 style="font-size:24px; color:#1a1a1a; margin:0 0 16px;">${contractTitle}</h2>
          <p style="font-size:16px; color:#444; line-height:1.6; margin:0 0 32px;">
            Olá, <strong>${toName}</strong>.<br><br>
            <strong>${senderName}</strong> enviou um contrato para sua assinatura eletrônica.
          </p>
          <a href="${signLink}" style="display:inline-block; background:#1a1a1a; color:#fff; padding:16px 32px; border-radius:4px; text-decoration:none; font-size:15px; font-weight:bold;">
            Visualizar e Assinar
          </a>
          <p style="font-size:13px; color:#999; margin:32px 0 0;">
            Ou copie este link no navegador:<br>
            <span style="color:#555;">${signLink}</span>
          </p>
          <hr style="border:none; border-top:1px solid #e8e0d0; margin:32px 0;">
          <p style="font-size:12px; color:#bbb; margin:0;">
            Ao assinar, você declara que leu e concorda com os termos do contrato. 
            Sua assinatura eletrônica tem validade jurídica conforme a MP 2.200-2/2001.
          </p>
        </div>
      </body>
      </html>
    `,
  })

  return { whatsappLink }
}

export async function sendSignedConfirmation({
  toEmail,
  toName,
  contractTitle,
  signedAt,
  ip,
}: {
  toEmail: string
  toName: string
  contractTitle: string
  signedAt: string
  ip: string
}) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"AssinaFácil" <${process.env.SMTP_FROM}>`,
    to: toEmail,
    subject: `✅ Contrato assinado: ${contractTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; background:#f9f6f0; margin:0; padding:40px 0;">
        <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:8px; padding:48px; border:1px solid #e8e0d0;">
          <p style="font-size:13px; color:#2d7a4f; letter-spacing:2px; text-transform:uppercase; margin:0 0 32px;">✅ Assinatura Confirmada</p>
          <h2 style="font-size:24px; color:#1a1a1a; margin:0 0 16px;">${contractTitle}</h2>
          <p style="font-size:16px; color:#444; line-height:1.6;">
            <strong>${toName}</strong> assinou este contrato.
          </p>
          <div style="background:#f9f6f0; border-radius:6px; padding:20px; margin:24px 0;">
            <p style="margin:0; font-size:13px; color:#666;"><strong>Data/hora:</strong> ${signedAt}</p>
            <p style="margin:8px 0 0; font-size:13px; color:#666;"><strong>IP:</strong> ${ip}</p>
          </div>
          <p style="font-size:12px; color:#bbb; margin:0;">
            Este registro serve como prova de assinatura eletrônica nos termos da legislação brasileira.
          </p>
        </div>
      </body>
      </html>
    `,
  })
}
