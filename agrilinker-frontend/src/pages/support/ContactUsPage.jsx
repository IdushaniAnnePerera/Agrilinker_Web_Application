import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaChevronDown,
  FaFacebook,
  FaInstagram,
  FaPhoneAlt,
  FaYoutube,
} from "react-icons/fa";
import { MdEmail, MdSupportAgent } from "react-icons/md";
import api from "../../api/api";

const contactMethods = ["Email", "Phone", "WhatsApp"];

const socialLinks = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/@anneperera-w4d",
    icon: FaYoutube,
    classes: "bg-red-50 text-red-600 ring-red-100 hover:bg-red-100",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1Z4MtT14jW/?mibextid=wwXIfr",
    icon: FaFacebook,
    classes: "bg-blue-50 text-blue-600 ring-blue-100 hover:bg-blue-100",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/i.anne.p?igsh=Yjdlejk4NjhhZWZl&utm_source=qr",
    icon: FaInstagram,
    classes:
      "bg-pink-50 text-pink-600 ring-pink-100 hover:bg-pink-100",
  },
];

const faqItems = [
  {
    question: "How soon will I get a response after submitting the form?",
    answer:
      "Most requests receive a response within 24 business hours. Complex issues may take longer, but we will keep you updated.",
  },
  {
    question: "Can I contact AgriLinker for order and payment issues?",
    answer:
      "Yes. Choose the correct subject and include your order ID in the message so our team can investigate faster.",
  },
  {
    question: "How can I follow up on my previous contact requests?",
    answer:
      "Use the 'My contact requests' panel on this page. You can refresh the list and check each request status anytime.",
  },
  {
    question: "What details should I include for quick support?",
    answer:
      "Share your full name, phone number, order/transaction IDs, and a clear message describing what happened and what help you need.",
  },
];

const initialFormState = {
  fullName: "",
  phoneNumber: "",
  subject: "",
  preferredContactMethod: "",
  message: "",
};

const initialErrors = {
  fullName: "",
  phoneNumber: "",
  subject: "",
  preferredContactMethod: "",
  message: "",
};

