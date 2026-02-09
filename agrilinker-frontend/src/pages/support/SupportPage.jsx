import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const complaintOptions = [
  "Wrong product",
  "Scam",
  "Quality issue",
  "Payment issue",
  "Other",
];

const resolutionOptions = ["Refund", "Replace", "Cancel", "Other"];
const contactOptions = ["Email", "Phone"];

const initialFormState = {
  orderId: "",
  complaintType: "",
  resolutionPreference: "",
  contactMethod: "",
  contactValue: "",
  description: "",
};

export default function SupportPage() {
  const { user } = useAuth();
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const suggestedContact = useMemo(() => {
    if (!user) return "";
    return formState.contactMethod === "Phone"
      ? user.telephone || ""
      : user.email || "";
  }, [formState.contactMethod, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "contactMethod" ? { contactValue: "" } : null),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        orderId: formState.orderId.trim(),
        complaintType: formState.complaintType,
        resolutionPreference: formState.resolutionPreference,
        contactMethod: formState.contactMethod,
        contactValue: formState.contactValue.trim() || suggestedContact,
        buyerId: user?.id || user?._id || null,
        buyerEmail: user?.email || null,
        description: formState.description.trim(),
      };

      await api.post("/api/support-tickets", payload);

      toast.success("Your complaint has been submitted.");
      setFormState(initialFormState);
    } catch (error) {
      console.error(error);
      toast.error("Unable to submit your complaint right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl bg-gradient-to-r from-green-800 via-green-700 to-green-600 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-green-100">
            Support Center
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Report a complaint
          </h1>
          <p className="mt-2 max-w-2xl text-green-100">
            Share issues like wrong products, missing deliveries, or potential scams.
            Our support team will review your request and assist both parties.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100"
        >
          <div className="grid gap-6">
            <label className="space-y-2 text-sm font-medium text-gray-700">
              Order or transaction ID
              <input
                type="text"
                name="orderId"
                value={formState.orderId}
                onChange={handleChange}
                placeholder="e.g. ORD-10024"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Complaint type
              <select
                name="complaintType"
                value={formState.complaintType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                required
              >
                <option value="">Select an option</option>
                {complaintOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Preferred resolution
              <select
                name="resolutionPreference"
                value={formState.resolutionPreference}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                required
              >
                <option value="">Select an option</option>
                {resolutionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Contact method
              <select
                name="contactMethod"
                value={formState.contactMethod}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                required
              >
                <option value="">Select an option</option>
                {contactOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Contact detail
              <input
                type="text"
                name="contactValue"
                value={formState.contactValue || suggestedContact}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    contactValue: event.target.value,
                  }))
                }
                placeholder={
                  formState.contactMethod === "Phone"
                    ? "Enter a phone number"
                    : "Enter an email address"
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              What happened?
              <textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us what went wrong and what resolution you need."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                required
              />
            </label>

          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit complaint"}
            </button>
            <p className="text-sm text-gray-500">
              We’ll update you when the ticket status changes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
