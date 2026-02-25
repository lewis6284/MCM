import React, { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SMSModal from "./SMSModal";

const SMSFloatingButton = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Only show for Agencies and Hospitals
    if (user?.role !== "AGENCY" && user?.role !== "HOSPITAL") {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 z-[90] bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group flex items-center gap-2 overflow-hidden max-w-[62px] hover:max-w-[200px] border-2 border-white/20"
            >
                <div className="relative">
                    <MessageSquareText size={28} className="flex-shrink-0 animate-pulse-slow" />
                </div>
                <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2">
                    Send SMS
                </span>
            </button>

            <SMSModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default SMSFloatingButton;
