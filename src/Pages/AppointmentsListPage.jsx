import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api";
import { Search, Filter, FileText, Eye, Download, User, Globe, Building2, Calendar } from "lucide-react";

const AppointmentsListPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            // Searching by name/passport is handled client-side for now or we could add backend params
            if (searchTerm) params.passport_number = searchTerm;

            const response = await api.get("/bookings", { params });
            setBookings(response.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBookings();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleDownloadBordereau = async (paymentId) => {
        try {
            const response = await api.get(`/payment/bordereau/${paymentId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bordereau_${paymentId}.pdf`); // Or maintain extension
            // For viewing, we can just open the blob URL
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error downloading bordereau:", error);
            alert("Failed to download bordereau file.");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-sans">Appointments Monitoring</h2>
                        <p className="text-gray-600 font-sans">Global view of all medical examination appointments.</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Passport or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 transition-all font-sans outline-none w-64"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 transition-all font-sans outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95">
                            Search
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 font-sans font-bold text-gray-600 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-8 py-5">Candidate</th>
                                <th className="px-8 py-5">Appointment</th>
                                <th className="px-8 py-5">Hospital</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Payment Proof</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-sans">
                            {loading ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-400">Loading appointments...</td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-400">No appointments found.</td></tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{booking.Candidate?.first_name} {booking.Candidate?.last_name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Globe size={12} /> {booking.Candidate?.passport_uid}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-gray-600">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(booking.appointment_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 font-mono">
                                                {booking.reference_number}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <Building2 size={16} className="text-gray-400" />
                                                {booking.Hospital?.name || "Auto-Assigning..."}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {booking.Payments && booking.Payments.length > 0 && booking.Payments[0].bordereau_path ? (
                                                <button
                                                    onClick={() => handleDownloadBordereau(booking.Payments[0].id)}
                                                    className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                                >
                                                    <FileText size={14} />
                                                    View Bordereau
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No Proof Uploaded</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold flex justify-end gap-2">
                                            <button
                                                onClick={() => window.open(`${api.defaults.baseURL}/bookings/${booking.id}/slip`, '_blank')}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View/Download Slip"
                                            >
                                                <Download size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AppointmentsListPage;
