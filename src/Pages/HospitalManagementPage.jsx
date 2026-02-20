import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";
import { Hospital, Plus, List, Edit, Trash2, Mail, MapPin, Users, Search } from "lucide-react";

const HospitalManagementPage = () => {
    const { user } = useAuth();
    const [hospitals, setHospitals] = useState([]);
    const [activeTab, setActiveTab] = useState("view");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [filterCities, setFilterCities] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        country_id: "",
        city_id: ""
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        country_id: "",
        city_id: "",
        max_daily_candidates: ""
    });

    const [editingHospital, setEditingHospital] = useState(null);
    const [editData, setEditData] = useState({
        name: "",
        max_daily_candidates: ""
    });

    const fetchHospitals = async () => {
        setFetchLoading(true);
        try {
            const params = {};
            if (filters.country_id) params.country_id = filters.country_id;
            if (filters.city_id) params.city_id = filters.city_id;

            const response = await api.get("/hospitals", { params });
            setHospitals(response.data);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await api.get("/locations/countries");
            setCountries(response.data);
        } catch (err) {
            console.error("Error fetching countries:", err);
        }
    };

    const fetchCitiesByCountry = async (countryId, isFilter = false) => {
        if (!countryId) {
            if (isFilter) setFilterCities([]);
            else setCities([]);
            return;
        }
        try {
            const response = await api.get(`/locations/countries/${countryId}/cities`);
            if (isFilter) setFilterCities(response.data);
            else setCities(response.data);
        } catch (err) {
            console.error("Error fetching cities:", err);
        }
    };

    useEffect(() => {
        fetchHospitals();
        fetchCountries();
    }, []);

    useEffect(() => {
        fetchHospitals();
    }, [filters]);

    const handleCreateHospital = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await api.post("/hospitals", {
                ...formData,
                country_id: parseInt(formData.country_id),
                city_id: parseInt(formData.city_id),
                max_daily_candidates: parseInt(formData.max_daily_candidates)
            });
            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                setFormData({ name: "", email: "", password: "", country_id: "", city_id: "", max_daily_candidates: "" });
                fetchHospitals();
                setTimeout(() => {
                    setSuccess(false);
                    setActiveTab("view");
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create hospital");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateHospital = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/hospitals/${editingHospital.id}`, {
                name: editData.name,
                max_daily_candidates: parseInt(editData.max_daily_candidates)
            });
            setEditingHospital(null);
            fetchHospitals();
            alert("Hospital updated successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHospital = async (id) => {
        if (!window.confirm("Are you sure you want to remove this hospital?")) return;
        try {
            await api.delete(`/hospitals/${id}`);
            fetchHospitals();
            alert("Hospital removed successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Tab Navigation */}
                <div className="flex gap-4 p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("view")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "view" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        <List size={18} /> View Hospitals
                    </button>
                    {user?.role !== 'PI' && (
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "create" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                        >
                            <Plus size={18} /> Add Hospital
                        </button>
                    )}
                </div>

                {activeTab === "create" ? (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600 mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Register Medical Center</h2>
                            <p className="text-gray-600">Onboard a new medical center performing GCC checkups and create its administrator account.</p>
                        </div>

                        <form onSubmit={handleCreateHospital} className="space-y-6">
                            <FieldCard
                                label="Hospital Name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Kira Hospital"
                            />
                            <FieldCard
                                label="Admin Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@kira-hospital.bi"
                            />
                            <FieldCard
                                label="Login Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FieldCard
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+257 2222 2222"
                                />
                                <FieldCard
                                    label="Physical Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Street, Building, City"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FieldCard
                                    label="Country"
                                    name="country_id"
                                    type="select"
                                    value={formData.country_id}
                                    onChange={(e) => {
                                        setFormData({ ...formData, country_id: e.target.value, city_id: "" });
                                        fetchCitiesByCountry(e.target.value);
                                    }}
                                    options={countries.map(c => ({ label: c.name, value: c.id }))}
                                    placeholder="Select Country"
                                />
                                <FieldCard
                                    label="City"
                                    name="city_id"
                                    type="select"
                                    value={formData.city_id}
                                    onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                                    options={cities.map(c => ({ label: c.name, value: c.id }))}
                                    placeholder="Select City"
                                    disabled={!formData.country_id}
                                />
                            </div>
                            <FieldCard
                                label="Max Daily Candidates"
                                name="max_daily_candidates"
                                type="number"
                                value={formData.max_daily_candidates}
                                onChange={(e) => setFormData({ ...formData, max_daily_candidates: e.target.value })}
                                placeholder="e.g. 50"
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
                                    {loading ? "Processing..." : "Create Hospital & Admin"}
                                </button>
                            </div>

                            {success && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center font-bold animate-pulse">
                                    Hospital Created Successfully!
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Filters */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <FieldCard
                                label="View by Country"
                                name="filter_country"
                                type="select"
                                value={filters.country_id}
                                onChange={(e) => {
                                    setFilters({ ...filters, country_id: e.target.value, city_id: "" });
                                    fetchCitiesByCountry(e.target.value, true);
                                }}
                                options={countries.map(c => ({ label: c.name, value: c.id }))}
                                placeholder="All Countries"
                            />
                            <FieldCard
                                label="View by City"
                                name="filter_city"
                                type="select"
                                value={filters.city_id}
                                onChange={(e) => setFilters({ ...filters, city_id: e.target.value })}
                                options={filterCities.map(c => ({ label: c.name, value: c.id }))}
                                placeholder="All Cities"
                                disabled={!filters.country_id}
                            />
                            <div className="flex items-center gap-3 h-full mb-1 pb-1">
                                <div className="h-8 w-2 bg-green-600 rounded-full" />
                                <h2 className="text-2xl font-bold text-gray-800">Medical Centers</h2>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Hospital Identity</th>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Load Capacity</th>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {fetchLoading ? (
                                        <tr><td colSpan="3" className="px-8 py-20 text-center text-gray-400 font-medium whitespace-nowrap">Fetching hospital list...</td></tr>
                                    ) : hospitals.length === 0 ? (
                                        <tr><td colSpan="3" className="px-8 py-20 text-center text-gray-400 font-medium">No hospitals found matching your filters.</td></tr>
                                    ) : (
                                        hospitals.map((hospital) => (
                                            <tr key={hospital.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                                                            <Hospital size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg">{hospital.name}</div>
                                                            <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                                                                <Mail size={14} /> {hospital.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="bg-gray-50 inline-flex flex-col items-center px-4 py-2 rounded-xl border border-gray-100">
                                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Max Daily</div>
                                                        <div className="text-xl font-black text-green-700">{hospital.max_daily_candidates} <span className="text-[10px] text-gray-400">pax</span></div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    {user?.role !== 'PI' ? (
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingHospital(hospital);
                                                                    setEditData({ name: hospital.name, max_daily_candidates: hospital.max_daily_candidates });
                                                                }}
                                                                className="p-2.5 text-blue-600 hover:bg-blue-50 bg-gray-50 rounded-xl transition-all"
                                                            >
                                                                <Edit size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteHospital(hospital.id)}
                                                                className="p-2.5 text-red-600 hover:bg-red-50 bg-gray-50 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">View Only</span>
                                                    )}
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
                {editingHospital && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-10 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Edit Hospital</h3>
                                <p className="text-gray-500 font-medium">Updating resource allocation for <span className="text-green-600">{editingHospital.name}</span></p>
                            </div>
                            <form onSubmit={handleUpdateHospital} className="p-10 space-y-8">
                                <FieldCard
                                    label="Medical Center Name"
                                    name="edit_name"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                                <FieldCard
                                    label="Update Daily Candidate Quota"
                                    name="edit_max"
                                    type="number"
                                    value={editData.max_daily_candidates}
                                    onChange={(e) => setEditData({ ...editData, max_daily_candidates: e.target.value })}
                                />
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingHospital(null)}
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

export default HospitalManagementPage;
