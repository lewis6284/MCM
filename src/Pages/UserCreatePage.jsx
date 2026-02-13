import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";

const UserCreatePage = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "AGENCY"
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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
        if (!formData.username) newErrors.username = true;
        if (!formData.email) newErrors.email = true;
        if (!formData.password) newErrors.password = true;
        if (!formData.role) newErrors.role = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setSuccess(false);
        try {
            const response = await api.post("/auth/register", formData);

            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    role: "AGENCY"
                });
                alert("User account created successfully!");
            }
        } catch (error) {
            console.error("Registration Error:", error);
            const errorMessage = error.response?.data?.message || "Failed to create user account";
            alert("Error: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600 mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create New User</h2>
                    <p className="text-gray-600">Register a new Admin, Agency, or Hospital user in the MCM system.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldCard
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="john_doe"
                        error={errors.username}
                    />

                    <FieldCard
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="user@example.com"
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

                    <FieldCard
                        label="User Role"
                        name="role"
                        type="select"
                        value={formData.role}
                        onChange={handleChange}
                        error={errors.role}
                        options={[
                            { label: "Agency", value: "AGENCY" },
                            { label: "Hospital", value: "HOSPITAL" },
                        ]}
                    />

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Creating Account..." : "Create User Account"}
                        </button>
                    </div>

                    {success && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center font-medium animate-pulse">
                            Success! The new user account has been created.
                        </div>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
};

export default UserCreatePage;
