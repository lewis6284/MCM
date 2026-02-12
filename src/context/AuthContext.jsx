import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("mcm_token"));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            // In a real app, you might decode the token or fetch user info here
            setUser({ authenticated: true });
        }
        setLoading(false);
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem("mcm_token", newToken);
        setToken(newToken);
        setUser(userData || { authenticated: true });
        navigate("/form");
    };

    const logout = () => {
        localStorage.removeItem("mcm_token");
        setToken(null);
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
