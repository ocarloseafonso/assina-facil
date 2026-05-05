import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Se já estiver logado, redireciona direto para a home
    if (localStorage.getItem('assinafacil_auth') === 'true') {
      router.push('/')
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (email === 'admin@ceafonso.com.br' && password === 'Panduda3011*') {
      localStorage.setItem('assinafacil_auth', 'true')
      router.push('/')
    } else {
      setError('E-mail ou senha incorretos.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Head>
        <title>Login · AssinaFácil</title>
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ maxWidth: 400, width: '100%', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 8px' }}>Área Restrita</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, fontStyle: 'italic', fontFamily: 'Lora, Georgia, serif' }}>C.E. Afonso</h1>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

          <button
            type="submit"
            style={{
              width: '100%', background: 'var(--ink)', color: '#fff',
              border: 'none', padding: '14px', borderRadius: 4, fontSize: 15, cursor: 'pointer',
              fontFamily: 'Lora, Georgia, serif', fontWeight: 600, transition: 'background 0.2s',
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid var(--border)',
  borderRadius: 4, fontSize: 15, fontFamily: 'Lora, Georgia, serif',
  background: '#fafaf9', color: 'var(--ink)', outline: 'none',
}
