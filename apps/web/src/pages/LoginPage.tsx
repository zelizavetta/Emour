import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch {
      setError('Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>
      <form style={s.card} onSubmit={handleSubmit}>
        <div style={s.logo}>EMOUR</div>
        <p style={s.subtitle}>дневник настроения</p>
        <input
          style={s.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          style={s.input}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p style={s.error}>{error}</p>}
        <button style={s.button} type="submit" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '48px 40px',
    width: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  logo: {
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: 4,
    color: 'var(--primary)',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 13,
    marginBottom: 16,
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    color: 'var(--text)',
    outline: 'none',
  },
  error: {
    color: 'var(--danger)',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    padding: '12px',
    background: 'var(--primary)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 15,
  },
}
