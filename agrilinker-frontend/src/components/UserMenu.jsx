import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const roles = useMemo(() => {
        const storedRoles = localStorage.getItem("roles");
        return storedRoles ? JSON.parse(storedRoles) : [];
    }, []);
    const isAdmin = roles.includes("ADMIN");

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
                    <button onClick={() => navigate("/profile")}>Profile</button>
                    {isAdmin && (
                        <button onClick={() => navigate("/admin")}>
                            Admin Dashboard
                        </button>
                    )}
                    <button onClick={logout}>Logout</button>
                </div>
            )}
        </div>
    );
}
