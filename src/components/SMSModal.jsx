import React, { useState } from "react";
import { X, SendHorizontal } from "lucide-react";
import FieldCard from "./FieldCard";

const SMSModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const api = (await import("../api")).default;
            await api.post("/messages", formData);

            alert("SMS sent successfully!");
            setFormData({ subject: "", message: "" });
            onClose();
        } catch (error) {
            console.error("Error sending SMS:", error);
            alert("Failed to send SMS. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <SendHorizontal size={20} /> Send SMS Update
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <FieldCard
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Inquiry about candidate..."
                        error={!formData.subject && loading}
                    />

                    <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300">
                        <label className="text-gray-800 font-medium text-base block mb-2">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-4 group">
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Write your message here..."
                                rows="4"
                                className="w-full pb-2 bg-transparent outline-none border-none text-gray-700 placeholder:text-gray-400 resize-none"
                                required
                            />
                            <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gray-300" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-green-500 transition-all duration-300 ease-out origin-center w-0 group-focus-within:w-full" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.subject || !formData.message}
                            className="flex-[2] px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <SendHorizontal size={18} /> Send SMS
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SMSModal;
