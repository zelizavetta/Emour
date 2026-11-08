import { useState } from 'react'
import { FeelingType } from '@emour/core'
import { useData } from '@/providers/DataProvider'
import { symptomItems } from '@/constants/data'

type SliderProps = {
  label: string
  type: FeelingType
  value: number
  onChange: (v: number) => void
  onSubmit: () => void
  loading: boolean
}

function FeelingSlider({ label, type, value, onChange, onSubmit, loading }: SliderProps) {
  const colors: Record<FeelingType, string> = {
    mood: '#FA57B7',
    energy: '#9E57FA',
    anxiety: '#fbee00',
  }
  const color = colors[type]

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={s.cardTitle}>{label}</span>
        <span style={{ ...s.score, color }}>{value}/5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ '--thumb-color': color } as React.CSSProperties}
      />
      <div style={s.ticks}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} style={{ ...s.tick, color: n === value ? color : 'var(--text-muted)' }}>{n}</span>
        ))}
      </div>
      <button style={{ ...s.btn, background: color }} onClick={onSubmit} disabled={loading}>
        Записать
      </button>
    </div>
  )
}

export default function HomePage() {
  const { addFeeling, addSymptoms, feelings } = useData()
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [anxiety, setAnxiety] = useState(3)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  async function submit(type: FeelingType, score: number) {
    setLoading(type)
    try { await addFeeling(type, score) } finally { setLoading(null) }
  }

  async function submitSymptoms() {
    if (selected.length === 0) return
    setLoading('symptoms')
    try { await addSymptoms(selected); setSelected([]) } finally { setLoading(null) }
  }

  function toggle(v: string) {
    setSelected(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  const todayStr = new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={s.page}>
      <h1 style={s.title}>Как ты сегодня?</h1>
      <p style={s.date}>{todayStr}</p>

      <div style={s.grid}>
        <FeelingSlider label="Настроение" type="mood" value={mood} onChange={setMood}
          onSubmit={() => submit('mood', mood)} loading={loading === 'mood'} />
        <FeelingSlider label="Энергия" type="energy" value={energy} onChange={setEnergy}
          onSubmit={() => submit('energy', energy)} loading={loading === 'energy'} />
        <FeelingSlider label="Тревога" type="anxiety" value={anxiety} onChange={setAnxiety}
          onSubmit={() => submit('anxiety', anxiety)} loading={loading === 'anxiety'} />
      </div>

      <div style={s.card}>
        <p style={s.cardTitle}>Симптомы сегодня</p>
        <div style={s.symptoms}>
          {symptomItems.map(item => (
            <label key={item.value} style={{ ...s.chip, ...(selected.includes(item.value) ? s.chipActive : {}) }}>
              <input
                type="checkbox"
                style={{ display: 'none' }}
                checked={selected.includes(item.value)}
                onChange={() => toggle(item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
        <button
          style={{ ...s.btn, background: 'var(--secondary)', marginTop: 12 }}
          onClick={submitSymptoms}
          disabled={loading === 'symptoms' || selected.length === 0}
        >
          {loading === 'symptoms' ? 'Сохраняем...' : `Записать (${selected.length})`}
        </button>
      </div>

      {feelings.slice(0, 5).length > 0 && (
        <div style={s.card}>
          <p style={s.cardTitle}>Последние записи</p>
          <div style={s.recentList}>
            {feelings.slice(0, 5).map(f => (
              <div key={f.id} style={s.recentItem}>
                <span style={s.recentType}>{f.feelingType}</span>
                <span style={s.recentScore}>{f.score}/5</span>
                <span style={s.recentDate}>
                  {new Date(f.createdAtClient).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', maxWidth: 900, margin: '0 auto' },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  date: { color: 'var(--text-muted)', marginBottom: 24, textTransform: 'capitalize' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 16 },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontWeight: 600, fontSize: 16, marginBottom: 12, display: 'block' },
  score: { fontSize: 18, fontWeight: 700 },
  ticks: { display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: 16 },
  tick: { fontSize: 12, width: 20, textAlign: 'center' },
  btn: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    opacity: 1,
  },
  symptoms: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--text-muted)',
    userSelect: 'none',
    transition: 'all 0.15s',
  },
  chipActive: {
    background: 'rgba(154,87,250,0.2)',
    borderColor: 'var(--secondary)',
    color: 'var(--text)',
  },
  recentList: { display: 'flex', flexDirection: 'column', gap: 8 },
  recentItem: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 },
  recentType: { color: 'var(--text-muted)', width: 80 },
  recentScore: { fontWeight: 600, color: 'var(--primary)' },
  recentDate: { color: 'var(--text-muted)', marginLeft: 'auto', fontSize: 12 },
}
