import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "./AdminSidebar";
import api from "../../api/api";

const methodBadgeStyles = {
    EMAIL: "bg-blue-100 text-blue-700",
    PHONE: "bg-amber-100 text-amber-700",
    WHATSAPP: "bg-emerald-100 text-emerald-700",
};

const repliedBadgeStyle = "bg-red-100 text-red-700";

const normalizeMethod = (value) => {
    const normalized = String(value || "").trim().toUpperCase();
    if (!normalized) return "EMAIL";
    if (normalized === "E-MAIL") return "EMAIL";
    if (normalized === "WHATS APP") return "WHATSAPP";
    return normalized;
};

// ✅ supports id / _id
const getInquiryId = (inquiry) => String(inquiry?.id ?? inquiry?._id ?? "");

const isReplied = (inquiry) => {
    // ✅ works with your updated backend fields
    return Boolean(inquiry?.replyMessage || inquiry?.repliedAt || inquiry?.replyMethod);
};

const getPhoneHref = (phoneNumber) => {
    const raw = String(phoneNumber || "").trim();
    if (!raw) return "";
    const cleaned = raw.replace(/[^\d+]/g, "");
    return cleaned ? `tel:${cleaned}` : "";
};

const toSriLankaWhatsAppNumber = (phoneNumber) => {
    let raw = String(phoneNumber || "").trim();
    if (!raw) return "";
    raw = raw.replace(/\D/g, "");
    if (!raw) return "";

    if (raw.startsWith("94")) return raw;
    raw = raw.replace(/^0+/, "");
    return `94${raw}`;
};

const getWhatsAppHref = (phoneNumber, message) => {
    const withCountry = toSriLankaWhatsAppNumber(phoneNumber);
    if (!withCountry) return "";
    const encodedMessage = encodeURIComponent(message || "");
    return `https://wa.me/${withCountry}?text=${encodedMessage}`;
};

