import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminSidebar from "./AdminSidebar";

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED"];

const statusStyles = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};


export default function AdminComplaints() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [statusSelection, setStatusSelection] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  );

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError("");
      try {
        const [ticketsResponse, usersResponse] = await Promise.all([
          api.get("/api/support-tickets"),
          api.get("/api/admin/users"),
        ]);

        setTickets(ticketsResponse.data || []);
        setUsers(usersResponse.data || []);
        if (ticketsResponse.data?.length) {
          setSelectedTicketId(ticketsResponse.data[0].id);
          setStatusSelection(ticketsResponse.data[0].status);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load complaints right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket?.status) {
      setStatusSelection(selectedTicket.status);
    }

    setSelectedOrder(null);
    setSelectedOrderItem(null);
    setSelectedFarmer(null);
    setOrderError("");
  }, [selectedTicket]);

  const resolveFarmerByItem = (item) => {
    if (!item) return null;

    const farmerEmail =
      item.farmerEmail ||
      item.sellerEmail ||
      item.ownerEmail ||
      item?.product?.farmerEmail;

    if (!farmerEmail) {
      return null;
    }

    return users.find((user) => user.email === farmerEmail) || null;
  };

  const loadOrderDetails = async () => {
    if (!selectedTicket?.orderId) {
      setOrderError("This complaint does not include an order ID.");
      return;
    }

    setOrderLoading(true);
    setOrderError("");
    setSelectedOrder(null);
    setSelectedOrderItem(null);
    setSelectedFarmer(null);

    try {
      const response = await api.get("/api/orders");
      const orders = response.data || [];
      const matchingOrder = orders.find(
        (order) =>
          order.id === selectedTicket.orderId ||
          order._id === selectedTicket.orderId ||
          order.orderNumber === selectedTicket.orderId,
      );

      if (!matchingOrder) {
        setOrderError(`No order found for ID: ${selectedTicket.orderId}`);
        return;
      }

      setSelectedOrder(matchingOrder);
    } catch (fetchOrderError) {
      console.error(fetchOrderError);
      setOrderError("Unable to load order details right now.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleOrderItemClick = (item) => {
    setSelectedOrderItem(item);
    setSelectedFarmer(resolveFarmerByItem(item));
  };

  const handleStatusUpdate = async () => {
    if (!selectedTicket) return;
    try {
      const response = await api.put(
        `/api/support-tickets/${selectedTicket.id}/status`,
        { status: statusSelection },
      );
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === selectedTicket.id ? response.data : ticket,
        ),
      );
    } catch (updateError) {
      console.error(updateError);
      setError("Unable to update ticket status.");
    }
  };

  const handleMessageSend = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !messageText.trim()) return;

    try {
      const response = await api.post(
        `/api/support-tickets/${selectedTicket.id}/messages`,
        {
          senderRole: "ADMIN",
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-10">
        <AdminSidebar
          isExpanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded((prev) => !prev)}
        />

        <div className="flex-1 space-y-8">
          <header className="rounded-3xl bg-gradient-to-r from-green-900 via-green-700 to-green-600 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-green-100">
              ADMIN COMPLAINTS
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Complaint management
            </h1>
            <p className="mt-2 max-w-2xl text-green-100">
              Review buyer reports, assign a status, and communicate to resolve
              disputes.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Open tickets
                </h2>
                <span className="text-sm text-gray-500">
                  {loading ? "Loading..." : `${tickets.length} total`}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${selectedTicketId === ticket.id
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
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[ticket.status] ||
                          "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {ticket.status?.replace("_", " ") || "Pending"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {ticket.description}
                    </p>
                  </button>
                ))}

                {!loading && tickets.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No complaints submitted yet.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Ticket details
              </h2>

              {selectedTicket ? (
                <div className="mt-5 space-y-6">
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-900">
                        Complaint:
                      </span>{" "}
                      {selectedTicket.complaintType}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">
                        Order ID:
                      </span>{" "}
                      {selectedTicket.orderId ? (
                        <button
                          type="button"
                          onClick={loadOrderDetails}
                          className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 transition hover:bg-green-200"
                        >
                          {selectedTicket.orderId}
                        </button>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">
                        Preferred resolution:
                      </span>{" "}
                      {selectedTicket.resolutionPreference || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">
                        Contact method:
                      </span>{" "}
                      {selectedTicket.contactMethod || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">
                        Submitted:
                      </span>{" "}
                      {selectedTicket.createdAt
                        ? new Date(selectedTicket.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="font-medium text-gray-900">Buyer message</p>
                    <p className="mt-2">{selectedTicket.description}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900">
                        Order details
                      </p>
                      <button
                        type="button"
                        onClick={loadOrderDetails}
                        disabled={!selectedTicket.orderId || orderLoading}
                        className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {orderLoading ? "Loading..." : "Open order"}
                      </button>
                    </div>

                    {orderError ? (
                      <p className="mt-3 text-sm text-red-600">{orderError}</p>
                    ) : null}

                    {selectedOrder ? (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                          <p>
                            <span className="font-medium text-gray-900">Order:</span>{" "}
                            {selectedOrder.orderNumber || selectedOrder.id}
                          </p>
                          <p>
                            <span className="font-medium text-gray-900">Buyer:</span>{" "}
                            {selectedOrder.customer?.name || "Unknown"} ({selectedOrder.customer?.email || "No email"})
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Ordered products (click to view farmer)
                          </p>
                          <div className="mt-2 space-y-2">
                            {(selectedOrder.items || []).map((item, index) => (
                              <button
                                key={`${item.itemId || item.productId || item.fertilizerId || item.name}-${index}`}
                                type="button"
                                onClick={() => handleOrderItemClick(item)}
                                className="w-full rounded-xl border border-gray-100 p-3 text-left text-sm transition hover:border-green-300 hover:bg-green-50"
                              >
                                <p className="font-medium text-gray-900">{item.name || "Unnamed item"}</p>
                                <p className="text-xs text-gray-500">
                                  Qty {item.quantity || 0} • LKR {Number(item.price || 0).toFixed(2)}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {selectedOrderItem ? (
                          <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-gray-700">
                            <p className="font-semibold text-gray-900">Farmer details</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Selected item: {selectedOrderItem.name || "Unnamed item"}
                            </p>
                            {selectedFarmer ? (
                              <div className="mt-2 space-y-1">
                                <p>
                                  <span className="font-medium text-gray-900">Name:</span>{" "}
                                  {selectedFarmer.fullName || "Not available"}
                                </p>
                                <p>
                                  <span className="font-medium text-gray-900">Email:</span>{" "}
                                  {selectedFarmer.email || "Not available"}
                                </p>
                                <p>
                                  <span className="font-medium text-gray-900">Phone:</span>{" "}
                                  {selectedFarmer.telephone || "Not available"}
                                </p>
                                <p>
                                  <span className="font-medium text-gray-900">Address:</span>{" "}
                                  {selectedFarmer.address || "Not available"}
                                </p>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-amber-700">
                                Farmer information is not attached to this order item.
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Update status
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <select
                        value={statusSelection}
                        onChange={(event) =>
                          setStatusSelection(event.target.value)
                        }
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option.replace("_", " ")}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleStatusUpdate}
                        className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                      >
                        Save status
                      </button>
                    </div>
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
                            <p className="mt-2 text-xs text-gray-400">
                              {message.createdAt
                                ? new Date(message.createdAt).toLocaleString()
                                : ""}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No messages yet.</p>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleMessageSend} className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Send a message to Buyer
                    </label>

                    <div className="flex flex-col gap-3">
                      <textarea
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                        rows={3}
                        placeholder="Write a response to the buyer."
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                      />

                      <button
                        type="submit"
                        className="self-start rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                      >
                        Send message
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Select a ticket to review details.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
