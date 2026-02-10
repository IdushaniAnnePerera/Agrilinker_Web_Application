import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminSidebar from "./AdminSidebar";

const WEEKS_TO_SHOW = 8;
const MONTHS_TO_SHOW = 12;

const shortWeekFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
const lkrFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
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

function toDateSafe(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

function buildMonthBuckets() {
  const now = new Date();
  const buckets = [];

  for (let index = MONTHS_TO_SHOW - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    buckets.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: monthFormatter.format(date),
      start: date,
      end: nextDate,
      totalSales: 0,
    });
  }

  return buckets;
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

function ComplaintStatusPieCard({ statusData }) {
  const total = statusData.reduce((sum, item) => sum + item.value, 0);
  const colors = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

  let currentAngle = 0;
  const gradientStops = statusData
    .map((item, index) => {
      const angle = total ? (item.value / total) * 360 : 0;
      const start = currentAngle;
      const end = currentAngle + angle;
      currentAngle = end;
      return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">Complaint Status Distribution</h2>
      <p className="mt-1 text-sm text-gray-500">Pie chart of complaints by status.</p>

      <div className="mt-6 flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <div
          className="h-44 w-44 rounded-full"
          style={{
            background: total ? `conic-gradient(${gradientStops})` : "#e5e7eb",
          }}
        />

        <div className="w-full space-y-3">
          {statusData.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="inline-flex items-center gap-2 text-gray-700">
                <span className="h-3 w-3 rounded-full" style={{ background: colors[index % colors.length] }} />
                {item.label}
              </div>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
          <p className="pt-2 text-xs text-gray-500">Total complaints: {total}</p>
        </div>
      </div>
    </section>
  );
}

function TopProductsCard({ products }) {
  const maxQty = Math.max(1, ...products.map((product) => product.quantity));

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">Top 10 products by purchase</h2>
      <p className="mt-1 text-sm text-gray-500">Most purchased products by total quantity sold.</p>

      <div className="mt-6 space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">No product purchase data available.</p>
        ) : (
          products.map((product, index) => {
            const width = Math.max(6, Math.round((product.quantity / maxQty) * 100));
            return (
              <div key={product.name} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3">
                <span className="text-xs font-semibold text-gray-500">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-700">{product.quantity}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function SalesOverviewCard({ monthlySales }) {
  const max = Math.max(1, ...monthlySales.map((item) => item.totalSales));
  const min = Math.min(0, ...monthlySales.map((item) => item.totalSales));
  const span = Math.max(1, max - min);

  const points = monthlySales.map((item, index) => {
    const x = (index / Math.max(1, monthlySales.length - 1)) * 100;
    const y = 100 - ((item.totalSales - min) / span) * 100;
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L 100 100 L 0 100 Z`;
  const latestSales = monthlySales[monthlySales.length - 1]?.totalSales || 0;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sales Overview</h2>
          <p className="mt-1 text-sm text-gray-500">Last 12 months revenue trend (LKR).</p>
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Last 12 months</div>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-900">{lkrFormatter.format(latestSales)}</p>

      <div className="mt-4 rounded-xl border border-gray-100 bg-gradient-to-b from-indigo-50 to-white p-3">
        <svg viewBox="0 0 100 100" className="h-52 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#salesArea)" />
          <path d={linePath} fill="none" stroke="#4338ca" strokeWidth="1.8" />
        </svg>
        <div className="mt-2 grid grid-cols-6 gap-2 text-[11px] text-gray-500 sm:grid-cols-12">
          {monthlySales.map((item) => (
            <span key={item.key}>{item.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AdminAnalysis() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setError("");
      try {
        const [usersRes, rawOrdersRes, productsRes, ticketsRes] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/orders"),
          api.get("/api/admin/products"),
          api.get("/api/support-tickets"),
        ]);

        setUsers(usersRes.data || []);
        setOrders(rawOrdersRes.data || []);
        setProducts(productsRes.data || []);
        setTickets(ticketsRes.data || []);
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

      const customerEmail = String(order?.customer?.email || order?.customerEmail || "").toLowerCase();
      const userId = usersByEmail.get(customerEmail);
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

  const complaintStatusData = useMemo(() => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, OTHER: 0 };
    tickets.forEach((ticket) => {
      const status = String(ticket.status || "").toUpperCase();
      if (status in counts) counts[status] += 1;
      else counts.OTHER += 1;
    });

    return [
      { label: "Open", value: counts.OPEN },
      { label: "In Progress", value: counts.IN_PROGRESS },
      { label: "Resolved", value: counts.RESOLVED },
      { label: "Other", value: counts.OTHER },
    ];
  }, [tickets]);

  const topProducts = useMemo(() => {
    const productMap = new Map();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = String(item.name || "Unnamed Product").trim();
        if (!name) return;
        const qty = Number(item.quantity || 0);
        productMap.set(name, (productMap.get(name) || 0) + qty);
      });
    });

    return Array.from(productMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [orders]);

  const monthlySales = useMemo(() => {
    const monthBuckets = buildMonthBuckets();

    monthBuckets.forEach((bucket) => {
      orders.forEach((order) => {
        const orderDate = toDateSafe(order.orderDate);
        if (!orderDate) return;
        if (orderDate >= bucket.start && orderDate < bucket.end) {
          bucket.totalSales += Number(order.totalAmount || 0);
        }
      });
    });

    return monthBuckets;
  }, [orders]);

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
              Weekly trends, complaint distribution, top products, and Sri Lankan rupee sales overview.
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

          <div className="grid gap-6 xl:grid-cols-2">
            <ComplaintStatusPieCard statusData={complaintStatusData} />
            <TopProductsCard products={topProducts} />
          </div>

          <SalesOverviewCard monthlySales={monthlySales} />
        </div>
      </div>
    </div>
  );
}
