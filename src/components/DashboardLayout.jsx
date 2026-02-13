import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BackgroundWatermark from "./BackgroundWatermark";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Watermark restricted to background */}
            <div className="fixed inset-0 z-0">
                <BackgroundWatermark />
            </div>

            {/* Fixed Sidebar Wrapper */}
            <div className="hidden md:block w-64 fixed inset-y-0 left-0 z-30">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col relative z-10 md:ml-64">
                <Navbar />

                <main className="flex-1 p-10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
