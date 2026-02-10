import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminSidebar from "./AdminSidebar";

const WEEKS_TO_SHOW = 8;

const shortWeekFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

function normalizeRole(role) {
  return String(role || "").replace("ROLE_", "").toUpperCase();
}

function getWeekStart(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const day = normalized.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + diffToMonday);
  return normalized;
}

function toIsoDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildWeekBuckets() {
  const currentWeekStart = getWeekStart(new Date());
  const buckets = [];

  for (let index = WEEKS_TO_SHOW - 1; index >= 0; index -= 1) {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - index * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    buckets.push({
      key: toIsoDateKey(start),
      label: `${shortWeekFormatter.format(start)} - ${shortWeekFormatter.format(end)}`,
      registrations: 0,
      weeklyActive: 0,
      buyers: 0,
      farmers: 0,
      suppliers: 0,
      total: 0,
      activeIds: new Set(),
    });
  }

  return buckets;
}

function toDateSafe(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function BarChartCard({ title, subtitle, data, valueKey, colorClass = "bg-green-600" }) {
  const maxValue = Math.max(1, ...data.map((point) => point[valueKey] || 0));

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {data.map((point) => {
          const value = point[valueKey] || 0;
          const widthPercent = Math.max(4, Math.round((value / maxValue) * 100));
          return (
            <div key={point.key} className="grid grid-cols-[11rem_1fr_auto] items-center gap-3">
              <p className="text-xs text-gray-500">{point.label}</p>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${widthPercent}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StackedRoleChart({ data }) {
  const maxTotal = Math.max(1, ...data.map((point) => point.total));

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">Role distribution trend</h2>
      <p className="mt-1 text-sm text-gray-500">
        Weekly registrations split by buyers, farmers, and suppliers.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Buyers</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Farmers</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Suppliers</span>
      </div>

      <div className="mt-6 grid gap-3">
        {data.map((point) => {
          const totalPercent = Math.max(4, Math.round((point.total / maxTotal) * 100));
          const buyerPart = point.total ? (point.buyers / point.total) * 100 : 0;
          const farmerPart = point.total ? (point.farmers / point.total) * 100 : 0;
          const supplierPart = point.total ? (point.suppliers / point.total) * 100 : 0;

          return (
            <div key={point.key} className="grid grid-cols-[11rem_1fr_auto] items-center gap-3">
              <p className="text-xs text-gray-500">{point.label}</p>
              <div className="h-4 overflow-hidden rounded-full bg-gray-100" style={{ width: `${totalPercent}%` }}>
                <div className="flex h-full w-full">
                  <div className="bg-blue-500" style={{ width: `${buyerPart}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${farmerPart}%` }} />
                  <div className="bg-amber-500" style={{ width: `${supplierPart}%` }} />
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-700">{point.total}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function AdminAnalysis() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setError("");
      try {
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/admin/orders"),
          api.get("/api/admin/products"),
        ]);

        setUsers(usersRes.data || []);
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load analytics right now. Please try again.");
      }
    };

    fetchAnalysisData();
  }, []);

  const weeklyData = useMemo(() => {
    const weekBuckets = buildWeekBuckets();
    const weekMap = new Map(weekBuckets.map((bucket) => [bucket.key, bucket]));

    const usersByEmail = new Map(
      users.map((user) => [String(user.email || "").toLowerCase(), user.id]).filter(([email, id]) => email && id),
    );

    users.forEach((user) => {
      const createdAt = toDateSafe(user.createdAt);
      if (!createdAt) return;
      const weekStart = getWeekStart(createdAt);
      if (!weekStart) return;

      const bucket = weekMap.get(toIsoDateKey(weekStart));
      if (!bucket) return;

      bucket.registrations += 1;
      const roleSet = new Set((user.roles || []).map(normalizeRole));
      if (roleSet.has("BUYER")) bucket.buyers += 1;
      if (roleSet.has("FARMER")) bucket.farmers += 1;
      if (roleSet.has("FERTILIZERSUPPLIER")) bucket.suppliers += 1;
      bucket.total += 1;
    });

    users.forEach((user) => {
      const updatedAt = toDateSafe(user.updatedAt);
      if (!updatedAt || !user.id) return;
      const weekStart = getWeekStart(updatedAt);
      if (!weekStart) return;

      const bucket = weekMap.get(toIsoDateKey(weekStart));
      if (!bucket) return;
      bucket.activeIds.add(user.id);
    });

    orders.forEach((order) => {
      const orderDate = toDateSafe(order.orderDate);
      if (!orderDate) return;
      const weekStart = getWeekStart(orderDate);
      if (!weekStart) return;

      const bucket = weekMap.get(toIsoDateKey(weekStart));
      if (!bucket) return;

      const userId = usersByEmail.get(String(order.customerEmail || "").toLowerCase());
      if (userId) bucket.activeIds.add(userId);
    });

    products.forEach((product) => {
      const addedDate = toDateSafe(product.dateAdded);
      if (!addedDate || !product.farmerId) return;
      const weekStart = getWeekStart(addedDate);
      if (!weekStart) return;

      const bucket = weekMap.get(toIsoDateKey(weekStart));
      if (!bucket) return;
      bucket.activeIds.add(product.farmerId);
    });

    return Array.from(weekMap.values()).map((bucket) => ({
      ...bucket,
      weeklyActive: bucket.activeIds.size,
      activeIds: undefined,
    }));
  }, [users, orders, products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-10">
        <AdminSidebar
          isExpanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded((prev) => !prev)}
        />

        <div className="flex-1 space-y-8">
          <header className="rounded-3xl bg-gradient-to-r from-green-900 via-green-700 to-green-600 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-green-100">
              USER ACTIVITY & GROWTH
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">User activity and growth</h1>
            <p className="mt-2 max-w-3xl text-green-100">
              Weekly visibility into registrations, active users, and role distribution trends.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <BarChartCard
              title="New registrations per week"
              subtitle="Last 8 weeks"
              data={weeklyData}
              valueKey="registrations"
              colorClass="bg-emerald-600"
            />

            <BarChartCard
              title="Weekly active users"
              subtitle="Users with profile updates, orders, or listings in each week"
              data={weeklyData}
              valueKey="weeklyActive"
              colorClass="bg-blue-600"
            />
          </div>

          <StackedRoleChart data={weeklyData} />
        </div>
      </div>
    </div>
  );
}
