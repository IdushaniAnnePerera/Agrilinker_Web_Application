import { useEffect, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const statusStyles = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id && !user?._id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await api.get(
          `/api/support-tickets/buyer/${user.id || user._id}`,
        );
        setTickets(response.data || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load your support history right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100 lg:w-1/3">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <div className="mt-6 space-y-4 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase text-gray-400">Name</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {user?.fullName || user?.name || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Email</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {user?.email || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Phone</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {user?.telephone || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Address</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {user?.address || "Not provided"}
              </p>
            </div>
          </div>
        </section>

        <section className="flex-1 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Support history
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track your complaint status and admin responses.
              </p>
            </div>
            <span className="text-sm text-gray-500">
              {loading ? "Loading..." : `${tickets.length} tickets`}
            </span>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {!loading && !user ? (
              <p className="text-sm text-gray-500">
                Please sign in to view your ticket history.
              </p>
            ) : null}
            {!loading && user && tickets.length === 0 ? (
              <p className="text-sm text-gray-500">
                No complaints submitted yet.
              </p>
            ) : null}
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {ticket.orderId || "Order not provided"}
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {ticket.complaintType}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[ticket.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ticket.status?.replace("_", " ") || "Pending"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {ticket.description}
                </p>
                {ticket.messages?.length ? (
                  <div className="mt-4 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Latest admin message
                    </p>
                    <p className="mt-2">
                      {ticket.messages[ticket.messages.length - 1].message}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
