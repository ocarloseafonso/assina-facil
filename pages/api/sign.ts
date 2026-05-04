import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { sendSignedConfirmation } from '@/lib/mailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { token, signedName } = req.body

  if (!token || !signedName) return res.status(400).json({ error: 'Dados inválidos' })

  // Buscar signatário pelo token
  const { data: signatory, error } = await supabase
    .from('signatories')
    .select('*, contracts(*)')
    .eq('token', token)
    .single()

  if (error || !signatory) return res.status(404).json({ error: 'Link inválido ou não encontrado' })
  if (signatory.signed_at) return res.status(400).json({ error: 'Contrato já foi assinado' })

  // IP do signatário
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'desconhecido'
  const signedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  // Atualizar assinatura
  const { error: updateError } = await supabase
    .from('signatories')
    .update({ signed_at: new Date().toISOString(), signed_name: signedName, ip_address: ip })
    .eq('token', token)

  if (updateError) return res.status(500).json({ error: 'Erro ao registrar assinatura' })

  // Enviar confirmação por e-mail
  await sendSignedConfirmation({
    toEmail: signatory.email,
    toName: signatory.name,
    contractTitle: signatory.contracts.title,
    signedAt,
    ip,
  })

  // Também notificar o remetente
  await sendSignedConfirmation({
    toEmail: signatory.contracts.sender_email,
    toName: signatory.name,
    contractTitle: signatory.contracts.title,
    signedAt,
    ip,
  })

  return res.status(200).json({ success: true, signedAt, ip })
}
