import React, { useState } from "react";
import FormLayout from "../components/FormLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        let newErrors = {};
        if (!formData.email) newErrors.email = true;
        if (!formData.password) newErrors.password = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/auth/login", formData);

            if (response.status === 200 || response.status === 201) {
                const { token, user } = response.data;
                login(token, user);
            }
        } catch (error) {
            console.error("Login Error:", error);
            const errorMessage = error.response?.data?.message || "Invalid credentials or server error";
            alert("Login failed: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormLayout>
            <div className="bg-white px-8 pt-8 pb-6 rounded-lg shadow-md border-t-8 border-green-600 mb-6 relative overflow-hidden">
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                        Log in to your MCM account
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <FieldCard
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@gmail.com"
                    error={errors.email}
                />

                <FieldCard
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    error={errors.password}
                />

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg transition-all active:scale-95 flex justify-center items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <div className="mt-6 text-center">
                        <a href="#" className="text-green-700 text-sm font-semibold hover:underline">
                            Forgot password?
                        </a>
                    </div>
                </div>
            </form>
        </FormLayout>
    );
};

export default LoginPage;
