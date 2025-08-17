import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

type Team = { _id: string; name: string };
type Project = { _id: string; name: string };
type Task = {
  _id: string;
  title: string;
  description: string;
  deadline?: string;
  project?: Project;
  assignedMembers: Team[];
  status: "to-do" | "in-progress" | "done" | "cancelled";
};

export default function Tasks() {
  const [tasksData, setTasksData] = useState<{ tasks: Task[]; total: number }>({
    tasks: [],
    total: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    search: "",
    project: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    project: "",
    assignedMembers: [] as string[],
    status: "to-do" as Task["status"],
  });

  const load = async () => {
    const res = await api.get("/tasks", { params: filters });
    setTasksData(res.data);

    const p = await api.get("/projects", { params: { page: 1, limit: 100 } });
    setProjects(p.data.projects || []);

    const t = await api.get("/teams", { params: { page: 1, limit: 100 } });
    setTeams(t.data.teams || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/tasks/${editingId}`, form);
      setEditingId(null);
    } else {
      await api.post("/tasks", form);
    }
    resetForm();
    load();
  };

  const edit = (t: Task) => {
    setForm({
      title: t.title,
      description: t.description,
      deadline: t.deadline ? t.deadline.substring(0, 10) : "",
      project: t.project?._id || "",
      assignedMembers: (t.assignedMembers || []).map((m) => m._id),
      status: t.status,
    });
    setEditingId(t._id);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    load();
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      deadline: "",
      project: "",
      assignedMembers: [],
      status: "to-do",
    });
    setEditingId(null);
  };

  const changePage = (dir: number) => {
    setFilters((f) => ({ ...f, page: f.page + dir }));
  };

  const applyQuick = () => setFilters((f) => ({ ...f, page: 1 }));

  return (
    <Layout>
      {/* local styles for rounded table rows */}
      <style>{`
        .rounded-table { border-collapse: separate; border-spacing: 0 10px; }
        .rounded-table thead th { background:#f7f8fa; font-weight:600; color:#495057; padding:12px }
        .rounded-table tbody td { background:#fff; padding:14px; border-top:1px solid #eef0f3 }
        .rounded-table tbody tr { box-shadow: 0 1px 2px rgba(16,24,40,.04); }
        .rounded-table tbody tr:hover td { background:#f3f6ff }
        .chip { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#f2f4f7; font-size:12px; }
      `}</style>

      <div className="row g-4">
        {/* Left: form */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-semibold">
              {editingId ? "Edit Task" : "Create Task"}
            </div>
            <div className="card-body">
              <form onSubmit={submit} className="d-grid gap-3">
                <input
                  className="form-control"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <textarea
                  className="form-control"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
                <input
                  type="date"
                  className="form-control"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />

                <select
                  className="form-select"
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <div>
                  <label className="form-label fw-semibold">Assign members</label>
                  <select
                    multiple
                    className="form-select"
                    value={form.assignedMembers}
                    onChange={(e) => {
                      const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                      setForm({ ...form, assignedMembers: vals });
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

                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as Task["status"] })
                  }
                >
                  <option value="to-do">To-do</option>
                  <option value="in-progress">In-progress</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>

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

        {/* Right: filters + table */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-semibold">Tasks</div>
            <div className="card-body">

              {/* Filters */}
              <div className="row g-2 align-items-end mb-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">Search</label>
                  <input
                    className="form-control"
                    placeholder="Search title…"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">Project</label>
                  <select
                    className="form-select"
                    value={filters.project}
                    onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                  >
                    <option value="">All</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="to-do">To-do</option>
                    <option value="in-progress">In-progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">From</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.fromDate}
                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">To</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.toDate}
                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <button className="btn btn-outline-secondary w-100" onClick={applyQuick}>
                    Apply
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table rounded-table align-middle">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Members</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th style={{ width: 120 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasksData.tasks.map((t) => (
                      <tr key={t._id}>
                        <td className="fw-semibold">{t.title}</td>
                        <td className="text-muted">{t.project?.name || "-"}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            {(t.assignedMembers || []).map((m) => (
                              <span key={m._id} className="chip">{m.name}</span>
                            ))}
                          </div>
                        </td>
                        <td>{t.deadline ? new Date(t.deadline).toLocaleDateString() : "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              t.status === "done"
                                ? "bg-success"
                                : t.status === "in-progress"
                                ? "bg-warning text-dark"
                                : t.status === "cancelled"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => edit(t)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => remove(t._id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tasksData.tasks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          No tasks found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${filters.page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => changePage(-1)}>
                      Previous
                    </button>
                  </li>
                  <li className="page-item">
                    <span className="page-link">{filters.page}</span>
                  </li>
                  <li
                    className={`page-item ${
                      filters.page * filters.limit >= tasksData.total ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={() => changePage(1)}>
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
