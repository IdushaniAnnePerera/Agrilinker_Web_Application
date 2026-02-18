import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081/api/auth",
});

export const login = (email, password) =>
    api.post("/login", { email, password });

export const register = (data) =>
    api.post("/register", data);

export const changePassword = (data, token) =>
    api.post("/change-password", data, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const addRole = (role, token) =>
    api.post(
        "/add-role",
        { role },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
