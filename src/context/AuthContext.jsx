import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("mcm_token"));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const storedUser = localStorage.getItem("mcm_user");
            let userObj = null;

            // 1. Try to get from localStorage
            if (storedUser && storedUser !== "undefined") {
                try {
                    userObj = JSON.parse(storedUser);
                } catch (error) {
                    console.error("Failed to parse user data:", error);
                    localStorage.removeItem("mcm_user");
                }
            }

            // 2. If no user in localStorage (or invalid), decode token
            if (!userObj) {
                try {
                    const decoded = jwtDecode(token);
                    // Map decoded token fields to user object structure
                    // Adjust fields based on what your backend actually puts in the token
                    userObj = {
                        id: decoded.id || decoded.userId,
                        email: decoded.email,
                        role: decoded.role || decoded.userRole,
                        authenticated: true
                    };
                    // Save recovered user to localStorage
                    localStorage.setItem("mcm_user", JSON.stringify(userObj));
                } catch (err) {
                    console.error("Failed to decode token:", err);
                    // Token invalid? Logout
                    localStorage.removeItem("mcm_token");
                    setToken(null);
                }
            }

            setUser(userObj || { authenticated: true });
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem("mcm_token", newToken);
        localStorage.setItem("mcm_user", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData || { authenticated: true });

        if (userData?.role === "AGENCY") {
            navigate("/form");
        } else if (userData?.role === "HOSPITAL") {
            navigate("/medical-reports");
        } else {
            navigate("/dashboard");
        }
    };

    const logout = () => {
        localStorage.removeItem("mcm_token");
        localStorage.removeItem("mcm_user");
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
