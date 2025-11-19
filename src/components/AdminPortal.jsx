import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-blue-200/80">{label}</span>
      <input {...props} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-blue-200/80">{label}</span>
      <textarea {...props} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px]" />
    </label>
  );
}

function ProjectForm({ onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", tags: "", image_url: "", live_url: "", repo_url: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      const res = await fetch(`${API_BASE}/api/admin/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated?.(data);
        setForm({ title: "", description: "", tags: "", image_url: "", live_url: "", repo_url: "" });
      } else {
        alert(data.detail || "Failed to create project");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <Field label="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
      </div>
      <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        <Field label="Live URL" value={form.live_url} onChange={e => setForm({ ...form, live_url: e.target.value })} />
        <Field label="Repo URL" value={form.repo_url} onChange={e => setForm({ ...form, repo_url: e.target.value })} />
      </div>
      <button disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60">{loading ? "Adding…" : "Add Project"}</button>
    </form>
  );
}

export default function AdminPortal() {
  const [settings, setSettings] = useState({ name: "", role: "", headline: "", about: "", avatar_url: "", email: "" });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([
          fetch(`${API_BASE}/api/public/settings`).then(r => r.json()),
          fetch(`${API_BASE}/api/admin/projects`).then(r => r.json()),
        ]);
        if (s && Object.keys(s).length) setSettings(prev => ({ ...prev, ...s }));
        setProjects(Array.isArray(p) ? p : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save settings");
      }
      alert("Settings saved");
    } catch (e) {
      alert(e.message);
    }
  }

  async function removeProject(id) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`${API_BASE}/api/admin/projects/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.deleted) setProjects(projects.filter(p => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-blue-300/80">Manage your public portfolio content</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Profile & Site</h2>
          <div className="grid md:grid-cols-2 gap-4 bg-slate-800/40 border border-slate-700 rounded-xl p-5">
            <Field label="Name" value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} />
            <Field label="Role" value={settings.role} onChange={e => setSettings({ ...settings, role: e.target.value })} />
            <Field label="Avatar URL" value={settings.avatar_url} onChange={e => setSettings({ ...settings, avatar_url: e.target.value })} />
            <Field label="Email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
            <div className="md:col-span-2">
              <Field label="Headline" value={settings.headline} onChange={e => setSettings({ ...settings, headline: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Textarea label="About" value={settings.about} onChange={e => setSettings({ ...settings, about: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <button onClick={saveSettings} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save Settings</button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <ProjectForm onCreated={(p) => setProjects([p, ...projects])} />
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-blue-200/80 text-sm mt-1">{p.description}</p>
                  </div>
                  <button onClick={() => removeProject(p.id)} className="text-red-300 hover:text-red-200 text-sm">Delete</button>
                </div>
              </div>
            ))}
            {projects.length === 0 && !loading && (
              <p className="text-blue-200/70">No projects yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
