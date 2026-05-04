import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'

interface Props {
  signatory: {
    id: string
    name: string
    email: string
    token: string
    signed_at: string | null
  }
  contract: {
    title: string
    sender_name: string
    pdf_url: string | null
    template_content: string | null
    type: string
  }
}

export default function AssinarPage({ signatory, contract }: Props) {
  const [signedName, setSignedName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [signedAt, setSignedAt] = useState('')

  if (signatory.signed_at || done) {
    return (
      <div style={pageStyle}>
        <Head><title>Contrato assinado · AssinaFácil</title></Head>
        <div style={cardStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px', fontStyle: 'italic' }}>Assinatura registrada</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
            <strong>{contract.title}</strong>
          </p>
          {signedAt && (
            <div style={{ background: '#f0faf5', border: '1px solid #a8d5b5', borderRadius: 6, padding: 16, fontSize: 13, color: '#2d6a4f' }}>
              <p style={{ margin: 0 }}>Assinado por: <strong>{signedName || signatory.name}</strong></p>
              <p style={{ margin: '4px 0 0' }}>Data/hora: {signedAt}</p>
            </div>
          )}
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 24 }}>
            Uma confirmação foi enviada para {signatory.email}
          </p>
        </div>
      </div>
    )
  }

  const handleSign = async () => {
    if (!signedName.trim()) return alert('Digite seu nome completo para assinar')
    if (!agreed) return alert('Confirme que leu e concorda com o contrato')

    setLoading(true)
    const res = await fetch('/api/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: signatory.token, signedName }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setSignedAt(data.signedAt)
      setDone(true)
    } else {
      alert(data.error || 'Erro ao assinar')
    }
  }

  return (
    <div style={pageStyle}>
      <Head>
        <title>Assinar: {contract.title} · AssinaFácil</title>
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 8px' }}>AssinaFácil</p>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 6px', fontStyle: 'italic' }}>{contract.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>Enviado por <strong>{contract.sender_name}</strong> para <strong>{signatory.name}</strong></p>
        </div>

        {/* Contrato */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: '#fafaf9' }}>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)' }}>
              {contract.type === 'pdf' ? '📄 Documento PDF' : '📝 Contrato'}
            </p>
          </div>

          {contract.type === 'pdf' && contract.pdf_url ? (
            <iframe
              src={contract.pdf_url}
              style={{ width: '100%', height: 520, border: 'none', display: 'block' }}
              title="Contrato"
            />
          ) : (
            <div style={{ padding: '28px 32px', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap', maxHeight: 520, overflowY: 'auto' }}>
              {contract.template_content}
            </div>
          )}
        </div>

        {/* Área de assinatura */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 28 }}>
          <p style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 20px' }}>Sua assinatura</p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
              Digite seu nome completo exatamente como aparece no contrato *
            </label>
            <input
              type="text"
              value={signedName}
              onChange={e => setSignedName(e.target.value)}
              placeholder={signatory.name}
              style={{
                width: '100%', padding: '14px 16px', fontSize: 18, fontFamily: 'Lora, Georgia, serif',
                fontStyle: 'italic', border: '1px solid var(--border)', borderRadius: 4, background: '#fafaf9',
                color: 'var(--ink)', outline: 'none',
              }}
            />
            {signedName && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: signedName.toLowerCase().trim() === signatory.name.toLowerCase().trim() ? 'var(--success)' : 'var(--muted)' }}>
                {signedName.toLowerCase().trim() === signatory.name.toLowerCase().trim() ? '✅ Nome confirmado' : '⚠️ Nome diferente do esperado — você pode continuar mesmo assim'}
              </p>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 24 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
              Declaro que li e compreendi integralmente o contrato acima e que minha assinatura eletrônica
              tem validade jurídica nos termos da MP 2.200-2/2001 e da Lei 14.063/2020.
            </span>
          </label>

          <button
            onClick={handleSign}
            disabled={loading || !signedName || !agreed}
            style={{
              width: '100%', padding: '18px', background: (!signedName || !agreed || loading) ? '#ccc' : 'var(--ink)',
              color: '#fff', border: 'none', borderRadius: 4, fontSize: 16, cursor: (!signedName || !agreed || loading) ? 'not-allowed' : 'pointer',
              fontFamily: 'Lora, Georgia, serif', fontWeight: 600, transition: 'background 0.2s',
            }}
          >
            {loading ? 'Registrando assinatura...' : '✍️ Assinar este contrato'}
          </button>

          <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
            Ao assinar, seu nome, endereço IP e data/hora serão registrados como prova de assinatura.
          </p>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const token = params?.token as string

  const { data: signatory, error } = await supabase
    .from('signatories')
    .select('*, contracts(*)')
    .eq('token', token)
    .single()

  if (error || !signatory) {
    return { notFound: true }
  }

  return {
    props: {
      signatory: {
        id: signatory.id,
        name: signatory.name,
        email: signatory.email,
        token: signatory.token,
        signed_at: signatory.signed_at,
      },
      contract: {
        title: signatory.contracts.title,
        sender_name: signatory.contracts.sender_name,
        pdf_url: signatory.contracts.pdf_url,
        template_content: signatory.contracts.template_content,
        type: signatory.contracts.type,
      },
    },
  }
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--paper)',
  fontFamily: 'Lora, Georgia, serif',
}

const cardStyle: React.CSSProperties = {
  maxWidth: 480,
  margin: '80px auto',
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 48,
  textAlign: 'center',
}
