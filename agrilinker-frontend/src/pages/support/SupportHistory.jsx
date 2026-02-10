import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

const statusStyles = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function normalizeRole(role) {
  return String(role || "").toUpperCase().replace("ROLE_", "");
}

export default function SupportHistory() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [messageText, setMessageText] = useState("");

  const roles = useMemo(() => {
    const storedRoles = localStorage.getItem("roles");
    if (!storedRoles) return [];

    try {
      const parsedRoles = JSON.parse(storedRoles);
      return Array.isArray(parsedRoles) ? parsedRoles : [];
    } catch {
      return [];
    }
  }, []);

  const isBuyer = roles.some((role) => normalizeRole(role) === "BUYER");
  const buyerEmail = localStorage.getItem("email") || "";

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  );

  const chatMessages = useMemo(() => {
    if (!selectedTicket?.messages?.length) return [];

    return selectedTicket.messages.filter((message) => {
      const sender = normalizeRole(message.senderRole);
      const recipient = normalizeRole(message.recipientRole);
      return ["BUYER", "ADMIN"].includes(sender) && ["BUYER", "ADMIN"].includes(recipient);
    });
  }, [selectedTicket]);

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
  }, [buyerEmail, isBuyer]);

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

      setTickets((previous) =>
        previous.map((ticket) =>
          ticket.id === selectedTicket.id ? response.data : ticket,
        ),
      );
      setMessageText("");
      setError("");
    } catch (messageError) {
      console.error(messageError);
      setError("Unable to send your message right now.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Your support history</h1>

        {!isBuyer ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Support history is only available for buyer accounts.
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <Link
              to="/support"
              className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-base leading-none text-green-700">＋</span>
                File new complaint
              </span>
              <span className="text-gray-400">›</span>
            </Link>

            <div className="mt-4 space-y-3">
              {loading ? <p className="text-sm text-gray-500">Loading tickets...</p> : null}

              {!loading && isBuyer && tickets.length === 0 ? (
                <p className="text-sm text-gray-500">No complaints submitted yet.</p>
              ) : null}

              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selectedTicketId === ticket.id
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {ticket.orderId || "Order"}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-gray-900">
                        {ticket.complaintType || "Complaint"}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        statusStyles[ticket.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {(ticket.status || "OPEN").replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{ticket.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white">
            {selectedTicket ? (
              <>
                <div className="rounded-t-xl bg-gradient-to-r from-emerald-700 to-green-600 px-4 py-3 text-white">
                  <p className="text-sm font-semibold">order {selectedTicket.orderId || "-"}</p>
                </div>

                <div className="space-y-4 p-4">
                  <div className="space-y-2 border-b border-gray-200 pb-3 text-xs">
                    <p><span className="font-semibold text-gray-700">Complaint:</span> <span className="text-gray-600">{selectedTicket.complaintType || "-"}</span></p>
                    <p><span className="font-semibold text-gray-700">Preferred resolution:</span> <span className="text-gray-600">{selectedTicket.resolutionPreference || "-"}</span></p>
                    <p><span className="font-semibold text-gray-700">Contact history:</span> <span className="text-gray-600">{selectedTicket.contactMethod || "-"}</span></p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Message history
                    </p>
                    <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                      {chatMessages.length > 0 ? (
                        chatMessages.map((message) => (
                          <div key={message.id} className="rounded-lg bg-gray-100 p-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              {normalizeRole(message.senderRole)} → {normalizeRole(message.recipientRole)}
                            </p>
                            <p className="mt-1 text-xs text-gray-700">{message.message}</p>
                            <p className="mt-1 text-[10px] text-gray-400">{formatDateTime(message.createdAt)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No buyer/admin messages yet.</p>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleMessageSend} className="space-y-2">
                    <textarea
                      rows={3}
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      placeholder="Write a response here.."
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="w-full rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Send message
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="p-4 text-sm text-gray-500">Select a ticket to view details.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
