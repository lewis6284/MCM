import React from "react";
import DashboardLayout from "../components/DashboardLayout";

const DashboardPage = () => {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border-l-8 border-green-600">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Welcome back, Admin!
                    </h2>
                    <p className="text-lg text-gray-600">
                        You have 12 pending medical examination appointments today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-gray-500 font-medium mb-4">Total Appointments</h3>
                        <p className="text-4xl font-bold text-gray-900">1,248</p>
                        <div className="mt-4 text-green-600 text-sm font-semibold text-right">
                            +12% this month
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-gray-500 font-medium mb-4">Completed Med Check</h3>
                        <p className="text-4xl font-bold text-gray-900">856</p>
                        <div className="mt-4 text-green-600 text-sm font-semibold text-right">
                            94% success rate
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-gray-500 font-medium mb-4">Pending Results</h3>
                        <p className="text-4xl font-bold text-gray-900">42</p>
                        <div className="mt-4 text-yellow-600 text-sm font-semibold text-right">
                            Priority: High
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        onClick={() => window.location.href = "/dashboard/register-admin"}
                        className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-green-500 cursor-pointer transition-all group"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700">Register New Admin</h3>
                        <p className="text-gray-500">Add a and manage secondary administrators for the MCM system.</p>
                        <div className="mt-4 text-green-600 font-semibold flex items-center gap-2">
                            Go to registration →
                        </div>
                    </div>

                    <div className="bg-white/40 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex items-center justify-center text-gray-400">
                        <p>More modules coming soon...</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
