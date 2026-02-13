import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "./AdminSidebar";
import api from "../../api/api";

const methodBadgeStyles = {
  EMAIL: "bg-blue-100 text-blue-700",
  PHONE: "bg-amber-100 text-amber-700",
  WHATSAPP: "bg-emerald-100 text-emerald-700",
};

const normalizeMethod = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "E-MAIL") return "EMAIL";
  return normalized || "EMAIL";
};

const getPhoneHref = (phoneNumber) => {
  const raw = String(phoneNumber || "").trim();
  if (!raw) return "";
  const cleaned = raw.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
};

const getWhatsAppHref = (phoneNumber, message) => {
  const raw = String(phoneNumber || "").replace(/\D/g, "");
  if (!raw) return "";

  const withCountry = raw.startsWith("94") ? raw : `94${raw.replace(/^0+/, "")}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${withCountry}?text=${encodedMessage}`;
};

const buildReplyDraft = (inquiry) => {
  if (!inquiry) return "";

  const greetingName = inquiry.fullName || "there";
  const submittedMessage = inquiry.message || "your inquiry";

  return [
    `Hi ${greetingName},`,
    "",
    "Thank you for contacting AgriLinker Support.",
    `We received your message about: "${submittedMessage}".`,
    "",
    "Our team is currently reviewing this and we will assist you with the next steps shortly.",
    "If you have additional details (order ID, screenshots, or related references), please share them in your reply.",
    "",
    "Best regards,",
    "AgriLinker Support Team",
  ].join("\n");
};

export default function AdminInquiries() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInquiryId, setSelectedInquiryId] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/contact-us");
        const records = Array.isArray(response.data) ? response.data : [];

        setInquiries(records);
        if (records.length > 0) {
          setSelectedInquiryId(String(records[0].id));
          setReplyMessage(buildReplyDraft(records[0]));
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load contact inquiries right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const selectedInquiry = useMemo(
    () => inquiries.find((inquiry) => String(inquiry.id) === String(selectedInquiryId)) || null,
    [inquiries, selectedInquiryId],
  );

  const preferredMethod = normalizeMethod(selectedInquiry?.preferredContactMethod);
  const callHref = getPhoneHref(selectedInquiry?.phoneNumber);
  const whatsappHref = getWhatsAppHref(selectedInquiry?.phoneNumber, replyMessage);
  const emailHref = selectedInquiry?.email
    ? `mailto:${selectedInquiry.email}?subject=${encodeURIComponent(`Re: ${selectedInquiry.subject || "Your inquiry"}`)}&body=${encodeURIComponent(replyMessage)}`
    : "";

  const handleSend = async () => {
    if (!selectedInquiry || !replyMessage.trim()) {
      toast.error("Select an inquiry and write a reply before sending.");
      return;
    }

    setIsSending(true);

    try {
      await api.post(`/api/contact-us/${selectedInquiry.id}/reply`, {
        message: replyMessage.trim(),
        method: preferredMethod,
      });

      toast.success("Reply saved and sent successfully.");
    } catch (sendError) {
      console.error(sendError);
      toast.warn("Reply endpoint is unavailable. Opening your preferred channel instead.");

      if (preferredMethod === "WHATSAPP" && whatsappHref) {
        window.open(whatsappHref, "_blank", "noopener,noreferrer");
      } else if (preferredMethod === "PHONE" && callHref) {
        window.open(callHref, "_self");
      } else if (emailHref) {
        window.open(emailHref, "_self");
      }
    } finally {
      setIsSending(false);
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
          <header className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-600 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-100">ADMIN INQUIRIES</p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">Contact inquiry management</h1>
            <p className="mt-2 max-w-2xl text-emerald-100">
              Review Contact Us requests, generate a smart draft reply, and send via the
              customer&apos;s preferred contact method.
            </p>
          </header>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div> : null}

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Submitted inquiries</h2>
                <span className="text-sm text-gray-500">{loading ? "Loading..." : `${inquiries.length} total`}</span>
              </div>

              <div className="mt-4 space-y-3">
                {inquiries.map((inquiry) => {
                  const method = normalizeMethod(inquiry.preferredContactMethod);
                  return (
                    <button
                      key={inquiry.id}
                      type="button"
                      onClick={() => {
                        setSelectedInquiryId(String(inquiry.id));
                        setReplyMessage(buildReplyDraft(inquiry));
                      }}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        String(selectedInquiryId) === String(inquiry.id)
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{inquiry.subject || "No subject"}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${methodBadgeStyles[method] || "bg-gray-100 text-gray-600"}`}>
                          {method}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{inquiry.fullName || "Unknown user"}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{inquiry.message}</p>
                    </button>
                  );
                })}

                {!loading && inquiries.length === 0 ? (
                  <p className="text-sm text-gray-500">No contact inquiries submitted yet.</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Inquiry details & reply</h2>

              {selectedInquiry ? (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                    <p><span className="font-semibold text-gray-900">Name:</span> {selectedInquiry.fullName || "Not provided"}</p>
                    <p><span className="font-semibold text-gray-900">Phone:</span> {selectedInquiry.phoneNumber || "Not provided"}</p>
                    <p><span className="font-semibold text-gray-900">Email:</span> {selectedInquiry.email || "Not provided"}</p>
                    <p><span className="font-semibold text-gray-900">Preferred method:</span> {preferredMethod}</p>
                    <p><span className="font-semibold text-gray-900">Submitted:</span> {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : "Unknown"}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-900">Customer message</p>
                    <p className="mt-2 text-sm text-gray-700">{selectedInquiry.message}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-900" htmlFor="replyMessage">
                      Auto-generated reply draft (editable)
                    </label>
                    <textarea
                      id="replyMessage"
                      className="mt-2 min-h-[180px] w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {preferredMethod === "PHONE" && callHref ? <span className="rounded-full bg-amber-50 px-3 py-1">Will open phone dialer</span> : null}
                    {preferredMethod === "WHATSAPP" && whatsappHref ? <span className="rounded-full bg-emerald-50 px-3 py-1">Will open WhatsApp with draft</span> : null}
                    {preferredMethod === "EMAIL" && emailHref ? <span className="rounded-full bg-blue-50 px-3 py-1">Will open email client with draft</span> : null}
                  </div>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSending ? "Sending..." : "Send reply"}
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">Select an inquiry to view and reply.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
