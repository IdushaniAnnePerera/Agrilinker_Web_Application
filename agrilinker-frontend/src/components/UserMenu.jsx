import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const roles = useMemo(() => {
        const storedRoles = localStorage.getItem("roles");
        if (!storedRoles) return [];
        try {
            const parsed = JSON.parse(storedRoles);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, []);

    const hasRole = (targetRole) =>
        roles.some((role) =>
            String(role).toUpperCase() === targetRole || String(role).toUpperCase() === `ROLE_${targetRole}`,
        );

    const isAdmin = hasRole("ADMIN");
    const isBuyer = hasRole("BUYER");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("roles");
        localStorage.removeItem("email");

        navigate("/login");
    };

    return (
        <div style={{ position: "relative" }}>
            {/* Avatar */}
            <span
                className="text-3xl text-white hover:text-green-300 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                👤
            </span>

            {/* Dropdown */}
            {open && (
                <div className="user-dropdown">
                    {isBuyer && (
                        <button onClick={() => navigate("/support/history")}>Support History</button>
                    )}
                    {isAdmin && (
                        <>
                            <button onClick={() => navigate("/admin")}>Admin Dashboard</button>
                            <button onClick={() => navigate("/admin/settings")}>Admin Settings</button>
                        </>
                    )}
                    <button onClick={logout}>Logout</button>
                </div>
            )}
        </div>
    );
}
