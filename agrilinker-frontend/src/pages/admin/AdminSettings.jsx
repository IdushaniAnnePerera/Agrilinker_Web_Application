import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import AdminSidebar from "./AdminSidebar";

export default function AdminSettings() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [formState, setFormState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.currentPassword || !formState.newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (formState.newPassword !== formState.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put("/api/admin/password", {
        currentPassword: formState.currentPassword,
        newPassword: formState.newPassword,
      });
      toast.success("Password updated successfully.");
      setFormState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.response?.statusText ||
        "Unable to update password.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
              ADMIN SETTINGS
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">Settings</h1>
            <p className="mt-2 max-w-2xl text-green-100">
              Configure admin preferences and operational defaults.
            </p>
          </header>
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Change password
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the password for your admin account.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="space-y-2 text-sm font-medium text-gray-700">
                Current password
                <input
                  type="password"
                  name="currentPassword"
                  value={formState.currentPassword}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                New password
                <input
                  type="password"
                  name="newPassword"
                  value={formState.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                Confirm new password
                <input
                  type="password"
                  name="confirmPassword"
                  value={formState.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
