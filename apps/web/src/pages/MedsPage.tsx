import { useState } from 'react'
import { useData } from '@/providers/DataProvider'
import { WEEKDAY_LABELS, ALL_WEEKDAYS } from '@emour/core'

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export default function MedsPage() {
  const { meds, addMed, deleteMed, toggleMed, isLoading } = useData()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [times, setTimes] = useState<string[]>([])
  const [timeInput, setTimeInput] = useState('')
  const [days, setDays] = useState<number[]>([...ALL_WEEKDAYS])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() { setName(''); setDosage(''); setTimes([]); setTimeInput(''); setDays([...ALL_WEEKDAYS]); setError('') }

  function toggleDay(v: number) {
    setDays(prev => prev.includes(v) ? (prev.length > 1 ? prev.filter(d => d !== v) : prev) : [...prev, v])
  }

  function addTime() {
    const t = timeInput.trim()
    if (!TIME_RE.test(t)) { setError('Формат: чч:мм (например 08:30)'); return }
    if (!times.includes(t)) setTimes(prev => [...prev, t].sort())
    setTimeInput('')
    setError('')
  }

  async function handleSave() {
    if (!name.trim()) { setError('Укажите название'); return }
    if (times.length === 0) { setError('Добавьте хотя бы одно время'); return }
    setSaving(true)
    try {
      await addMed(name.trim(), dosage.trim(), times, days)
      setShowForm(false)
      reset()
    } catch {
      setError('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Таблетки</h1>
        <button style={s.addBtn} onClick={() => { setShowForm(true); reset() }}>+ Добавить</button>
      </div>

      <p style={s.hint}>Уведомления о приёме настраиваются в мобильном приложении.</p>

      {showForm && (
        <div style={s.form}>
          <p style={s.formTitle}>Новое лекарство</p>
          <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Название" />
          <input style={s.input} value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Дозировка (необязательно)" />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Дни приёма</p>
          <div style={s.daysRow}>
            {WEEKDAY_LABELS.map(({ value, short }) => (
              <button
                key={value}
                style={{ ...s.dayChip, ...(days.includes(value) ? s.dayChipActive : {}) }}
                onClick={() => toggleDay(value)}
              >{short}</button>
            ))}
          </div>
          <div style={s.timeRow}>
            <input
              style={{ ...s.input, flex: 1, marginBottom: 0 }}
              value={timeInput}
              onChange={e => setTimeInput(e.target.value)}
              placeholder="чч:мм"
              maxLength={5}
              onKeyDown={e => e.key === 'Enter' && addTime()}
            />
            <button style={s.timeAddBtn} onClick={addTime}>+</button>
          </div>
          {times.length > 0 && (
            <div style={s.tags}>
              {times.map(t => (
                <span key={t} style={s.tag}>
                  {t}
                  <button style={s.tagRemove} onClick={() => setTimes(prev => prev.filter(x => x !== t))}>×</button>
                </span>
              ))}
            </div>
          )}
          {error && <p style={s.error}>{error}</p>}
          <div style={s.formActions}>
            <button style={s.cancelBtn} onClick={() => { setShowForm(false); reset() }}>Отмена</button>
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить'}</button>
          </div>
        </div>
      )}

      {isLoading && <p style={s.muted}>Загрузка...</p>}
      {!isLoading && meds.length === 0 && !showForm && <p style={s.muted}>Нет добавленных лекарств</p>}

      <div style={s.list}>
        {meds.map(med => (
          <div key={med.id} style={{ ...s.card, opacity: med.enabled ? 1 : 0.5 }}>
            <div style={s.cardLeft}>
              <p style={s.medName}>{med.name}</p>
              {med.dosage && <p style={s.medDosage}>{med.dosage}</p>}
              <div style={s.timeTags}>
                {med.times.map(t => <span key={t} style={s.timeTag}>{t}</span>)}
              </div>
              {med.days && med.days.length < 7 && (
                <div style={{ ...s.timeTags, marginTop: 4 }}>
                  {WEEKDAY_LABELS.filter(w => med.days.includes(w.value)).map(({ value, short }) => (
                    <span key={value} style={{ ...s.timeTag, fontSize: 11, padding: '1px 8px', opacity: 0.8 }}>{short}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={s.cardRight}>
              <label style={s.toggle}>
                <input
                  type="checkbox"
                  checked={med.enabled}
                  onChange={() => toggleMed(med.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ ...s.toggleTrack, background: med.enabled ? 'var(--secondary)' : 'var(--border)' }}>
                  <span style={{ ...s.toggleThumb, transform: med.enabled ? 'translateX(20px)' : 'translateX(2px)' }} />
                </span>
              </label>
              <button
                style={s.deleteBtn}
                onClick={() => { if (confirm(`Удалить "${med.name}"?`)) deleteMed(med.id) }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', maxWidth: 700, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 700 },
  addBtn: { padding: '8px 20px', background: 'var(--secondary)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' },
  hint: { color: 'var(--text-muted)', fontSize: 12, marginBottom: 24 },
  muted: { color: 'var(--text-muted)', fontSize: 13 },
  form: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20 },
  formTitle: { fontWeight: 600, marginBottom: 12, fontSize: 16 },
  input: { display: 'block', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', marginBottom: 10, outline: 'none', fontSize: 14 },
  daysRow: { display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  dayChip: { width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  dayChipActive: { background: 'var(--secondary)', border: '1px solid var(--secondary)', color: '#fff', fontWeight: 700 },
  timeRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 },
  timeAddBtn: { padding: '10px 16px', background: 'var(--secondary)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { background: 'rgba(154,87,250,0.2)', border: '1px solid var(--secondary)', borderRadius: 20, padding: '4px 10px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  tagRemove: { background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1 },
  error: { color: 'var(--danger)', fontSize: 12, marginBottom: 8 },
  formActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' },
  saveBtn: { padding: '8px 20px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'opacity 0.2s' },
  cardLeft: { flex: 1 },
  medName: { fontWeight: 600, marginBottom: 2 },
  medDosage: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 },
  timeTags: { display: 'flex', gap: 6 },
  timeTag: { background: 'rgba(154,87,250,0.15)', border: '1px solid rgba(154,87,250,0.4)', borderRadius: 10, padding: '2px 10px', fontSize: 12 },
  cardRight: { display: 'flex', alignItems: 'center', gap: 12 },
  toggle: { cursor: 'pointer' },
  toggleTrack: { display: 'block', width: 44, height: 24, borderRadius: 12, position: 'relative', transition: 'background 0.2s' },
  toggleThumb: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s' },
  deleteBtn: { background: 'none', border: 'none', color: 'var(--danger)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' },
}
