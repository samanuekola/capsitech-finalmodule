import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Project { _id: string; name: string; }
interface TeamMember { _id: string; name: string; }
type TaskStatus = "to-do" | "in-progress" | "done" | "cancelled";

interface Task {
  _id: string;
  title: string;
  description: string;
  deadline?: string;
  project?: Project;
  assignedMembers: TeamMember[];
  status: TaskStatus;
}

interface TasksResponse { tasks: Task[]; total: number; }

export default function Tasks() {
  const [tasksData, setTasksData] = useState<TasksResponse>({ tasks: [], total: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<{
    title: string; description: string; deadline: string; project: string; assignedMembers: string[]; status: TaskStatus;
  }>({ title: "", description: "", deadline: "", project: "", assignedMembers: [], status: "to-do" });

  const [filters, setFilters] = useState<{
    page: number; limit: number; search: string; project: string; member: string; status: string; fromDate: string; toDate: string;
  }>({ page: 1, limit: 5, search: "", project: "", member: "", status: "", fromDate: "", toDate: "" });

  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get<TasksResponse>("/tasks", { params: filters });
    setTasksData(res.data);
    const p = await api.get<{ projects: Project[] }>("/projects?page=1&limit=100");
    setProjects(p.data.projects || []);
    const t = await api.get<{ teams: TeamMember[] }>("/teams?page=1&limit=100");
    setTeams(t.data.teams || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/tasks/${editingId}`, form);
      setEditingId(null);
    } else {
      await api.post("/tasks", form);
    }
    setForm({ title: "", description: "", deadline: "", project: "", assignedMembers: [], status: "to-do" });
    load();
  };

  const edit = (t: Task) => {
    setForm({
      title: t.title,
      description: t.description,
      deadline: t.deadline ? t.deadline.substring(0, 10) : "",
      project: t.project?._id || "",
      assignedMembers: t.assignedMembers.map((m) => m._id),
      status: t.status,
    });
    setEditingId(t._id);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    load();
  };

  const cancelEdit = () => {
    setForm({ title: "", description: "", deadline: "", project: "", assignedMembers: [], status: "to-do" });
    setEditingId(null);
  };

  const changePage = (dir: number) => {
    setFilters((f) => ({ ...f, page: f.page + dir }));
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-info">📋 Task Management</h3>

      <div className="row g-4">
        {/* Form */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              {editingId ? "✏️ Edit Task" : "➕ Create Task"}
            </div>
            <div className="card-body">
              <form onSubmit={submit}>
                <input className="form-control mb-3" placeholder="Title" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea className="form-control mb-3" placeholder="Description" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                <input type="date" className="form-control mb-3" value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                <select className="form-select mb-3" value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })} required>
                  <option value="">Select Project</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>

                <label className="fw-semibold">Assign Members</label>
                <select multiple className="form-select mb-3" value={form.assignedMembers}
                  onChange={(e) => {
                    const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setForm({ ...form, assignedMembers: vals });
                  }}>
                  {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>

                <select className="form-select mb-3" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
                  <option value="to-do">To-do</option>
                  <option value="in-progress">In-progress</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <div className="d-flex gap-2">
                  <button className="btn btn-info flex-fill text-white">
                    {editingId ? "Update" : "Create"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary flex-fill" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Table + Filters */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-bold">Tasks</div>
            <div className="card-body">
              {/* Filters */}
              <div className="mb-3">
                <div className="row g-2">
                  <div className="col-md-3">
                    <input placeholder="Search title..." className="form-control"
                      value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
                  </div>
                  <div className="col-md-3">
                    <select className="form-select" value={filters.project}
                      onChange={(e) => setFilters({ ...filters, project: e.target.value, page: 1 })}>
                      <option value="">All Projects</option>
                      {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select className="form-select" value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                      <option value="">All Status</option>
                      <option value="to-do">To-do</option>
                      <option value="in-progress">In-progress</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <input type="date" className="form-control"
                      value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value, page: 1 })} />
                  </div>
                  <div className="col-md-2">
                    <input type="date" className="form-control"
                      value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value, page: 1 })} />
                  </div>
                </div>
              </div>

              {/* Table */}
              <table className="table table-striped table-hover align-middle">
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
                      <td>{t.title}</td>
                      <td>{t.project?.name}</td>
                      <td>{(t.assignedMembers || []).map((m) => m.name).join(", ")}</td>
                      <td>{t.deadline ? new Date(t.deadline).toLocaleDateString() : "-"}</td>
                      <td>
                        <span className={`badge ${
                          t.status === "done" ? "bg-success" :
                          t.status === "in-progress" ? "bg-warning text-dark" :
                          t.status === "cancelled" ? "bg-danger" : "bg-secondary"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => edit(t)}>✏️</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {tasksData.tasks.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-muted">No tasks</td></tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${filters.page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => changePage(-1)}>Previous</button>
                  </li>
                  <li className="page-item"><span className="page-link">{filters.page}</span></li>
                  <li className={`page-item ${(filters.page * filters.limit >= tasksData.total) ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => changePage(1)}>Next</button>
                  </li>
                </ul>
              </nav>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
