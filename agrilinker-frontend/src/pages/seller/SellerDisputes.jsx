import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const statusStyles = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

export default function SellerDisputes() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  );

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
          `/api/support-tickets/seller/${user.id || user._id}`,
        );
        setTickets(response.data || []);
        if (response.data?.length) {
          setSelectedTicketId(response.data[0].id);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load disputes right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const filteredTickets = useMemo(() => {
    if (!searchValue.trim()) return tickets;
    return tickets.filter((ticket) =>
      (ticket.orderId || "").toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [tickets, searchValue]);

  const handleMessageSend = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !messageText.trim()) return;
    try {
      const response = await api.post(
        `/api/support-tickets/${selectedTicket.id}/messages`,
        {
          senderRole: "SELLER",
          recipientRole: "BUYER",
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
      setError("Unable to send the message.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl bg-gradient-to-r from-green-800 via-green-700 to-green-600 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-green-100">
            Seller Support
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Dispute responses
          </h1>
          <p className="mt-2 max-w-2xl text-green-100">
            Review buyer complaints tied to your orders and respond with context.
          </p>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Dispute tickets
              </h2>
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by order ID"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 sm:w-56"
              />
            </div>
            <div className="mt-5 space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading disputes...</p>
              ) : null}
              {!loading && !user ? (
                <p className="text-sm text-gray-500">
                  Please sign in to view dispute tickets.
                </p>
              ) : null}
              {!loading && user && filteredTickets.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No disputes assigned to you yet.
                </p>
              ) : null}
              {filteredTickets.map((ticket) => (
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
                      <p className="text-sm text-gray-500">
                        {ticket.orderId || "Order not provided"}
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {ticket.complaintType}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[ticket.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ticket.status?.replace("_", " ") || "Pending"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Ticket details
            </h2>
            {selectedTicket ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-medium text-gray-900">Buyer complaint</p>
                  <p className="mt-2">{selectedTicket.description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Message history
                  </p>
                  <div className="mt-3 space-y-3">
                    {(selectedTicket.messages || []).length ? (
                      selectedTicket.messages.map((message) => (
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
                      <p className="text-sm text-gray-500">
                        No messages yet.
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleMessageSend} className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Send a response
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    rows={3}
                    placeholder="Respond to the buyer with details or next steps."
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Send response
                  </button>
                </form>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                Select a ticket to respond.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
