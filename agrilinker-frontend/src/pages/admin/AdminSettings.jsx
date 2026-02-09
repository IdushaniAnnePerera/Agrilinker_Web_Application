import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminSettings() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

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
            <p className="text-sm text-gray-500">
              Settings controls will be available here soon.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
