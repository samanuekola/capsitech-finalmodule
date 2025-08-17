import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Team {
  _id: string;
  name: string;
  email: string;
  designation: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<Omit<Team, "_id">>({ name: "", email: "", designation: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get<{ teams: Team[] }>("/teams?page=1&limit=100");
    setTeams(res.data.teams || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/teams/${editingId}`, form);
      setEditingId(null);
    } else {
      await api.post("/teams", form);
    }
    setForm({ name: "", email: "", designation: "" });
    load();
  };

  const edit = (t: Team) => {
    setForm({ name: t.name, email: t.email, designation: t.designation });
    setEditingId(t._id);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this member?")) return;
    await api.delete(`/teams/${id}`);
    load();
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-primary">👥 Team Management</h3>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              {editingId ? "✏️ Edit Member" : "➕ Add Member"}
            </div>
            <div className="card-body">
              <form onSubmit={submit}>
                <input className="form-control mb-3" placeholder="Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className="form-control mb-3" placeholder="Email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input className="form-control mb-3" placeholder="Designation" value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
                <div className="d-flex gap-2">
                  <button className="btn btn-primary flex-fill">{editingId ? "Update" : "Add"}</button>
                  {editingId && (
                    <button type="button" className="btn btn-secondary flex-fill"
                      onClick={() => { setForm({ name: "", email: "", designation: "" }); setEditingId(null); }}>
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
            <div className="card-header bg-light fw-bold">Team Members</div>
            <div className="card-body">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Designation</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t._id}>
                      <td>{t.name}</td>
                      <td>{t.email}</td>
                      <td>{t.designation}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => edit(t)}>✏️</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {teams.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted">No members</td></tr>
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
