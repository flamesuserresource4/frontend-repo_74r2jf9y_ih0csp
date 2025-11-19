import React, { useEffect, useState } from 'react'

type Settings = {
  id?: string
  name: string
  role: string
  headline: string
  about: string
  location?: string
  avatar_url?: string
  email?: string
  socials?: Record<string, string>
}

type Project = {
  id?: string
  title: string
  description: string
  tags: string[]
  image_url?: string
  live_url?: string
  repo_url?: string
}

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const PublicPortal: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p] = await Promise.all([
          fetch(`${apiBase}/api/public/settings`).then(r => r.json()),
          fetch(`${apiBase}/api/public/projects`).then(r => r.json())
        ])
        setSettings(s && Object.keys(s).length ? s : null)
        setProjects(Array.isArray(p) ? p : [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse">Loading portfolio...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_0%_0%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(600px_circle_at_100%_0%,rgba(168,85,247,0.2),transparent_40%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {settings?.avatar_url ? (
              <img src={settings.avatar_url} alt={settings?.name} className="w-28 h-28 rounded-full ring-2 ring-cyan-400/40 object-cover" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-slate-800 ring-2 ring-cyan-400/20 flex items-center justify-center text-3xl">👋</div>
            )}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                {settings?.name || 'Your Name'}
              </h1>
              <p className="text-cyan-300 mt-2 text-lg">{settings?.role || 'Full-Stack Developer'}</p>
              <p className="text-slate-300 mt-4 max-w-2xl">{settings?.headline || 'I build delightful web experiences.'}</p>
              <div className="flex gap-4 mt-5 text-slate-300">
                {settings?.location && <span>📍 {settings.location}</span>}
                {settings?.email && <a href={`mailto:${settings.email}`} className="hover:text-white">✉️ {settings.email}</a>}
              </div>
              {settings?.socials && (
                <div className="flex gap-4 mt-4">
                  {Object.entries(settings.socials).map(([k, v]) => (
                    <a key={k} href={v} target="_blank" className="text-slate-300 hover:text-white underline">
                      {k}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {settings?.about && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-3">About</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{settings.about}</p>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Projects</h2>
            <a href="/admin" className="text-sm text-slate-300 hover:text-white underline">Admin</a>
          </div>
          {projects.length === 0 ? (
            <p className="text-slate-400">No projects yet. Add some from the admin portal.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="group rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/40 hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.35)] transition overflow-hidden">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-3">{p.description}</p>
                    {p.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {p.tags.map(t => (
                          <span key={t} className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 mt-4">
                      {p.live_url && <a className="text-sm text-cyan-300 hover:text-cyan-200 underline" href={p.live_url} target="_blank">Live</a>}
                      {p.repo_url && <a className="text-sm text-slate-300 hover:text-white underline" href={p.repo_url} target="_blank">Code</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="py-10 text-center text-slate-500 text-sm">© {new Date().getFullYear()} {settings?.name || 'Your Name'}</footer>
    </div>
  )
}

export default PublicPortal
