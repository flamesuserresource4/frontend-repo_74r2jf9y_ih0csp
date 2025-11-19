import React, { useEffect, useMemo, useState } from 'react'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

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

const Field: React.FC<{ label: string } & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, ...props }) => (
  <label className="block text-sm mb-3">
    <span className="block text-slate-300 mb-1">{label}</span>
    <input {...props} className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
  </label>
)

const TextArea: React.FC<{ label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ label, ...props }) => (
  <label className="block text-sm mb-3">
    <span className="block text-slate-300 mb-1">{label}</span>
    <textarea {...props} className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
  </label>
)

const TagInput: React.FC<{ value: string[]; onChange: (v: string[]) => void }> = ({ value, onChange }) => {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (!v) return
    onChange([...value, v])
    setInput('')
  }
  const remove = (t: string) => onChange(value.filter(x => x !== t))
  return (
    <div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), add()) : null} placeholder="Add tag and press Enter" className="flex-1 rounded bg-slate-900 border border-slate-700 px-3 py-2" />
        <button onClick={add} className="px-3 rounded bg-cyan-600 hover:bg-cyan-500">Add</button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map(t => (
          <span key={t} className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-2">
            {t}
            <button onClick={() => remove(t)} className="text-slate-400 hover:text-white">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

const AdminPortal: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({ name: '', role: '', headline: '', about: '' })
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [s, p] = await Promise.all([
        fetch(`${apiBase}/api/public/settings`).then(r => r.json()),
        fetch(`${apiBase}/api/admin/projects`).then(r => r.json())
      ])
      if (s && Object.keys(s).length) setSettings(s)
      setProjects(Array.isArray(p) ? p : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const s = await res.json()
      setSettings(s)
    } finally { setSaving(false) }
  }

  const addProject = async (p: Project) => {
    const res = await fetch(`${apiBase}/api/admin/projects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p)
    })
    const created = await res.json()
    setProjects(prev => [created, ...prev])
  }

  const updateProject = async (id: string, patch: Partial<Project>) => {
    const res = await fetch(`${apiBase}/api/admin/projects/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch)
    })
    const updated = await res.json()
    setProjects(prev => prev.map(p => p.id === id ? updated : p))
  }

  const deleteProject = async (id: string) => {
    await fetch(`${apiBase}/api/admin/projects/${id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const [newProject, setNewProject] = useState<Project>({ title: '', description: '', tags: [] })

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-slate-950 text-white">Loading admin...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <a href="/" className="text-sm text-slate-300 hover:text-white underline">View Public</a>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Profile & Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Name" value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} />
            <Field label="Role" value={settings.role} onChange={e => setSettings({ ...settings, role: e.target.value })} />
            <Field label="Headline" value={settings.headline} onChange={e => setSettings({ ...settings, headline: e.target.value })} />
            <Field label="Location" value={settings.location || ''} onChange={e => setSettings({ ...settings, location: e.target.value })} />
            <Field label="Avatar URL" value={settings.avatar_url || ''} onChange={e => setSettings({ ...settings, avatar_url: e.target.value })} />
            <Field label="Email" value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} />
            <TextArea label="About" value={settings.about} onChange={e => setSettings({ ...settings, about: e.target.value })} />
          </div>
          <div className="mt-4">
            <button onClick={saveSettings} disabled={saving} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60">{saving ? 'Saving...' : 'Save Settings'}</button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Projects</h2>

          <div className="rounded-xl border border-slate-800 p-4 mb-6 bg-slate-900/50">
            <h3 className="font-semibold mb-3">Add New Project</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
              <Field label="Image URL" value={newProject.image_url || ''} onChange={e => setNewProject({ ...newProject, image_url: e.target.value })} />
              <Field label="Live URL" value={newProject.live_url || ''} onChange={e => setNewProject({ ...newProject, live_url: e.target.value })} />
              <Field label="Repo URL" value={newProject.repo_url || ''} onChange={e => setNewProject({ ...newProject, repo_url: e.target.value })} />
              <TextArea label="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
              <div>
                <span className="block text-slate-300 text-sm mb-1">Tags</span>
                <TagInput value={newProject.tags} onChange={tags => setNewProject({ ...newProject, tags })} />
              </div>
            </div>
            <div className="mt-3">
              <button onClick={() => addProject(newProject)} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500">Create Project</button>
            </div>
          </div>

          <div className="grid gap-4">
            {projects.map(p => (
              <div key={p.id} className="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Title" value={p.title} onChange={e => updateProject(p.id!, { title: e.target.value })} />
                  <Field label="Image URL" value={p.image_url || ''} onChange={e => updateProject(p.id!, { image_url: e.target.value })} />
                  <Field label="Live URL" value={p.live_url || ''} onChange={e => updateProject(p.id!, { live_url: e.target.value })} />
                  <Field label="Repo URL" value={p.repo_url || ''} onChange={e => updateProject(p.id!, { repo_url: e.target.value })} />
                  <TextArea label="Description" value={p.description} onChange={e => updateProject(p.id!, { description: e.target.value })} />
                  <div>
                    <span className="block text-slate-300 text-sm mb-1">Tags</span>
                    <TagInput value={p.tags} onChange={tags => updateProject(p.id!, { tags })} />
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <button onClick={() => deleteProject(p.id!)} className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminPortal
