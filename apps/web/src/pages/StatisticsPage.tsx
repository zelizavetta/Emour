import { useState } from 'react'
import { Feeling, Symptom } from '@emour/core'
import { useData } from '@/providers/DataProvider'
import { feelingItems, symptomItems, dayPartMap } from '@/constants/data'

type DayData = {
  feelings: { value: string; dayPart: string; score: number }[]
  symptoms: { value: string; dayPart: string }[]
}

function buildCalendarData(feelings: Feeling[], symptoms: Symptom[]): Record<string, DayData> {
  const map: Record<string, DayData> = {}
  const ensure = (day: string) => {
    if (!map[day]) map[day] = { feelings: [], symptoms: [] }
  }
  for (const r of feelings) {
    const day = r.createdAtClient.slice(0, 10)
    ensure(day)
    const matched = feelingItems.filter(i => i.expression(r.score) && i.value.startsWith(r.feelingType))
    if (matched[0] && !map[day].feelings.find(f => f.value === matched[0].value)) {
      map[day].feelings.push({ value: matched[0].value, dayPart: r.dayPart, score: r.score })
    }
  }
  for (const r of symptoms) {
    const day = r.createdAtClient.slice(0, 10)
    ensure(day)
    const matched = symptomItems.find(i => i.value === r.symptomType)
    if (matched && !map[day].symptoms.find(s => s.value === matched.value)) {
      map[day].symptoms.push({ value: matched.value, dayPart: r.dayPart })
    }
  }
  return map
}

export default function StatisticsPage() {
  const { feelings, symptoms, isLoading } = useData()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const data = buildCalendarData(feelings, symptoms)
  const todayStr = new Date().toISOString().slice(0, 10)

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0

  const monthName = firstDay.toLocaleString('ru', { month: 'long', year: 'numeric' })

  function prev() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function next() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const selectedData = selected ? data[selected] : null

  if (isLoading) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Загрузка...</div>

  return (
    <div style={s.page}>
      <h1 style={s.title}>Статистика</h1>

      <div style={s.layout}>
        <div style={s.calendarCard}>
          <div style={s.calNav}>
            <button style={s.navBtn} onClick={prev}>←</button>
            <span style={s.monthName}>{monthName}</span>
            <button style={s.navBtn} onClick={next}>→</button>
          </div>

          <div style={s.dowRow}>
            {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
              <span key={d} style={s.dow}>{d}</span>
            ))}
          </div>

          <div style={s.grid}>
            {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
              const hasData = !!data[day]
              const isToday = day === todayStr
              const isSelected = day === selected
              return (
                <button
                  key={day}
                  style={{
                    ...s.day,
                    ...(isToday ? s.today : {}),
                    ...(isSelected ? s.selectedDay : {}),
                    ...(hasData ? s.hasData : {}),
                  }}
                  onClick={() => setSelected(isSelected ? null : day)}
                >
                  {i + 1}
                  {hasData && <span style={s.dot} />}
                </button>
              )
            })}
          </div>
        </div>

        <div style={s.detailCard}>
          {selectedData ? (
            <>
              <p style={s.detailTitle}>
                {new Date(selected! + 'T12:00:00').toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
              </p>
              {dayPartMap.map(dp => {
                const f = selectedData.feelings.filter(x => x.dayPart === dp.value)
                const sym = selectedData.symptoms.filter(x => x.dayPart === dp.value)
                if (f.length === 0 && sym.length === 0) return null
                return (
                  <div key={dp.value} style={s.dayPart}>
                    <p style={s.dayPartLabel}>{dp.label}</p>
                    {f.map(x => (
                      <p key={x.value} style={s.record}>
                        {feelingItems.find(i => i.value === x.value)?.label} — {x.score}/5
                      </p>
                    ))}
                    {sym.map(x => (
                      <p key={x.value} style={{ ...s.record, color: 'var(--secondary)' }}>
                        {symptomItems.find(i => i.value === x.value)?.label}
                      </p>
                    ))}
                  </div>
                )
              })}
            </>
          ) : (
            <p style={s.placeholder}>Выбери день на календаре</p>
          )}
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', maxWidth: 900, margin: '0 auto' },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 24 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' },
  calendarCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 },
  calNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  navBtn: { background: 'none', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 16 },
  monthName: { fontWeight: 600, textTransform: 'capitalize' },
  dowRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 },
  dow: { textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '4px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 },
  day: {
    position: 'relative',
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--text)',
    cursor: 'pointer',
    fontSize: 14,
    flexDirection: 'column',
    gap: 2,
  },
  today: { border: '1px solid var(--primary)', color: 'var(--primary)' },
  selectedDay: { background: 'rgba(250,87,183,0.2)' },
  hasData: { fontWeight: 600 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'var(--secondary)',
    display: 'block',
  },
  detailCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
  },
  detailTitle: { fontWeight: 600, fontSize: 16, marginBottom: 16 },
  placeholder: { color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 40 },
  dayPart: { marginBottom: 12 },
  dayPartLabel: { color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  record: { fontSize: 13, color: 'var(--primary)', marginBottom: 2 },
}
