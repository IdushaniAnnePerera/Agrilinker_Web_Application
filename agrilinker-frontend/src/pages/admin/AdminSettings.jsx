import { useState } from "react";
import api from "../../api/api";
import AdminSidebar from "./AdminSidebar";

export default function AdminSettings() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // renamed from "status" to "alert" to avoid global-name lint conflicts
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setAlert({ type: "", message: "" });

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setAlert({ type: "error", message: "Please fill in all password fields." });
      return;
    }

    if (form.newPassword.length < 8) {
      setAlert({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setAlert({ type: "error", message: "New password and confirm password do not match." });
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setAlert({ type: "error", message: "New password must be different from the current password." });
      return;
    }

    setIsSaving(true);
    try {
      await api.put("/api/admin/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setAlert({ type: "success", message: "Password updated successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      if (error?.response?.status === 403) {
        setAlert({ type: "error", message: "Current password is incorrect." });
      } else if (error?.response?.status === 400) {
        setAlert({ type: "error", message: "Invalid password payload. Please review and try again." });
      } else {
        setAlert({ type: "error", message: "Unable to update password right now." });
      }
    } finally {
      setIsSaving(false);
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
            <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update your admin account password securely.
            </p>

            {alert.message ? (
              <div
                className={`mt-4 rounded-2xl border p-4 text-sm ${
                  alert.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {alert.message}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="currentPassword">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="newPassword">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Updating..." : "Update password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
