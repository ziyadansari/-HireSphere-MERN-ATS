
import { createContext, useContext, useState } from "react";
import API from "../api/axios";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(false);

    const saveSession = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
    };

    const login = async (credentials) => {
        setLoading(true);

        try {
            const response = await API.post("/auth/login", credentials);
            saveSession(response.data);
            return response.data;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);

        try {
            const response = await API.post("/auth/register", userData);
            saveSession(response.data);
            return response.data;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
