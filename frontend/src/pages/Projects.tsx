import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

type Team = { _id: string; name: string; email?: string; designation?: string };
type Project = {
  _id: string;
  name: string;
  description: string;
  teamMembers: Team[];
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ page: 1, limit: 8 });
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({
    name: "",
    description: "",
    teamMembers: [] as string[], 
  });

  const load = async () => {
    const res = await api.get("/projects", { params: filters });
    setProjects(res.data.projects || []);
    setTotal(res.data.total || 0);

    if (teams.length === 0) {
      const t = await api.get("/teams", { params: { page: 1, limit: 100 } });
      setTeams(t.data.teams || []);
    }
  };

  useEffect(() => {
    load();
    
  }, [filters]);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/projects/${editingId}`, form);
    } else {
      await api.post("/projects", form);
    }
    resetForm();
    load();
  };

  
  const edit = (p: Project) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      teamMembers: (p.teamMembers || []).map((m) => m._id),
    });
  };

  
  const remove = async (id: string) => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    load();
  };

 
  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", description: "", teamMembers: [] });
  };

  
  const changePage = (dir: number) => {
    setFilters((f) => ({ ...f, page: f.page + dir }));
  };

  return (
    <Layout>
      <style>{`
        .rounded-table { border-collapse: separate; border-spacing: 0 10px; }
        .rounded-table thead th { background:#f7f8fa; font-weight:600; color:#495057; padding:12px }
        .rounded-table tbody td { background:#fff; padding:14px; border-top:1px solid #eef0f3 }
        .rounded-table tbody tr { box-shadow: 0 1px 2px rgba(16,24,40,.04); }
        .rounded-table tbody tr:hover td { background:#f3f6ff }
        .chip { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#f2f4f7; font-size:12px; }
      `}</style>

      <div className="row g-4">
       
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-semibold">
              {editingId ? "Edit Project" : "Create Project"}
            </div>
            <div className="card-body">
              <form onSubmit={submit} className="d-grid gap-3">
                <input
                  className="form-control"
                  placeholder="Project name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <textarea
                  className="form-control"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
                <div>
                  <label className="form-label fw-semibold">Team members</label>
                  <select
                    className="form-select"
                    multiple
                    value={form.teamMembers}
                    onChange={(e) => {
                      const vals = Array.from(e.target.selectedOptions).map(
                        (o) => o.value
                      );
                      setForm({ ...form, teamMembers: vals });
                    }}
                    style={{ minHeight: 120 }}
                  >
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary flex-fill">
                    {editingId ? "Update" : "Create"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-fill"
                      onClick={resetForm}
                    >
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
            <div className="card-header bg-white fw-semibold">Projects</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table rounded-table align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Members</th>
                      <th style={{ width: 120 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p._id}>
                        <td className="fw-semibold">{p.name}</td>
                        <td className="text-muted">{p.description}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            {(p.teamMembers || []).map((m) => (
                              <span className="chip" key={m._id}>
                                {m.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => edit(p)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => remove(p._id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">
                          No projects found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              
              <nav>
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      filters.page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => changePage(-1)}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </button>
                  </li>
                  <li className="page-item">
                    <span className="page-link">{filters.page}</span>
                  </li>
                  <li
                    className={`page-item ${
                      filters.page * filters.limit >= total ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => changePage(1)}
                      disabled={filters.page * filters.limit >= total}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
