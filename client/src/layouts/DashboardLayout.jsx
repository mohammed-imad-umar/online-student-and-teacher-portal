import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const roleLinks = {
  student: [
    ["dashboard", "My Dashboard"],
    ["ai-chat", "AI Teacher"],
    ["assignments", "Assignments"],
    ["attendance", "My Attendance"],
    ["performance", "My Performance"],
    ["forum", "Forum"],
    ["planner", "Study Planner"],
    ["tests", "Tests"],
    ["live-classes", "Live Classes"]
  ],
  teacher: [
    ["dashboard", "Teacher Dashboard"],
    ["assignments", "Manage Assignments"],
    ["attendance", "Mark Attendance"],
    ["performance", "Performance Analytics"],
    ["forum", "Forum Moderation"],
    ["tests", "Manage Tests"],
    ["live-classes", "Live Classes"]
  ],
  admin: [
    ["dashboard", "Admin Dashboard"],
    ["assignments", "Assignments"],
    ["attendance", "Attendance"],
    ["performance", "Performance"],
    ["forum", "Forum"],
    ["tests", "Tests"],
    ["live-classes", "Live Classes"]
  ]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 md:flex-row">
        <aside className="w-full rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:w-72">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">AI Portal</h2>
              <p className="text-sm font-medium text-slate-700">{user?.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{user?.role}</p>
            </div>
          </div>
          <nav className="mt-4 grid gap-1">
            {(roleLinks[user?.role] || roleLinks.student).map(([path, label]) => (
              <NavLink
                key={path}
                to={`/${path}`}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <Button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-6 w-full"
            variant="danger"
          >
            Logout
          </Button>
          <p className="mt-4 text-center text-xs text-slate-500">Built by batch 10 csm-b</p>
        </aside>
        <main className="flex-1 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
