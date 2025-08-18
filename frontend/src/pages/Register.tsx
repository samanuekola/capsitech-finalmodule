import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        setError("⚠️ Email already registered");
      } else {
        setError("⚠️ Something went wrong, try again!");
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: 400, width: "100%" }}>
        <h4 className="mb-3">Register</h4>

        
        {error && (
          <div className="alert alert-danger py-2">{error}</div>
        )}

        <form onSubmit={submit}>
          <input
            className="form-control mb-3"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="form-control mb-3"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="form-control mb-3"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button className="btn btn-primary w-100">Register</button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted">Already have an account?</span>
          <button
            className="btn btn-link p-0 ms-2"
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
