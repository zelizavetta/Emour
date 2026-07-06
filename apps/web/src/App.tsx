import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/providers/AuthProvider'
import { DataProvider } from '@/providers/DataProvider'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import StatisticsPage from '@/pages/StatisticsPage'
import NotesPage from '@/pages/NotesPage'
import MedsPage from '@/pages/MedsPage'

function AppRoutes() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 700, letterSpacing: 4 }}>EMOUR</div>
      </div>
    )
  }

  if (!token) return <LoginPage />

  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/meds" element={<MedsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
