import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import FormPage from "./Pages/FormPage";
import LoginPage from "./Pages/LoginPage";
import DashboardPage from "./Pages/DashboardPage";
import RegisterAdminPage from "./Pages/RegisterAdminPage";
import UserManagementPage from "./Pages/UserManagementPage";
import UserCreatePage from "./Pages/UserCreatePage";
import CountryCreatePage from "./Pages/CountryCreatePage";
import CityManagementPage from "./Pages/CityManagementPage";
import AgencyManagementPage from "./Pages/AgencyManagementPage";
import HospitalManagementPage from "./Pages/HospitalManagementPage";
import PositionManagementPage from "./Pages/PositionManagementPage";
import MedicalReportPage from "./Pages/MedicalReportPage";
import HospitalDashboardPage from "./Pages/HospitalDashboardPage";

function AppContent() {
    const { user, isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                {/* Admin & PI Routes */}
                {(user?.role === "ADMIN" || user?.role === "PI") && (
                    <>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/dashboard/register-admin" element={<RegisterAdminPage />} />
                        <Route path="/dashboard/users" element={<UserManagementPage />} />
                        <Route path="/dashboard/create-user" element={<UserCreatePage />} />
                        <Route path="/dashboard/countries" element={<CountryCreatePage />} />
                        <Route path="/dashboard/cities" element={<CityManagementPage />} />
                        <Route path="/dashboard/agencies" element={<AgencyManagementPage />} />
                        <Route path="/dashboard/hospitals" element={<HospitalManagementPage />} />
                        <Route path="/dashboard/positions" element={<PositionManagementPage />} />
                        <Route path="/dashboard/positions" element={<PositionManagementPage />} />
                    </>
                )}

                {/* Common Protected Routes */}
                <Route path="/form" element={<FormPage />} />
                <Route path="/medical-reports" element={<MedicalReportPage />} />
                <Route path="/hospital-dashboard" element={<HospitalDashboardPage />} />
            </Route>

            {/* Default Redirects */}
            <Route path="/" element={
                isAuthenticated
                    ? (() => {
                        if (user?.role === "AGENCY") return <Navigate to="/form" replace />;
                        if (user?.role === "HOSPITAL") return <Navigate to="/medical-reports" replace />;
                        if (user?.role === "PI") return <Navigate to="/dashboard" replace />;
                        return <Navigate to="/dashboard" replace />;
                    })()
                    : <Navigate to="/login" replace />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
