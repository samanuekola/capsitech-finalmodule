export default function Topbar() {
  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-4">
      <span className="navbar-brand fw-semibold">Dashboard</span>
      <div className="d-flex align-items-center gap-3">
        <span className="fw-semibold">Hello, User</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="rounded-circle"
        />
      </div>
    </nav>
  );
}
