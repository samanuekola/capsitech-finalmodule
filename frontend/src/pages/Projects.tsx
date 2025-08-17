import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Member { _id: string; name: string; }
interface Project {
  _id: string;
  name: string;
  description: string;
  teamMembers: Member[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Member[]>([]);
  const [form, setForm] = useState<{ name: string; description: string; teamMembers: string[] }>({
    name: "", description: "", teamMembers: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const p = await api.get<{ projects: Project[] }>("/projects?page=1&limit=100");
    setProjects(p.data.projects || []);
    const t = await api.get<{ teams: Member[] }>("/teams?page=1&limit=100");
    setTeams(t.data.teams || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await api.put(`/projects/${editingId}`, form);
    else await api.post("/projects", form);
    setForm({ name: "", description: "", teamMembers: [] });
    setEditingId(null);
    load();
  };

  const edit = (p: Project) => {
    setForm({ name: p.name, description: p.description, teamMembers: p.teamMembers.map(m => m._id) });
    setEditingId(p._id);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete project?")) return;
    await api.delete(`/projects/${id}`);
    load();
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-success">📂 Project Management</h3>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              {editingId ? "✏️ Edit Project" : "➕ Add Project"}
            </div>
            <div className="card-body">
              <form onSubmit={submit}>
                <input className="form-control mb-3" placeholder="Project Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <textarea className="form-control mb-3" placeholder="Description" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                <label className="fw-semibold">Assign Members</label>
                <select multiple className="form-select mb-3" value={form.teamMembers}
                  onChange={(e) => {
                    const vals = Array.from(e.target.selectedOptions).map(o => o.value);
                    setForm({ ...form, teamMembers: vals });
                  }}>
                  {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <div className="d-flex gap-2">
                  <button className="btn btn-success flex-fill">{editingId ? "Update" : "Add"}</button>
                  {editingId && (
                    <button type="button" className="btn btn-secondary flex-fill"
                      onClick={() => { setForm({ name: "", description: "", teamMembers: [] }); setEditingId(null); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-bold">Projects</div>
            <div className="card-body">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr><th>Name</th><th>Description</th><th>Members</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.description}</td>
                      <td>{p.teamMembers.map((m) => m.name).join(", ")}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => edit(p)}>✏️</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted">No projects</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