const statusStyles = {
  NEW: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

export default function ContactUsPage() {
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myInquiries, setMyInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const validateField = (name, value) => {
    const trimmedValue = value.trim();

    if (name === "fullName") {
      if (!trimmedValue) return "Full name is required.";
      if (trimmedValue.length < 3) return "Full name must be at least 3 characters.";
      if (!/^[a-zA-Z\s.'-]+$/.test(trimmedValue)) {
        return "Full name can only include letters, spaces, apostrophes, periods, and hyphens.";
      }
    }

    if (name === "phoneNumber") {
      if (!trimmedValue) return "Phone number is required.";
      if (!/^\+?[0-9\s-]{10,20}$/.test(trimmedValue)) {
        return "Enter a valid phone number (10-20 digits, spaces or hyphens allowed).";
      }
    }

    if (name === "subject") {
      if (!trimmedValue) return "Subject is required.";
      if (trimmedValue.length < 5) return "Subject must be at least 5 characters.";
      if (trimmedValue.length > 120) return "Subject must be 120 characters or less.";
    }

    if (name === "preferredContactMethod") {
      if (!trimmedValue) return "Please choose a preferred contact method.";
    }

    if (name === "message") {
      if (!trimmedValue) return "Message is required.";
      if (trimmedValue.length < 20) return "Message must be at least 20 characters.";
      if (trimmedValue.length > 1000) return "Message must be 1000 characters or less.";
    }

    return "";
  };

  const validateForm = () => {
    const nextErrors = {
      fullName: validateField("fullName", formState.fullName),
      phoneNumber: validateField("phoneNumber", formState.phoneNumber),
      subject: validateField("subject", formState.subject),
      preferredContactMethod: validateField(
        "preferredContactMethod",
        formState.preferredContactMethod,
      ),
      message: validateField("message", formState.message),
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const fetchMyInquiries = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/contact-us/my");
      setMyInquiries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load your contact requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInquiries();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/api/contact-us", {
        fullName: formState.fullName.trim(),
        phoneNumber: formState.phoneNumber.trim(),
        subject: formState.subject.trim(),
        preferredContactMethod: formState.preferredContactMethod,
        message: formState.message.trim(),
      });

      toast.success("Your contact request has been sent.");
      setFormState(initialFormState);
      setErrors(initialErrors);
      await fetchMyInquiries();
    } catch (error) {
      console.error(error);
      const backendMessage = error?.response?.data?.message;
      toast.error(backendMessage || "Unable to send your request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingCharacters = useMemo(
    () => Math.max(0, 1000 - formState.message.length),
    [formState.message],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl bg-gradient-to-r from-green-900 via-green-700 to-green-600 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-green-100">Contact Us</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">We are here to support you 🌱</h1>
          <p className="mt-3 max-w-3xl text-green-100">
            Need help with products, orders, payments, or account settings? Reach out and our team
            will connect with you quickly.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-green-100"
            noValidate
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-green-100 p-2 text-green-700">
                <MdSupportAgent className="text-xl" />
              </span>
              <h2 className="text-xl font-semibold text-gray-900">Send us a message</h2>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="space-y-2 text-sm font-medium text-gray-700">
                Full name
                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
                {errors.fullName ? <p className="text-xs text-red-600">{errors.fullName}</p> : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                Phone number
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formState.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. +94 77 123 4567"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
                {errors.phoneNumber ? (
                  <p className="text-xs text-red-600">{errors.phoneNumber}</p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                Subject
                <input
                  type="text"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
                {errors.subject ? <p className="text-xs text-red-600">{errors.subject}</p> : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                Preferred contact method
                <select
                  name="preferredContactMethod"
                  value={formState.preferredContactMethod}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="">Select an option</option>
                  {contactMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                {errors.preferredContactMethod ? (
                  <p className="text-xs text-red-600">{errors.preferredContactMethod}</p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                Message
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
                <div className="flex items-center justify-between">
                  {errors.message ? <p className="text-xs text-red-600">{errors.message}</p> : <span />}
                  <p className="text-xs text-gray-400">{remainingCharacters} characters left</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send message"}
            </button>
          </form>

          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-green-100">
              <h2 className="text-xl font-semibold text-gray-900">Direct contact details</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <FaPhoneAlt className="text-green-600" />
                  <span>
                    <span className="font-semibold text-gray-900">Hotline:</span>{" "}
                    <a className="text-green-700 hover:underline" href="tel:+94112458899">
                      +94 11 245 8899
                    </a>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <FaPhoneAlt className="text-green-600" />
                  <span>
                    <span className="font-semibold text-gray-900">WhatsApp:</span>{" "}
                    <a
                      className="text-green-700 hover:underline"
                      href="https://wa.me/94772223723"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +94 77 222 3723
                    </a>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <MdEmail className="text-green-600" />
                  <span>
                    <span className="font-semibold text-gray-900">Email:</span>{" "}
                    <a className="text-green-700 hover:underline" href="mailto:support@agrilinker.lk">
                      support@agrilinker.lk
                    </a>
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Business hours:</span> Mon - Sat,
                  8:00 AM to 6:00 PM
                </p>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-900">Follow us on social media</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${link.classes}`}
                      >
                        <Icon />
                        {link.name}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-green-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My contact requests</h2>
                <button
                  type="button"
                  onClick={fetchMyInquiries}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading requests...</p>
                ) : myInquiries.length ? (
                  myInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{inquiry.subject}</p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[inquiry.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {String(inquiry.status || "NEW").replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Preferred contact: {inquiry.preferredContactMethod}
                      </p>
                      <p className="mt-2 text-sm text-gray-700">{inquiry.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No contact requests submitted yet.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-[#d6d1c6] bg-[#f5f3ee] p-8 shadow-sm md:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Common questions about working with AgriLinker.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl space-y-3">
            {faqItems.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-[#d6d1c6] bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex((prev) => (prev === index ? -1 : index))}
                    className="flex w-full items-center justify-between px-6 py-5 text-left text-xl font-semibold text-gray-900 md:text-2xl"
                  >
                    <span>{faq.question}</span>
                    <FaChevronDown
                      className={`text-sm text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  </button>

                  {isOpen ? (
                    <div className="border-t border-[#ece6da] px-6 py-4">
                      <p className="text-base leading-relaxed text-gray-600 md:text-lg">{faq.answer}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
