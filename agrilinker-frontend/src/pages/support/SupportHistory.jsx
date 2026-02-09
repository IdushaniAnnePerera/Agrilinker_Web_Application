import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const statusStyles = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

export default function SupportHistory() {
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
        setError("Unable to load your ticket history right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl bg-gradient-to-r from-green-800 via-green-700 to-green-600 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-green-100">
            Support Center
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Your ticket history
          </h1>
          <p className="mt-2 max-w-2xl text-green-100">
            Track status updates and responses from our support team.
          </p>
        </header>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Submitted complaints
            </h2>
            <Link
              to="/support"
              className="text-sm font-semibold text-green-700 transition hover:text-green-800"
            >
              File a new complaint
            </Link>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading tickets...</p>
            ) : null}
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
                    <p className="mt-2 text-sm text-gray-600">
                      {ticket.description}
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
                {ticket.messages?.length ? (
                  <div className="mt-4 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Latest message
                    </p>
                    <p className="mt-2">
                      {ticket.messages[ticket.messages.length - 1].message}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
