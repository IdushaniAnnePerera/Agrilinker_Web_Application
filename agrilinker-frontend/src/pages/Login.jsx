import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const normalizeRole = (role) =>
  String(role || "")
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/[_\s-]/g, "");

const toRoleList = (rawRoles) => {
  if (Array.isArray(rawRoles)) return rawRoles;
  if (typeof rawRoles === "string") return [rawRoles];
  return [];
};

const hasRole = (roles, targetRole) => {
  const normalizedTarget = normalizeRole(targetRole);
  return toRoleList(roles).some(
    (role) => normalizeRole(role) === normalizedTarget
  );
};

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);

      const token = res?.data?.token;
      const roles = toRoleList(res?.data?.roles);
      const userEmail = res?.data?.email || email;
      const userId = res?.data?.id || res?.data?.userId || null;

      if (!token) throw new Error("Token not found in response");

      localStorage.setItem("token", token);
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("email", userEmail);

      loginUser(
        {
          email: userEmail,
          roles,
          id: userId,
        },
        token
      );

      toast.success("Login successful 🎉");

      if (hasRole(roles, "ADMIN")) {
        navigate("/admin");
      } else if (hasRole(roles, "FARMER")) {
        navigate("/farmer/dashboard");
      } else if (
        hasRole(roles, "FERTILIZER_SUPPLIER") ||
        hasRole(roles, "FERTILIZERSUPPLIER")
      ) {
        navigate("/fertilizer-dashboard");
      } else if (hasRole(roles, "BUYER")) {
        navigate("/marketplace");
      } else {
        toast.error("Access denied");
        navigate("/home");
      }
    } catch (err) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <form className="card" onSubmit={submit}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {password && (
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              tabIndex={0}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          className="btn-light"
          onClick={() => navigate("/auth")}
        >
          Back
        </button>
      </form>
    </div>
  );
}
