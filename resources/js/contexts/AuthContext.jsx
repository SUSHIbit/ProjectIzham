import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get("/api/user");
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post("/api/login", {
                email,
                password,
            });
            localStorage.setItem("token", response.data.token);
            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${response.data.token}`;
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            throw error;
        }
    };

    const register = async (name, email, password, password_confirmation) => {
        try {
            const response = await axios.post("/api/register", {
                name,
                email,
                password,
                password_confirmation,
            });
            localStorage.setItem("token", response.data.token);
            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${response.data.token}`;
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post("/api/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
