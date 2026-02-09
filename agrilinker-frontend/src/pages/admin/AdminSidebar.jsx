import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  MessageSquareWarning,
  Settings,
} from "lucide-react";

const navigationItems = [
  {
    label: "Overview",
    to: "/admin",
    Icon: LayoutDashboard,
  },
  {
    label: "Analysis",
    to: "/admin/analysis",
    Icon: BarChart3,
  },
  {
    label: "Complaints",
    to: "/admin/complaints",
    Icon: MessageSquareWarning,
  },
  {
    label: "Settings",
    to: "/admin/settings",
    Icon: Settings,
  },
];

export default function AdminSidebar({ isExpanded, onToggle }) {
  const location = useLocation();

  return (
    <aside
      className={`w-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:sticky lg:top-8 lg:self-start ${
        isExpanded ? "lg:w-64" : "lg:w-24"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {isExpanded ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              Admin Menu
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">
              Admin panel
            </h2>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <nav className="mt-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <item.Icon size={20} />
              </span>
              {isExpanded ? item.label : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
