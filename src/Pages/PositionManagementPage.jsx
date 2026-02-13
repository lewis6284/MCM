import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";
import { Briefcase, Plus, List, Edit, Trash2, Search } from "lucide-react";

const PositionManagementPage = () => {
    const [positions, setPositions] = useState([]);
    const [activeTab, setActiveTab] = useState("view");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: ""
    });

    const [editingPosition, setEditingPosition] = useState(null);
    const [editData, setEditData] = useState({
        name: ""
    });

    const fetchPositions = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get("/locations/positions");
            setPositions(response.data);
        } catch (err) {
            console.error("Error fetching positions:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    const handleCreatePosition = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await api.post("/locations/positions", formData);
            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                setFormData({ name: "" });
                fetchPositions();
                setTimeout(() => {
                    setSuccess(false);
                    setActiveTab("view");
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create position");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePosition = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/locations/positions/${editingPosition.id}`, editData);
            setEditingPosition(null);
            fetchPositions();
            alert("Position updated successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePosition = async (id) => {
        if (!window.confirm("Are you sure you want to remove this position?")) return;
        try {
            await api.delete(`/locations/positions/${id}`);
            fetchPositions();
            alert("Position removed successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    const filteredPositions = positions.filter(pos =>
        pos.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Tab Navigation */}
                <div className="flex gap-4 p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("view")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "view" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        <List size={18} /> View Positions
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "create" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        <Plus size={18} /> Add Position
                    </button>
                </div>

                {activeTab === "create" ? (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600 mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create New Position</h2>
                            <p className="text-gray-600">Define a new job role available for candidate registration.</p>
                        </div>

                        <form onSubmit={handleCreatePosition} className="space-y-6">
                            <FieldCard
                                label="Position Name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Mechanical Engineer"
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
                                    {loading ? "Processing..." : "Register Position"}
                                </button>
                            </div>

                            {success && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center font-bold animate-pulse">
                                    Position Registered Successfully!
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Filters & Header */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-2 bg-green-600 rounded-full" />
                                <h2 className="text-2xl font-bold text-gray-800">Job Positions</h2>
                            </div>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search positions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Position Title</th>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {fetchLoading ? (
                                        <tr><td colSpan="2" className="px-8 py-20 text-center text-gray-400 font-medium whitespace-nowrap">Fetching positions...</td></tr>
                                    ) : filteredPositions.length === 0 ? (
                                        <tr><td colSpan="2" className="px-8 py-20 text-center text-gray-400 font-medium">No positions found.</td></tr>
                                    ) : (
                                        filteredPositions.map((position) => (
                                            <tr key={position.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                                                            <Briefcase size={24} />
                                                        </div>
                                                        <div className="font-bold text-gray-900 text-lg">{position.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setEditingPosition(position);
                                                                setEditData({ name: position.name });
                                                            }}
                                                            className="p-2.5 text-blue-600 hover:bg-blue-50 bg-gray-50 rounded-xl transition-all"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePosition(position.id)}
                                                            className="p-2.5 text-red-600 hover:bg-red-50 bg-gray-50 rounded-xl transition-all"
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

                {/* Edit Modal */}
                {editingPosition && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-10 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Edit Position</h3>
                                <p className="text-gray-500 font-medium">Updating details for <span className="text-green-600">{editingPosition.name}</span></p>
                            </div>
                            <form onSubmit={handleUpdatePosition} className="p-10 space-y-8">
                                <FieldCard
                                    label="Position Title"
                                    name="edit_name"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingPosition(null)}
                                        className="flex-1 px-8 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl transition-all uppercase tracking-widest text-xs"
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

export default PositionManagementPage;
