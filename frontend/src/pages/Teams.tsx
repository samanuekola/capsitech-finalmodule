import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

interface Team {
  _id: string;
  name: string;
  email: string;
  designation: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({ name: "", email: "", designation: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get("/teams");
    setTeams(res.data.teams);
  };

  useEffect(() => {
    load();
  }, []);

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

  const edit = (team: Team) => {
    setForm({ name: team.name, email: team.email, designation: team.designation });
    setEditingId(team._id);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this member?")) return;
    await api.delete(`/teams/${id}`);
    load();
  };

  const cancelEdit = () => {
    setForm({ name: "", email: "", designation: "" });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="row g-4">
        {/* Left form */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-semibold">Create Project</div>
            <div className="card-body">
              <form onSubmit={submit}>
                <input
                  className="form-control mb-3"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <input
                  className="form-control mb-3"
                  placeholder="Designation"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  required
                />

                <div className="d-flex gap-2">
                  <button className="btn btn-primary flex-fill">
                    {editingId ? "Update" : "Add"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary flex-fill"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right table */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-bold">Team Members</div>
            <div className="card-body table-responsive">
              <table className="table align-middle table-hover">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    teams.map((t) => (
                      <tr key={t._id}>
                        <td className="fw-semibold">{t.name}</td>
                        <td>{t.email}</td>
                        <td>{t.designation}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
