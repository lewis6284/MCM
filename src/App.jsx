import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import FormPage from "./Pages/FormPage";
import LoginPage from "./Pages/LoginPage";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/form" element={<FormPage />} />
                    </Route>

                    {/* Default Redirects */}
                    <Route path="/" element={<Navigate to="/form" replace />} />
                    <Route path="*" element={<Navigate to="/form" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
