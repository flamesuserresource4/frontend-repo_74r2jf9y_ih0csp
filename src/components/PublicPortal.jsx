import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

function ProjectTag({ tag }) {
  return (
    <span className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
      {tag}
    </span>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="group bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-blue-500/40 transition-colors">
      {project.image_url && (
        <img src={project.image_url} alt={project.title} className="w-full h-48 object-cover rounded-lg mb-4" />
      )}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
        <div className="flex gap-2">
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noreferrer" className="text-xs text-blue-300 hover:text-blue-200">Code</a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-300 hover:text-emerald-200">Live</a>
          )}
        </div>
      </div>
      <p className="mt-2 text-blue-100/80 text-sm">{project.description}</p>
      {project.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((t, idx) => (
            <ProjectTag key={idx} tag={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicPortal() {
  const [settings, setSettings] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([
          fetch(`${API_BASE}/api/public/settings`).then(r => r.json()),
          fetch(`${API_BASE}/api/public/projects`).then(r => r.json()),
        ]);
        setSettings(s);
        setProjects(Array.isArray(p) ? p : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent_60%)]" />
      <header className="relative max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-6">
          {settings?.avatar_url && (
            <img src={settings.avatar_url} alt="avatar" className="w-20 h-20 rounded-full ring-2 ring-blue-500/30" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{settings?.name || "Your Name"}</h1>
            <p className="text-blue-300">{settings?.role || "Your Role"}</p>
            <p className="mt-2 text-blue-200/80">{settings?.headline || "Short headline about what you do."}</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 pb-20">
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">About</h2>
          <p className="text-blue-100/80 leading-relaxed bg-slate-800/40 border border-slate-700 rounded-xl p-5">
            {settings?.about || "Tell the world about your experience, specialties, and what you're passionate about."}
          </p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Projects</h2>
            {loading && <span className="text-sm text-blue-300">Loading…</span>}
          </div>
          {projects.length === 0 ? (
            <p className="text-blue-200/70">No projects yet. Add some from the admin portal.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map(p => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="relative max-w-5xl mx-auto px-6 pb-8 text-blue-300/70">
        <p>Built with love. Admin portal at /admin</p>
      </footer>
    </div>
  );
}
