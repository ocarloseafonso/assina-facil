import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Head from 'next/head'

interface Signatory {
  name: string
  email: string
}

type ContractType = 'pdf' | 'template'

export default function Home() {
  const [contractType, setContractType] = useState<ContractType>('pdf')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [templateContent, setTemplateContent] = useState('')
  const [contractTitle, setContractTitle] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [signatories, setSignatories] = useState<Signatory[]>([{ name: '', email: '' }])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; whatsappLinks?: { name: string; link: string }[] } | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setPdfFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const addSignatory = () => setSignatories([...signatories, { name: '', email: '' }])
  const removeSignatory = (i: number) => setSignatories(signatories.filter((_, idx) => idx !== i))
  const updateSignatory = (i: number, field: keyof Signatory, value: string) => {
    const updated = [...signatories]
    updated[i][field] = value
    setSignatories(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('contractType', contractType)
      formData.append('contractTitle', contractTitle)
      formData.append('senderName', senderName)
      formData.append('senderEmail', senderEmail)
      formData.append('signatories', JSON.stringify(signatories))
      if (contractType === 'pdf' && pdfFile) formData.append('pdf', pdfFile)
      if (contractType === 'template') formData.append('templateContent', templateContent)

      const res = await fetch('/api/send-contract', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) setResult(data)
      else alert('Erro: ' + data.error)
    } catch (err) {
      alert('Erro ao enviar. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  if (result?.success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <Head><title>AssinaFácil</title></Head>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 8px' }}>Contratos enviados!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Os signatários receberam o e-mail com o link para assinar.</p>

          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 32, textAlign: 'left' }}>
            <p style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Links para WhatsApp</p>
            {result.whatsappLinks?.map((w, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{w.name}</p>
                <a
                  href={w.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-block', background: '#25D366', color: '#fff', padding: '10px 20px', borderRadius: 4, fontSize: 14, textDecoration: 'none' }}
                >
                  📲 Enviar pelo WhatsApp
                </a>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setResult(null); setPdfFile(null); setContractTitle(''); setSignatories([{ name: '', email: '' }]) }}
            style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 4, cursor: 'pointer', fontSize: 15 }}
          >
            Enviar novo contrato
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px' }}>
      <Head>
        <title>AssinaFácil</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 12px' }}>Assinatura Eletrônica</p>
          <h1 style={{ fontSize: 36, fontWeight: 600, margin: 0, fontStyle: 'italic' }}>AssinaFácil</h1>
          <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 15 }}>Envie contratos para assinatura com validade jurídica</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tipo de contrato */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 20 }}>
            <label style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 12 }}>Tipo de contrato</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['pdf', 'template'] as ContractType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setContractType(t)}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
                    border: contractType === t ? '2px solid var(--ink)' : '1px solid var(--border)',
                    background: contractType === t ? 'var(--ink)' : '#fff',
                    color: contractType === t ? '#fff' : 'var(--ink)',
                    fontWeight: contractType === t ? 600 : 400,
                  }}
                >
                  {t === 'pdf' ? '📄 Upload de PDF' : '✏️ Digitar texto'}
                </button>
              ))}
            </div>
          </div>

          {/* Dados do contrato */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 20 }}>
            <label style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 16 }}>Dados do contrato</label>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Título do contrato *</label>
              <input style={inputStyle} placeholder="Ex: Contrato de Prestação de Serviços" value={contractTitle} onChange={e => setContractTitle(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Seu nome *</label>
                <input style={inputStyle} placeholder="Nome do remetente" value={senderName} onChange={e => setSenderName(e.target.value)} required />
              </div>
              <div>
                <label style={labelStyle}>Seu e-mail *</label>
                <input style={inputStyle} type="email" placeholder="voce@empresa.com" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* PDF ou Template */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 20 }}>
            {contractType === 'pdf' ? (
              <>
                <label style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 12 }}>Arquivo PDF</label>
                <div
                  {...getRootProps()}
                  style={{
                    border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6, padding: '32px 16px', textAlign: 'center', cursor: 'pointer',
                    background: isDragActive ? '#fdf5ec' : '#fafaf9',
                    transition: 'all 0.2s',
                  }}
                >
                  <input {...getInputProps()} />
                  {pdfFile ? (
                    <p style={{ margin: 0, color: 'var(--success)', fontWeight: 600 }}>✅ {pdfFile.name}</p>
                  ) : (
                    <>
                      <p style={{ margin: '0 0 4px', fontSize: 32 }}>📄</p>
                      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                        {isDragActive ? 'Solte o PDF aqui...' : 'Arraste o PDF ou clique para selecionar'}
                      </p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <label style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 12 }}>Conteúdo do contrato</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 200, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }}
                  placeholder="Digite aqui o texto completo do contrato..."
                  value={templateContent}
                  onChange={e => setTemplateContent(e.target.value)}
                  required={contractType === 'template'}
                />
              </>
            )}
          </div>

          {/* Signatários */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <label style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)' }}>Signatários</label>
              <button type="button" onClick={addSignatory} style={{ background: 'none', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: 'var(--ink)' }}>
                + Adicionar
              </button>
            </div>

            {signatories.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  {i === 0 && <label style={labelStyle}>Nome</label>}
                  <input style={inputStyle} placeholder="Nome completo" value={s.name} onChange={e => updateSignatory(i, 'name', e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  {i === 0 && <label style={labelStyle}>E-mail</label>}
                  <input style={inputStyle} type="email" placeholder="email@cliente.com" value={s.email} onChange={e => updateSignatory(i, 'email', e.target.value)} required />
                </div>
                {signatories.length > 1 && (
                  <button type="button" onClick={() => removeSignatory(i)} style={{ background: 'none', border: '1px solid #f0d0d0', color: '#c0392b', padding: '10px 12px', borderRadius: 4, cursor: 'pointer', marginBottom: 1 }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#888' : 'var(--ink)', color: '#fff',
              border: 'none', padding: '18px', borderRadius: 4, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Lora, Georgia, serif', fontWeight: 600, letterSpacing: 1,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Enviando...' : 'Enviar para assinatura →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 24 }}>
          Assinatura eletrônica com validade jurídica conforme MP 2.200-2/2001 · Lei 14.063/2020
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
  borderRadius: 4, fontSize: 15, fontFamily: 'Lora, Georgia, serif',
  background: '#fafaf9', color: 'var(--ink)', outline: 'none',
}
