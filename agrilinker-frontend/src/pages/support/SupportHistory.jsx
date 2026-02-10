import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

const statusStyles = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

export default function SupportHistory() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [messageText, setMessageText] = useState("");
  const roles = useMemo(() => {
    const storedRoles = localStorage.getItem("roles");
    return storedRoles ? JSON.parse(storedRoles) : [];
  }, []);
  const isBuyer = roles.includes("BUYER");
  const buyerEmail = localStorage.getItem("email") || "";

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  );

  useEffect(() => {
    const fetchTickets = async () => {
      if (!isBuyer || !buyerEmail) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await api.get(
          `/api/support-tickets/buyer/${encodeURIComponent(buyerEmail)}`,
        );
        const data = response.data || [];
        setTickets(data);
        if (data.length > 0) {
          setSelectedTicketId(data[0].id);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load your ticket history right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isBuyer, buyerEmail]);

  const handleMessageSend = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !messageText.trim()) return;

    try {
      const response = await api.post(
        `/api/support-tickets/${selectedTicket.id}/messages`,
        {
          senderRole: "BUYER",
          recipientRole: "ADMIN",
          message: messageText.trim(),
        },
      );
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === selectedTicket.id ? response.data : ticket,
        ),
      );
      setMessageText("");
    } catch (messageError) {
      console.error(messageError);
      setError("Unable to send your message right now.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl bg-gradient-to-r from-green-800 via-green-700 to-green-600 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-green-100">
            Support Center
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Your support history
          </h1>
          <p className="mt-2 max-w-2xl text-green-100">
            View and continue conversations between buyer and admin.
          </p>
        </header>

        {!isBuyer ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Support history is only available for buyer accounts.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Submitted complaints</h2>
              <Link
                to="/support"
                className="text-sm font-semibold text-green-700 transition hover:text-green-800"
              >
                File new complaint
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {loading ? <p className="text-sm text-gray-500">Loading tickets...</p> : null}
              {!loading && isBuyer && tickets.length === 0 ? (
                <p className="text-sm text-gray-500">No complaints submitted yet.</p>
              ) : null}
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selectedTicketId === ticket.id
                      ? "border-green-300 bg-green-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{ticket.orderId || "Order not provided"}</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">{ticket.complaintType}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[ticket.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ticket.status?.replace("_", " ") || "Pending"}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">{ticket.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
            {selectedTicket ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-medium text-gray-900">Complaint details</p>
                  <p className="mt-2">{selectedTicket.description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Buyer/Admin messages</p>
                  <div className="mt-3 space-y-3">
                    {(selectedTicket.messages || []).filter(
                      (message) => ["BUYER", "ADMIN"].includes(message.senderRole)
                        && ["BUYER", "ADMIN"].includes(message.recipientRole),
                    ).length ? (
                      (selectedTicket.messages || [])
                        .filter(
                          (message) => ["BUYER", "ADMIN"].includes(message.senderRole)
                            && ["BUYER", "ADMIN"].includes(message.recipientRole),
                        )
                        .map((message) => (
                          <div
                            key={message.id}
                            className="rounded-2xl border border-gray-100 p-3 text-sm text-gray-700"
                          >
                            <p className="text-xs font-semibold uppercase text-gray-400">
                              {message.senderRole} → {message.recipientRole}
                            </p>
                            <p className="mt-2">{message.message}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">No buyer/admin messages yet.</p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleMessageSend} className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Send message to admin</label>
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    rows={3}
                    placeholder="Write your message to admin"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Send message
                  </button>
                </form>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">Select a ticket to view conversation.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
