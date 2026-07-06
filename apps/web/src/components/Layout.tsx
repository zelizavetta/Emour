import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'

const nav = [
  { to: '/', label: 'Главная', icon: '⊙' },
  { to: '/statistics', label: 'Статистика', icon: '◫' },
  { to: '/notes', label: 'Дневник', icon: '✎' },
  { to: '/meds', label: 'Таблетки', icon: '⊕' },
]

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.logo}>EMOUR</div>
        <nav style={s.nav}>
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}
            >
              <span style={s.icon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <button style={s.logout} onClick={logout}>Выйти</button>
      </aside>
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    height: '100%',
  },
  sidebar: {
    width: 'var(--sidebar-w)',
    minHeight: '100vh',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0,
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 3,
    color: 'var(--primary)',
    padding: '0 24px 32px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: 2,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 24px',
    color: 'var(--text-muted)',
    borderRadius: 0,
    transition: 'background 0.15s, color 0.15s',
    cursor: 'pointer',
  },
  linkActive: {
    color: 'var(--text)',
    background: 'rgba(250,87,183,0.1)',
    borderRight: '2px solid var(--primary)',
  },
  icon: { fontSize: 18, width: 20, textAlign: 'center' },
  logout: {
    margin: '24px',
    padding: '8px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
}
