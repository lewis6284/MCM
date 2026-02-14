import React from "react";
import { LayoutDashboard, Users, FileText, Settings, LogOut, UserPlus, Globe, MapPin, Building2, Hospital, Briefcase, ClipboardPlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const dashboardPath = user?.role === "HOSPITAL" ? "/hospital-dashboard" : "/dashboard";

    const allMenuItems = [
        { name: "Dashboard", path: dashboardPath, icon: LayoutDashboard },
        { name: "Users", path: "/dashboard/users", icon: Users },
        { name: "Create User", path: "/dashboard/create-user", icon: UserPlus },
        { name: "Countries", path: "/dashboard/countries", icon: Globe },
        { name: "Agencies", path: "/dashboard/agencies", icon: Building2 },
        { name: "Hospitals", path: "/dashboard/hospitals", icon: Hospital },
        { name: "Positions", path: "/dashboard/positions", icon: Briefcase },
        { name: "Medical Reports", path: "/medical-reports", icon: ClipboardPlus },
        { name: "Cities", path: "/dashboard/cities", icon: MapPin },
        { name: "Appointments", path: "/form", icon: FileText },
        { name: "Patients", path: "/patients", icon: Users },
        { name: "Register Admin", path: "/dashboard/register-admin", icon: UserPlus },
    ];

    const menuItems = user?.role === "HOSPITAL"
        ? allMenuItems.filter(item => item.name === "Dashboard")
        : allMenuItems;

    return (
        <div className="w-full bg-white h-full flex flex-col border-r border-gray-200 shadow-xl">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                    MCM <span className="text-gray-400 font-light font-sans text-xs uppercase tracking-widest"></span>
                </h2>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname === item.path
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <item.icon size={20} className={location.pathname === item.path ? "text-green-600" : "text-gray-400 group-hover:text-green-500"} />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-1">
                <Link
                    to="/settings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname === "/settings"
                        ? "bg-green-50 text-green-700"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    <Settings size={20} className={location.pathname === "/settings" ? "text-green-600" : "text-gray-400 group-hover:text-green-500"} />
                    <span className="font-medium">Settings</span>
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                    <LogOut size={20} className="text-red-400 group-hover:text-red-500" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
