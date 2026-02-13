import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";
import { defaultLocations } from "../data/defaultLocations";

const CountryCreatePage = () => {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        category: "" // "destination" or "affiliated" or ""
    });
    const [countries, setCountries] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState("create"); // "create" or "view" or "bulk"
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, status: "" });

    const fetchCountries = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get("/locations/countries");
            setCountries(response.data);
        } catch (error) {
            console.error("Error fetching countries:", error);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    const handleBulkImport = async () => {
        if (!window.confirm(`This will attempt to import ${defaultLocations.length} countries and their capitals. Continue?`)) return;

        setImporting(true);
        setImportProgress({ current: 0, total: defaultLocations.length, status: "Starting..." });

        for (let i = 0; i < defaultLocations.length; i++) {
            const loc = defaultLocations[i];
            const countryName = loc.name;
            const cityName = loc.capital;

            setImportProgress({
                current: i + 1,
                total: defaultLocations.length,
                status: `Importing ${countryName}...`
            });

            try {
                // 1. Create/Get Country
                const countryCode = countryName.substring(0, 2).toUpperCase();
                let countryId;

                try {
                    const cRes = await api.post("/locations/countries", {
                        name: countryName,
                        code: countryCode,
                        is_destination: false,
                        is_affiliated: false
                    });
                    countryId = cRes.data.id;
                } catch (cErr) {
                    if (cErr.response?.status === 400 || cErr.response?.status === 409) {
                        // Optimistic fallback: find if already exists
                        const allRes = await api.get("/locations/countries");
                        const existing = allRes.data.find(c => c.name === countryName);
                        if (existing) countryId = existing.id;
                    }
                }

                // 2. Create City
                if (countryId && cityName) {
                    try {
                        await api.post(`/locations/countries/${countryId}/cities`, {
                            name: cityName
                        });
                    } catch (cityErr) {
                        // Ignore if city exists
                    }
                }
            } catch (err) {
                console.error(`Failed to import ${countryName}:`, err);
            }
        }

        setImporting(false);
        setImportProgress(prev => ({ ...prev, status: "Import Completed!" }));
        alert("Bulk import process finished.");
        fetchCountries();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        let newErrors = {};
        if (!formData.name) newErrors.name = true;
        if (!formData.code) newErrors.code = true;
        if (!formData.category) newErrors.category = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setSuccess(false);

        // Map category back to boolean flags for API
        const payload = {
            name: formData.name,
            code: formData.code,
            is_destination: formData.category === "destination",
            is_affiliated: formData.category === "affiliated"
        };

        try {
            const response = await api.post("/locations/countries", payload);

            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                setFormData({
                    name: "",
                    code: "",
                    category: ""
                });
                alert("Country/Location created successfully!");
                fetchCountries(); // Refresh list
            }
        } catch (error) {
            console.error("Country Creation Error:", error);
            const backendError = error.response?.data?.error;
            const backendMessage = error.response?.data?.message;

            // If it's a 400/500 but we have a specific error message
            const errorMessage = backendError || backendMessage || "Failed to create country/location";

            alert("Error: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const destinationCountries = countries.filter(c => c.is_destination);
    const affiliatedCountries = countries.filter(c => c.is_affiliated && !c.is_destination);
    const nationalCountries = countries.filter(c => !c.is_destination && !c.is_affiliated);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Tab Navigation */}
                <div className="flex gap-4 p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${activeTab === "create" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        Create Country
                    </button>
                    <button
                        onClick={() => setActiveTab("view")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${activeTab === "view" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        View Countries
                    </button>
                    <button
                        onClick={() => setActiveTab("bulk")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${activeTab === "bulk" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        Bulk Import
                    </button>
                </div>

                {activeTab === "bulk" ? (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-blue-600 mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Bulk Location Import</h2>
                            <p className="text-gray-600">Automate the registration of {defaultLocations.length} countries and their capital cities.</p>
                        </div>

                        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center space-y-8">
                            {!importing ? (
                                <>
                                    <div className="h-24 w-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-gray-900">Ready to sync global data?</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">This process will register all standard countries and their capitals. Countries already present will be skipped.</p>
                                    </div>
                                    <button
                                        onClick={handleBulkImport}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-2xl transition-all active:scale-95 text-lg cursor-pointer"
                                    >
                                        Start Global Import
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-10">
                                    <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                            style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="text-5xl font-black text-blue-600 tabular-nums">
                                            {Math.round((importProgress.current / importProgress.total) * 100)}%
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 animate-pulse">
                                            {importProgress.status}
                                        </div>
                                        <div className="text-sm text-gray-400 font-medium">
                                            Processing {importProgress.current} of {importProgress.total} locations
                                        </div>
                                    </div>
                                </div>
                            )}

                            {importProgress.status === "Import Completed!" && (
                                <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl font-bold animate-bounce">
                                    ✓ Integration Successful!
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === "create" ? (
                    /* Creation Form */
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600 mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create New Country</h2>
                            <p className="text-gray-600">Register a new country or location in the MCM system.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <FieldCard
                                label="Country Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Bahrain"
                                error={errors.name}
                            />

                            <FieldCard
                                label="Country Code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g. BH"
                                error={errors.code}
                            />

                            <FieldCard
                                label="Location Category"
                                name="category"
                                type="radio"
                                value={formData.category}
                                onChange={handleChange}
                                error={errors.category}
                                options={[
                                    { label: "Destination", value: "destination" },
                                    { label: "Affiliated", value: "affiliated" },
                                ]}
                            />

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? "Creating..." : "Create Country"}
                                </button>
                            </div>

                            {success && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center font-medium animate-pulse">
                                    Success! The new country has been created.
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    /* Country List View */
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Destination Table */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-2 bg-green-600 rounded-full" />
                                <h2 className="text-2xl font-bold text-gray-800">Destination Countries</h2>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {fetchLoading ? (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-10 text-center text-gray-400">Loading destinations...</td>
                                            </tr>
                                        ) : destinationCountries.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-10 text-center text-gray-400">No destination countries found.</td>
                                            </tr>
                                        ) : (
                                            destinationCountries.map((country) => (
                                                <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-8 py-5 font-bold text-gray-900">{country.name}</td>
                                                    <td className="px-8 py-5 font-medium text-gray-600">{country.code}</td>
                                                    <td className="px-8 py-5">
                                                        <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-black rounded-full uppercase tracking-tighter border border-green-200 shadow-sm">
                                                            ★ Active Destination
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Affiliated Table */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-2 bg-blue-600 rounded-full" />
                                <h2 className="text-2xl font-bold text-gray-800">Affiliated Countries</h2>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">Name</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">Code</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 text-right">Label</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {fetchLoading ? (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-10 text-center text-gray-400">Loading affiliated countries...</td>
                                            </tr>
                                        ) : affiliatedCountries.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-10 text-center text-gray-400">No affiliated countries found.</td>
                                            </tr>
                                        ) : (
                                            affiliatedCountries.map((country) => (
                                                <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-8 py-5 font-bold text-gray-900">{country.name}</td>
                                                    <td className="px-8 py-5 font-medium text-gray-600">{country.code || "---"}</td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 uppercase">
                                                            Affiliated
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-400 italic mt-2">Affiliated countries are allowed for recruitment through registered agencies.</p>
                        </div>

                        {/* National/Other Table */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-2 bg-gray-400 rounded-full" />
                                <h2 className="text-2xl font-bold text-gray-800">National / General Countries</h2>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {fetchLoading ? (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-10 text-center text-gray-400">Loading countries...</td>
                                            </tr>
                                        ) : nationalCountries.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-10 text-center text-gray-400 italic">No general countries found.</td>
                                            </tr>
                                        ) : (
                                            nationalCountries.map((country) => (
                                                <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-8 py-5 font-bold text-gray-900">{country.name}</td>
                                                    <td className="px-8 py-5 font-medium text-gray-600">{country.code || "---"}</td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg border border-gray-100 uppercase">
                                                            National
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CountryCreatePage;
