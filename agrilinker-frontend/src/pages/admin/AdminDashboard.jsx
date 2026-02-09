import { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShoppingCart,
  Package,
  Leaf,
  Shield,
  Tractor,
  User,
  Store,
  LayoutDashboard,
  BarChart3,
  MessageSquareWarning,
  Settings,
} from "lucide-react";
import api from "../../api/api";
import AdminSidebar from "./AdminSidebar";

const defaultDashboard = {
  totalUsers: 0,
  totalFarmers: 0,
  totalBuyers: 0,
  totalSuppliers: 0,
  totalAdmins: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalFertilizers: 0,
};

function StatCard({ label, value, loading, Icon, accent = "bg-green-600" }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white ${accent}`}
        >
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-gray-900">
        {loading ? "—" : value}
      </p>
    </div>
  );
}

function RoleCard({ label, value, loading, Icon, accent = "bg-gray-900" }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-white ${accent}`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900">
        {loading ? "—" : value}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // ✅ THIS LINE FIXES YOUR ERROR
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const navigation = [
    { label: "Overview", Icon: LayoutDashboard, isActive: true },
    { label: "Analysis", Icon: BarChart3 },
    { label: "Complaints", Icon: MessageSquareWarning },
    { label: "Settings", Icon: Settings },
  ];

  const roleSummary = useMemo(
    () => [
      {
        label: "Admins",
        value: dashboard.totalAdmins,
        Icon: Shield,
        accent: "bg-slate-900",
      },
      {
        label: "Farmers",
        value: dashboard.totalFarmers,
        Icon: Tractor,
        accent: "bg-green-700",
      },
      {
        label: "Buyers",
        value: dashboard.totalBuyers,
        Icon: User,
        accent: "bg-blue-600",
      },
      {
        label: "Suppliers",
        value: dashboard.totalSuppliers,
        Icon: Store,
        accent: "bg-amber-600",
      },
    ],
    [dashboard],
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [dashboardRes, usersRes, ordersRes, productsRes, fertilizersRes] =
          await Promise.all([
            api.get("/api/admin/dashboard"),
            api.get("/api/admin/users"),
            api.get("/api/admin/orders"),
            api.get("/api/admin/products"),
            api.get("/api/admin/fertilizers"),
          ]);

        setDashboard(dashboardRes.data);
        setUsers(usersRes.data);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setFertilizers(fertilizersRes.data);
      } catch (fetchError) {
        console.error(fetchError);
        setError(
          "We couldn't load the admin control room. Please confirm your admin access and try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-10">
        {/* Collapsible sidebar */}
        <aside
          className={`w-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:sticky lg:top-8 lg:self-start ${isSidebarExpanded ? "lg:w-64" : "lg:w-24"
            }`}
        >
          <div className="flex items-start justify-between gap-3">
            {isSidebarExpanded ? (
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
              onClick={() => setIsSidebarExpanded((prev) => !prev)}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
            >
              {isSidebarExpanded ? "Collapse" : "Expand"}
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${item.isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.isActive
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-500"
                    }`}
                >
                  <item.Icon size={20} />
                </span>
                {isSidebarExpanded ? item.label : null}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 space-y-8">
          <header className="rounded-3xl bg-gradient-to-r from-green-900 via-green-700 to-green-600 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-green-100">
              ADMIN DASHBOARD
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">Overview</h1>
            <p className="mt-2 max-w-2xl text-green-100">
              Track marketplace health, nurture users, and celebrate every
              harvest with a warm, centralized admin workspace.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Users"
              value={dashboard.totalUsers}
              loading={loading}
              Icon={Users}
              accent="bg-blue-600"
            />
            <StatCard
              label="Orders"
              value={dashboard.totalOrders}
              loading={loading}
              Icon={ShoppingCart}
              accent="bg-green-600"
            />
            <StatCard
              label="Products"
              value={dashboard.totalProducts}
              loading={loading}
              Icon={Package}
              accent="bg-amber-600"
            />
            <StatCard
              label="Fertilizers"
              value={dashboard.totalFertilizers}
              loading={loading}
              Icon={Leaf}
              accent="bg-emerald-600"
            />
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Community roles overview
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              {roleSummary.map((role) => (
                <RoleCard
                  key={role.label}
                  label={role.label}
                  value={role.value}
                  loading={loading}
                  Icon={role.Icon}
                  accent={role.accent}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Latest users
              </h2>
              <div className="mt-4 space-y-4">
                {(users || []).slice(0, 5).map((u) => (
                  <div
                    key={u.id || u._id}
                    className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {u.fullName || u.name || "—"}
                      </p>
                      <p className="text-sm text-gray-500">{u.email || "—"}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {(u.roles || []).join(", ") || u.role || "—"}
                    </div>
                  </div>
                ))}

                {!loading && (users || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No users yet.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent orders
              </h2>
              <div className="mt-4 space-y-4">
                {(orders || []).slice(0, 5).map((o) => (
                  <div
                    key={o.id || o._id}
                    className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {o.customerName || o.customer?.name || "—"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {o.customerEmail || o.customer?.email || "—"}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>LKR {Number(o.totalAmount ?? o.total ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">
                        {o.itemCount ?? o.items?.length ?? 0} items
                      </p>
                    </div>
                  </div>
                ))}

                {!loading && (orders || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No orders yet.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Products</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {(products || []).map((p) => (
                    <li key={p.id || p._id} className="flex justify-between">
                      <span>{p.name || p.title || "—"}</span>
                      <span className="text-gray-500">
                        {p.quantity ?? p.stock ?? 0}
                      </span>
                    </li>
                  ))}

                  {!loading && (products || []).length === 0 ? (
                    <li className="text-gray-500">No products yet.</li>
                  ) : null}
                </ul>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Fertilizers</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {(fertilizers || []).map((f) => (
                    <li key={f.id || f._id} className="flex justify-between">
                      <span>{f.name || f.title || "—"}</span>
                      <span className="text-gray-500">
                        {f.stock ?? f.quantity ?? 0}
                      </span>
                    </li>
                  ))}

                  {!loading && (fertilizers || []).length === 0 ? (
                    <li className="text-gray-500">No fertilizers yet.</li>
                  ) : null}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
