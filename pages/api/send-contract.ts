import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import { sendSignatureRequest } from '@/lib/mailer'
import { v4 as uuidv4 } from 'uuid'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Criado aqui para usar variáveis de ambiente avaliadas em runtime (não no build)
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  const form = new IncomingForm({ keepExtensions: true })

  form.parse(req, async (err, fields: Fields, files: Files) => {
    if (err) return res.status(500).json({ error: 'Erro ao processar formulário' })

    try {
      const get = (f: string) => Array.isArray(fields[f]) ? fields[f]![0] : (fields[f] as unknown) as string
      const contractType = get('contractType') as 'pdf' | 'template'
      const contractTitle = get('contractTitle')
      const senderName = 'C.E. Afonso Soluções Digitais'
      const senderEmail = 'juridico@ceafonso.com.br'
      const signatories: { name: string; email: string }[] = JSON.parse(get('signatories') || '[]')
      const templateContent = get('templateContent') || null

      // Upload PDF se necessário
      let pdfUrl: string | null = null
      if (contractType === 'pdf') {
        const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf
        if (!pdfFile) return res.status(400).json({ error: 'PDF não encontrado' })

        const pdfBuffer = fs.readFileSync(pdfFile.filepath)
        const fileName = `${uuidv4()}.pdf`

        const { error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(fileName, pdfBuffer, { contentType: 'application/pdf' })

        if (uploadError) return res.status(500).json({ error: 'Erro ao fazer upload do PDF: ' + uploadError.message })

        const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(fileName)
        pdfUrl = urlData.publicUrl
      }

      // Salvar contrato no banco
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          title: contractTitle,
          sender_name: senderName,
          sender_email: senderEmail,
          pdf_url: pdfUrl,
          template_content: templateContent,
          type: contractType,
        })
        .select()
        .single()

      if (contractError) return res.status(500).json({ error: 'Erro ao salvar contrato: ' + contractError.message })

      // Criar signatários e enviar e-mails
      const whatsappLinks: { name: string; link: string; text: string }[] = []

      for (const signatory of signatories) {
        const token = uuidv4()
        const { error: sigError } = await supabase.from('signatories').insert({
          contract_id: contract.id,
          name: signatory.name,
          email: signatory.email,
          token,
        })
        if (sigError) {
          console.error('Erro ao inserir signatário:', sigError)
          return res.status(500).json({ error: 'Erro ao salvar signatário: ' + sigError.message })
        }

        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
        const signLink = `${appUrl}/assinar/${token}`

        const { whatsappLink } = await sendSignatureRequest({
          toName: signatory.name,
          toEmail: signatory.email,
          signLink,
          contractTitle,
          senderName,
        })

        const whatsappText = `Olá ${signatory.name}, você recebeu o contrato "${contractTitle}" para assinar. Acesse o link: ${signLink}`

        whatsappLinks.push({ name: signatory.name, link: whatsappLink, text: whatsappText })
      }

      return res.status(200).json({ success: true, contractId: contract.id, whatsappLinks })
    } catch (innerErr: any) {
      console.error('Catch-all erro:', innerErr)
      return res.status(500).json({ error: 'Erro inesperado: ' + innerErr.message })
    }
  })
}
