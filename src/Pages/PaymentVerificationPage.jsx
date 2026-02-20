import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api";
import { CheckCircle, AlertCircle, Clock, Eye } from "lucide-react";

const PaymentVerificationPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedBordereau, setSelectedBordereau] = useState(null);

    const fetchPendingPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get("/payment/pending");
            setPayments(response.data);
        } catch (error) {
            console.error("Error fetching payments:", error);
            alert("Failed to fetch pending payments");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const handleVerify = async (paymentId) => {
        if (!window.confirm("Are you sure you want to verify this payment? This will confirm the booking and notify the agency.")) return;

        setActionLoading(paymentId);
        try {
            await api.post(`/payment/${paymentId}/verify`);
            alert("Payment verified successfully!");
            fetchPendingPayments();
        } catch (error) {
            console.error("Verification Error:", error);
            alert("Error: " + (error.response?.data?.message || "Failed to verify payment"));
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewBordereau = (path) => {
        if (!path) {
            alert("No bordereau file available");
            return;
        }
        // Construct the full URL for the static file
        const fullUrl = `http://localhost:3000/uploads/${path}`;
        setSelectedBordereau(fullUrl);
    };
    console.log(payments[0])

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-orange-600">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-sans">Payment Verification (PI)</h2>
                    <p className="text-gray-600">Review and approve manual payments (bordereau) for candidate bookings.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 font-sans">
                            <tr>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Candidate</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Agency</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Ref No.</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-sans">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-10 text-center text-gray-400">Loading pending payments...</td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-10 text-center text-gray-400">No pending payments found.</td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-gray-900">
                                                {payment.Booking?.Candidate?.first_name} {payment.Booking?.Candidate?.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500">{payment.Booking?.Candidate?.passport_uid}</div>
                                        </td>
                                        <td className="px-8 py-5 text-gray-600 font-medium">
                                            {payment.Booking?.Candidate?.Agency?.name}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-lg font-bold text-gray-900">${payment.amount}</span>
                                        </td>
                                        <td className="px-8 py-5 text-gray-500 text-sm">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 font-mono text-xs text-gray-400">
                                            {payment.Booking?.reference_number}
                                        </td>
                                        <td className="px-8 py-5 text-right flex justify-end gap-3">
                                            <button
                                                onClick={() => handleViewBordereau(payment.bordereau_path)}
                                                className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                                            >
                                                <Eye size={16} />
                                                View Proof
                                            </button>
                                            <button
                                                onClick={() => handleVerify(payment.id)}
                                                disabled={actionLoading === payment.id}
                                                className={`inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-md active:scale-95 ${actionLoading === payment.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                {actionLoading === payment.id ? (
                                                    <Clock className="animate-spin" size={18} />
                                                ) : (
                                                    <CheckCircle size={18} />
                                                )}
                                                Verify
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Bordereau Preview Modal */}
                {selectedBordereau && (
                    <div
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-zoom-out"
                        onClick={() => setSelectedBordereau(null)}
                    >
                        <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300">
                            <img
                                src={selectedBordereau}
                                alt="Bordereau Proof"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-4 border-white/10"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/20"
                                onClick={() => setSelectedBordereau(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PaymentVerificationPage;
