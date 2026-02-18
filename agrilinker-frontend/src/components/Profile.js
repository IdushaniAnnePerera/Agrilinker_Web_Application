import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { addRole, changePassword } from "../api/auth";

const ALL_ROLES = ["FARMER", "BUYER", "FERTILIZERSUPPLIER"];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [roleMsg, setRoleMsg] = useState("");
  const [roleErr, setRoleErr] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  const token = localStorage.getItem("token");

  const loadProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setError("");
    } catch (e) {
      setError("Profile not found or token expired.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const missingRoles = useMemo(() => {
    const currentRoles = (profile?.roles || []).map((r) =>
      String(r || "").toUpperCase()
    );
    return ALL_ROLES.filter((role) => !currentRoles.includes(role));
  }, [profile]);

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");

    if (newPassword.length < 8) {
      setPasswordErr("New password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword }, token);
      setPasswordMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setPasswordErr(e?.response?.data?.error || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const submitRoleRegistration = async (e) => {
    e.preventDefault();
    setRoleMsg("");
    setRoleErr("");

    if (!selectedRole) {
      setRoleErr("Please select a role to register.");
      return;
    }

    setRoleLoading(true);
    try {
      const res = await addRole(selectedRole, token);
      const updatedRoles = res?.data?.roles || [];

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          roles: updatedRoles,
        })
      );
      localStorage.setItem("roles", JSON.stringify(updatedRoles));

      setRoleMsg(`You are now registered as ${selectedRole}.`);
      setSelectedRole("");
      await loadProfile();
    } catch (e) {
      setRoleErr(e?.response?.data?.error || "Failed to add role.");
    } finally {
      setRoleLoading(false);
    }
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!profile) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white border rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-green-800 mb-4">My Profile</h1>

        <div className="space-y-3 text-gray-700">
          <div>
            <b>Full Name:</b> {profile.fullName}
          </div>
          <div>
            <b>Email:</b> {profile.email}
          </div>
          <div>
            <b>Roles:</b> {profile.roles?.join(", ")}
          </div>
          <div>
            <b>Telephone:</b> {profile.telephone || "-"}
          </div>
          <div>
            <b>Address:</b> {profile.address || "-"}
          </div>
          <div className="text-sm text-gray-500">
            <b>Created:</b> {profile.createdAt}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Change Password</h2>
        <form onSubmit={submitPasswordChange} className="space-y-3">
          <input
            type="password"
            className="w-full border rounded-lg p-2"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border rounded-lg p-2"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
            disabled={passwordLoading}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
          {passwordMsg && <p className="text-green-600 text-sm">{passwordMsg}</p>}
          {passwordErr && <p className="text-red-600 text-sm">{passwordErr}</p>}
        </form>
      </div>

      <div className="bg-white border rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Register an Additional Role</h2>
        {missingRoles.length === 0 ? (
          <p className="text-sm text-gray-600">You have already registered for all available roles.</p>
        ) : (
          <form onSubmit={submitRoleRegistration} className="space-y-3">
            <select
              className="w-full border rounded-lg p-2"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
            >
              <option value="">Select a role</option>
              {missingRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
              disabled={roleLoading}
            >
              {roleLoading ? "Registering..." : "Register Role"}
            </button>
            {roleMsg && <p className="text-green-600 text-sm">{roleMsg}</p>}
            {roleErr && <p className="text-red-600 text-sm">{roleErr}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
