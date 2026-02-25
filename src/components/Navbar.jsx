import React, { useState } from "react";
import { Moon, Sun, User, LogOut, Bell, MessageSquareText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const Navbar = () => {
    const { logout, user } = useAuth();
    const { toggleChat } = useChat();
    const [isDark, setIsDark] = useState(false);
    const isAdminOrPI = user?.role === "ADMIN" || user?.role === "PI";

    const toggleDarkMode = () => {
        setIsDark(!isDark);
        // Dark mode logic can be added here (e.g., adding .dark class to body)
        document.documentElement.classList.toggle("dark");
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
                    Overview
                </h1>
            </div>

            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors relative">
                    <Bell size={22} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Chat Toggle (Admin/PI Only) */}
                {isAdminOrPI && (
                    <button
                        onClick={toggleChat}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors relative"
                    >
                        <MessageSquareText size={22} />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2.5 bg-gray-50 text-gray-600 hover:text-green-600 rounded-full transition-all active:scale-90"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="h-8 w-[1px] bg-gray-200" />

                {/* Profile & Logout Group */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-bold text-gray-800">Admin Account</span>
                        <span className="text-xs text-gray-500">Administrator</span>
                    </div>
                    <button className="p-1 border-2 border-green-500 rounded-full">
                        <User size={28} className="text-green-600" />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
