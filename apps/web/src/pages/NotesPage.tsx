import { useState } from 'react'
import { Note } from '@emour/core'
import { useData } from '@/providers/DataProvider'

export default function NotesPage() {
  const { notes, addNote, isLoading } = useData()
  const [selected, setSelected] = useState<Note | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  function openNote(note: Note) {
    setCreating(false)
    setSelected(note)
    setTitle(note.title)
    setText(note.text)
  }

  function startNew() {
    setSelected(null)
    setCreating(true)
    setTitle('')
    setText('')
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const note = await addNote(title.trim(), text)
      if (note) { setSelected(note); setCreating(false) }
    } finally {
      setSaving(false)
    }
  }

  const showEditor = creating || selected !== null

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Дневник</h1>
        <button style={s.addBtn} onClick={startNew}>+ Запись</button>
      </div>

      <div style={s.layout}>
        <div style={s.list}>
          {isLoading && <p style={s.muted}>Загрузка...</p>}
          {!isLoading && notes.length === 0 && <p style={s.muted}>Нет записей</p>}
          {notes.map(note => (
            <button
              key={note.id}
              style={{ ...s.noteItem, ...(selected?.id === note.id ? s.noteItemActive : {}) }}
              onClick={() => openNote(note)}
            >
              <p style={s.noteTitle}>{note.title}</p>
              <p style={s.noteDate}>
                {new Date(note.createdAtClient).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              </p>
              <p style={s.notePreview}>{note.text?.slice(0, 60)}{note.text?.length > 60 ? '…' : ''}</p>
            </button>
          ))}
        </div>

        <div style={s.editor}>
          {showEditor ? (
            <>
              <input
                style={s.titleInput}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Заголовок"
                disabled={!creating}
              />
              <textarea
                style={s.textarea}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Начни писать..."
                disabled={!creating}
              />
              {creating && (
                <div style={s.editorActions}>
                  <button style={s.cancelBtn} onClick={() => { setCreating(false); setSelected(null) }}>
                    Отмена
                  </button>
                  <button style={s.saveBtn} onClick={handleSave} disabled={saving || !title.trim()}>
                    {saving ? 'Сохраняем...' : 'Сохранить'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p style={s.placeholder}>Выбери запись или создай новую</p>
          )}
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 700 },
  addBtn: { padding: '8px 20px', background: 'var(--secondary)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' },
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, flex: 1, minHeight: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' },
  muted: { color: 'var(--text-muted)', fontSize: 13, padding: 12 },
  noteItem: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '14px 16px',
    textAlign: 'left',
    cursor: 'pointer',
    color: 'var(--text)',
    transition: 'border-color 0.15s',
  },
  noteItemActive: { borderColor: 'var(--primary)' },
  noteTitle: { fontWeight: 600, marginBottom: 4 },
  noteDate: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 },
  notePreview: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 },
  editor: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  titleInput: {
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: 20,
    fontWeight: 600,
    padding: '8px 0',
    marginBottom: 16,
    outline: 'none',
    width: '100%',
  },
  textarea: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text)',
    fontSize: 15,
    lineHeight: 1.6,
    outline: 'none',
    resize: 'none',
    width: '100%',
    minHeight: 300,
  },
  editorActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { padding: '8px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' },
  saveBtn: { padding: '8px 20px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' },
  placeholder: { color: 'var(--text-muted)', textAlign: 'center', marginTop: 60 },
}
