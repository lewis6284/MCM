import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";
import { Building2, Plus, List, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";

const AgencyManagementPage = () => {
    const [agencies, setAgencies] = useState([]);
    const [activeTab, setActiveTab] = useState("view");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        phone: ""
    });

    const [editingAgency, setEditingAgency] = useState(null);
    const [editData, setEditData] = useState({
        address: "",
        phone: ""
    });

    const fetchAgencies = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get("/agencies");
            setAgencies(response.data);
        } catch (err) {
            console.error("Error fetching agencies:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchAgencies();
    }, []);

    const handleCreateAgency = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await api.post("/agencies", formData);
            if (response.status === 201) {
                setSuccess(true);
                setFormData({ name: "", email: "", password: "", address: "", phone: "" });
                fetchAgencies();
                setTimeout(() => {
                    setSuccess(false);
                    setActiveTab("view");
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create agency");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAgency = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/agencies/${editingAgency.id}`, editData);
            setEditingAgency(null);
            fetchAgencies();
            alert("Agency updated successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAgency = async (id) => {
        if (!window.confirm("Are you sure you want to delete this agency? This action cannot be undone.")) return;
        try {
            await api.delete(`/agencies/${id}`);
            fetchAgencies();
            alert("Agency deleted successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Tab Navigation - ALWAYS AT TOP */}
                <div className="flex gap-4 p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("view")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "view" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        <List size={18} /> View Agencies
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "create" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        <Plus size={18} /> Create Agency
                    </button>
                </div>

                {activeTab === "create" ? (
                    /* Create Agency Section */
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header Box INSIDE tab content */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600 mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Register New Agency</h2>
                            <p className="text-gray-600">Onboard a new recruitment agency and automatically create its owner account.</p>
                        </div>

                        <form onSubmit={handleCreateAgency} className="space-y-6">
                            <FieldCard
                                label="Agency Name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Alsuwedi Agency"
                            />
                            <FieldCard
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="agency@example.com"
                            />
                            <FieldCard
                                label="Login Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                            <FieldCard
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+257 2222 2222"
                            />
                            <FieldCard
                                label="Office Address"
                                name="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Street, Building, City"
                            />

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                                    <b>Wait!</b> {error}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? "Processing..." : "Create Agency & User"}
                                </button>
                            </div>

                            {success && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center font-bold animate-pulse">
                                    Agency Created Successfully!
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    /* View Agencies Section */
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-2 bg-green-600 rounded-full" />
                            <h2 className="text-2xl font-bold text-gray-800">Recruitment Agencies</h2>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Agency Identity</th>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Contact Details</th>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {fetchLoading ? (
                                        <tr><td colSpan="3" className="px-8 py-20 text-center text-gray-400 font-medium">Fetching agencies...</td></tr>
                                    ) : agencies.length === 0 ? (
                                        <tr><td colSpan="3" className="px-8 py-20 text-center text-gray-400 font-medium">No agencies registered yet.</td></tr>
                                    ) : (
                                        agencies.map((agency) => (
                                            <tr key={agency.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                                                            <Building2 size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg">{agency.name}</div>
                                                            <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                                                                <MapPin size={14} /> {agency.address}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                                                            <Mail size={16} className="text-green-500" /> {agency.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                            <Phone size={16} className="text-blue-400" /> {agency.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setEditingAgency(agency);
                                                                setEditData({ address: agency.address, phone: agency.phone });
                                                            }}
                                                            className="p-2.5 text-blue-600 hover:bg-blue-50 bg-gray-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                                            title="Update Details"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAgency(agency.id)}
                                                            className="p-2.5 text-red-600 hover:bg-red-50 bg-gray-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                            title="Remove Agency"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Edit Modal - Maintaining similar modal design */}
                {editingAgency && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-10 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Edit Agency</h3>
                                <p className="text-gray-500 font-medium">Updating details for <span className="text-green-600">{editingAgency.name}</span></p>
                            </div>
                            <form onSubmit={handleUpdateAgency} className="p-10 space-y-8">
                                <FieldCard
                                    label="Update Phone Number"
                                    name="phone"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                                <FieldCard
                                    label="Update Physical Address"
                                    name="address"
                                    value={editData.address}
                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                />
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingAgency(null)}
                                        className="flex-1 px-8 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-200 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AgencyManagementPage;
