import React, { useEffect, useMemo, useState } from 'react'

const Card = ({ children }) => (
  <div
    style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,.06)',
      background: '#fff'
    }}
  >
    {children}
  </div>
)

const Pill = ({ text }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '4px 10px',
      border: '1px solid #ddd',
      borderRadius: 999,
      margin: 4,
      fontSize: 12
    }}
  >
    {text}
  </span>
)

const Section = ({ title, children }) => (
  <div style={{ marginTop: 12 }}>
    <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
    {children}
  </div>
)

function ProfileCard({ p }) {
  const [open, setOpen] = useState(false)

  const Education = () => (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {(p.education || []).map((e, i) => (
        <li key={i}>
          {e.degree || '-'} · {e.institute || '-'}
          {e.year ? ` (${e.year})` : ''}
        </li>
      ))}
    </ul>
  )

  const Links = () => {
    const L = p.links || {}
    const items = [
      { label: 'GitHub', url: L.github },
      { label: 'LinkedIn', url: L.linkedin },
      { label: 'Portfolio', url: L.portfolio }
    ].filter(x => !!x.url)

    if (items.length === 0) return <div style={{ color: '#6b7280' }}>—</div>

    return (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {items.map((x, i) => (
          <a
            key={i}
            href={x.url}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', color: '#2563eb' }}
          >
            {x.label}
          </a>
        ))}
      </div>
    )
  }

  const Projects = () => (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {(p.projects || []).map((pr, i) => (
        <li key={i} style={{ marginBottom: 6 }}>
          <div style={{ fontWeight: 600 }}>{pr.title || `Project ${i + 1}`}</div>
          {pr.description && (
            <div style={{ color: '#374151', marginTop: 2 }}>{pr.description}</div>
          )}
          {Array.isArray(pr.skills) && pr.skills.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {pr.skills.map(s => (
                <Pill key={s} text={s} />
              ))}
            </div>
          )}
          {Array.isArray(pr.links) && pr.links.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {pr.links.map((u, k) => (
                <a
                  key={k}
                  href={u}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginRight: 10, color: '#2563eb' }}
                >
                  Link {k + 1}
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )

  const Work = () => (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {(p.work || []).map((w, i) => (
        <li key={i}>
          <strong>{w.role || 'Role'}</strong> @ {w.company || 'Company'}
          {w.start || w.end ? (
            <span style={{ color: '#6b7280' }}>
              {' '}
              · {w.start || '—'} to {w.end || '—'}
            </span>
          ) : null}
          {w.details ? <div style={{ marginTop: 2 }}>{w.details}</div> : null}
        </li>
      ))}
    </ul>
  )

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>{p.name}</h3>
      <p style={{ margin: '6px 0' }}>
        <a href={'mailto:' + p.email}>{p.email}</a>
      </p>

      <div style={{ marginTop: 8 }}>
        {(p.skills || []).map(s => (
          <Pill key={p.id + '-' + s} text={s} />
        ))}
      </div>

      {/* Collapsible details */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            cursor: 'pointer',
            background: open ? '#f3f4f6' : '#fff'
          }}
        >
          {open ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <Section title="Education">
            <Education />
          </Section>

          <Section title="Links">
            <Links />
          </Section>

          <Section title="Projects">
            <Projects />
          </Section>

          <Section title="Work">
            <Work />
          </Section>

          {/* Optional raw JSON toggle for debugging */}
          {/* <Section title="Raw JSON"><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(p, null, 2)}</pre></Section> */}
        </div>
      )}
    </Card>
  )
}

export default function App() {
  const [profiles, setProfiles] = useState([])
  const [q, setQ] = useState('')
  const [skill, setSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (skill) params.set('skill', skill)
      const res = await fetch('/api/profiles?' + params.toString())
      const data = await res.json()
      setProfiles(data)
    } catch (e) {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const skills = useMemo(() => {
    const set = new Set()
    profiles.forEach(p => (p.skills || []).forEach(s => set.add(s)))
    return Array.from(set).sort()
  }, [profiles])

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        padding: 24,
        maxWidth: 1100,
        margin: '0 auto'
      }}
    >
      <h1>Me-API Playground (React)</h1>
      <p style={{ color: '#6b7280' }}>
        Search & filter test UI with full profile details.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          placeholder="Search…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            minWidth: 220
          }}
        />
        <select
          value={skill}
          onChange={e => setSkill(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
        >
          <option value="">All skills</option>
          {skills.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={load}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            cursor: 'pointer'
          }}
        >
          Apply
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16
        }}
      >
        {profiles.map(p => (
          <ProfileCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  )
}
