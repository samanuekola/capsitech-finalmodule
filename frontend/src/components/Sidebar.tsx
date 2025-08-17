import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear auth token
    navigate("/login"); // redirect to login
  };

  return (
    <div
      className="d-flex flex-column bg-light vh-100 border-end"
      style={{ width: "240px" }}
    >
      {/* Sidebar Links */}
      <div className="flex-grow-1">
        <h4 className="p-3 text-primary">Dashboard</h4>
        <ul className="nav flex-column px-3">
          <li className="nav-item mb-2">
            <Link className="nav-link text-dark" to="/projects">
              📁 Projects
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-dark" to="/tasks">
              ✅ Tasks
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-dark" to="/teams">
              👥 Teams
            </Link>
          </li>
          
        </ul>
      </div>

      {/* Logout at Bottom */}
      <div className="p-3 border-top">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 fw-bold"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