const buildReplyDraft = (inquiry) => {
    if (!inquiry) return "";

    const greetingName = inquiry.fullName || "there";
    const subject = inquiry.subject || "your inquiry";
    const submittedMessage = inquiry.message || "your inquiry";

    return [
        `Hi ${greetingName},`,
        "",
        "Thank you for contacting AgriLinker Support.",
        `We received your message regarding: "${subject}".`,
        "",
        `Your message: "${submittedMessage}"`,
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

    const fetchInquiries = async (keepId = "") => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/contact-us");
            const records = Array.isArray(response.data) ? response.data : [];
            setInquiries(records);

            const desiredId = keepId || selectedInquiryId;
            const exists = records.some((r) => getInquiryId(r) === String(desiredId));

            if (!records.length) {
                setSelectedInquiryId("");
                setReplyMessage("");
            } else if (exists) {
                setSelectedInquiryId(String(desiredId));
                // ✅ do NOT auto-fill replyMessage here (we want it cleared after sending)
            } else {
                const first = records[0];
                setSelectedInquiryId(getInquiryId(first));
                setReplyMessage(buildReplyDraft(first));
            }
        } catch (fetchError) {
            console.error(fetchError);
            setError("Unable to load contact inquiries right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ move replied to bottom + keep newest first within each group
    const sortedInquiries = useMemo(() => {
        const copy = [...inquiries];
        copy.sort((a, b) => {
            const ar = isReplied(a) ? 1 : 0;
            const br = isReplied(b) ? 1 : 0;
            if (ar !== br) return ar - br; // unreplied first, replied last

            const ad = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bd = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bd - ad; // newest first
        });
        return copy;
    }, [inquiries]);

    const selectedInquiry = useMemo(
        () => inquiries.find((inquiry) => getInquiryId(inquiry) === String(selectedInquiryId)) || null,
        [inquiries, selectedInquiryId],
    );

    const preferredMethod = normalizeMethod(selectedInquiry?.preferredContactMethod);
    const callHref = getPhoneHref(selectedInquiry?.phoneNumber);
    const whatsappHref = getWhatsAppHref(selectedInquiry?.phoneNumber, replyMessage);

    // ✅ backend field is senderEmail
    const customerEmail = selectedInquiry?.senderEmail || "";
    const emailHref = customerEmail
        ? `mailto:${customerEmail}?subject=${encodeURIComponent(
            `Re: ${selectedInquiry?.subject || "Your inquiry"}`,
        )}&body=${encodeURIComponent(replyMessage)}`
        : "";

    const openFallbackChannel = () => {
        if (preferredMethod === "WHATSAPP" && whatsappHref) {
            window.open(whatsappHref, "_blank", "noopener,noreferrer");
            return;
        }
        if (preferredMethod === "PHONE" && callHref) {
            window.location.href = callHref;
            return;
        }
        if (emailHref) {
            window.location.href = emailHref;
            return;
        }
        toast.error("No valid contact channel found (missing email/phone).");
    };

    const handleSend = async () => {
        if (!selectedInquiry || !replyMessage.trim()) {
            toast.error("Select an inquiry and write a reply before sending.");
            return;
        }

        setIsSending(true);
        const id = getInquiryId(selectedInquiry);

        try {
            await api.post(`/api/contact-us/${id}/reply`, {
                message: replyMessage.trim(),
                method: preferredMethod,
            });

            toast.success("Reply saved. Opening preferred channel…");

            // ✅ refresh list to get reply fields (replyMessage/repliedAt) so tag becomes REPLIED
            await fetchInquiries(id);

            // ✅ clear reply area after sending
            setReplyMessage("");

            // ✅ open preferred channel (WhatsApp/Phone/Email)
            openFallbackChannel();
        } catch (sendError) {
            console.error(sendError);
            toast.error(sendError?.response?.data?.message || "Failed to save reply.");
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
                            Review Contact Us requests, auto-generate a reply, edit it, then send via the customer&apos;s
                            preferred contact method.
                        </p>
                    </header>

                    {error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
                    ) : null}

                    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                        {/* LEFT LIST */}
                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Submitted inquiries</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {loading ? "Loading..." : `${inquiries.length} total`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => fetchInquiries(selectedInquiryId)}
                                        className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {sortedInquiries.map((inquiry) => {
                                    const id = getInquiryId(inquiry);
                                    const method = normalizeMethod(inquiry.preferredContactMethod);
                                    const replied = isReplied(inquiry);

                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedInquiryId(id);

                                                // ✅ if already replied, don't auto-fill the draft again
                                                if (replied) {
                                                    setReplyMessage("");
                                                } else {
                                                    setReplyMessage(buildReplyDraft(inquiry));
                                                }
                                            }}
                                            className={`w-full rounded-2xl border px-4 py-4 text-left transition ${String(selectedInquiryId) === String(id)
                                                ? "border-emerald-300 bg-emerald-50"
                                                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold text-gray-900">{inquiry.subject || "No subject"}</p>

                                                <div className="flex items-center gap-2">
                                                    {replied ? (
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${repliedBadgeStyle}`}>
                                                            REPLIED
                                                        </span>
                                                    ) : null}

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${methodBadgeStyles[method] || "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {method}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="mt-2 text-xs text-gray-500">
                                                {inquiry.fullName || "Unknown user"} • {inquiry.senderEmail || "No email"}
                                            </p>

                                            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{inquiry.message}</p>
                                        </button>
                                    );
                                })}

                                {!loading && inquiries.length === 0 ? (
                                    <p className="text-sm text-gray-500">No contact inquiries submitted yet.</p>
                                ) : null}
                            </div>
                        </section>

                        {/* RIGHT DETAILS */}
                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Inquiry details & reply</h2>

                            {selectedInquiry ? (
                                <div className="mt-4 space-y-4">
                                    <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                                        <p><span className="font-semibold text-gray-900">Name:</span> {selectedInquiry.fullName || "Not provided"}</p>
                                        <p><span className="font-semibold text-gray-900">Phone:</span> {selectedInquiry.phoneNumber || "Not provided"}</p>
                                        <p><span className="font-semibold text-gray-900">Email:</span> {selectedInquiry.senderEmail || "Not provided"}</p>
                                        <p><span className="font-semibold text-gray-900">Preferred method:</span> {preferredMethod}</p>
                                        <p><span className="font-semibold text-gray-900">Submitted:</span> {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : "Unknown"}</p>

                                        {isReplied(selectedInquiry) ? (
                                            <p className="pt-2 text-xs font-semibold text-red-600">
                                                This inquiry is already replied.
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                                        <p className="text-sm font-semibold text-gray-900">Customer message</p>
                                        <p className="mt-2 text-sm text-gray-700">{selectedInquiry.message}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-900" htmlFor="replyMessage">
                                            Reply (editable)
                                        </label>
                                        <textarea
                                            id="replyMessage"
                                            placeholder={isReplied(selectedInquiry) ? "Reply already sent. Select another inquiry to reply." : ""}
                                            className="mt-2 min-h-[180px] w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                            value={replyMessage}
                                            onChange={(event) => setReplyMessage(event.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSend}
                                        disabled={isSending || isReplied(selectedInquiry)} // ✅ prevent sending again
                                        className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSending ? "Sending..." : "Save reply & Send"}
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
