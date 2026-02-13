import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";
import { MapPin, Search, Globe, List } from "lucide-react";

const CityManagementPage = () => {
    const [countries, setCountries] = useState([]);
    const [selectedCountryId, setSelectedCountryId] = useState("");
    const [cities, setCities] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [cityName, setCityName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // UI States
    const [activeTab, setActiveTab] = useState("view"); // Default to view
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [globalFetchLoading, setGlobalFetchLoading] = useState(false);
    const [countriesLoading, setCountriesLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Fetch countries for selection
    useEffect(() => {
        const fetchCountries = async () => {
            setCountriesLoading(true);
            try {
                const response = await api.get("/locations/countries");
                setCountries(response.data);
            } catch (err) {
                console.error("Error fetching countries:", err);
            } finally {
                setCountriesLoading(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch cities per country
    useEffect(() => {
        if (selectedCountryId && activeTab === "view") {
            fetchCities();
        }
    }, [selectedCountryId, activeTab]);

    // Fetch all cities if tab is all
    useEffect(() => {
        if (activeTab === "all") {
            fetchAllCities();
        }
    }, [activeTab]);

    const fetchCities = async () => {
        if (!selectedCountryId) return;
        setFetchLoading(true);
        try {
            const response = await api.get(`/locations/countries/${selectedCountryId}/cities`);
            setCities(response.data);
        } catch (err) {
            console.error("Error fetching cities:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchAllCities = async () => {
        setGlobalFetchLoading(true);
        try {
            const response = await api.get("/locations/cities");
            setAllCities(response.data);
        } catch (err) {
            console.error("Error fetching all cities:", err);
        } finally {
            setGlobalFetchLoading(false);
        }
    };

    const handleCountryChange = (e) => {
        setSelectedCountryId(e.target.value);
        setSuccess(false);
        setError("");
    };

    const handleCreateCity = async (e) => {
        e.preventDefault();
        if (!selectedCountryId) {
            setError("Please select a country first");
            return;
        }
        if (!cityName.trim()) {
            setError("City name is required");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await api.post(`/locations/countries/${selectedCountryId}/cities`, {
                name: cityName
            });

            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                setCityName("");
                alert(`City "${cityName}" created successfully!`);
                if (activeTab === "view") fetchCities();
            }
        } catch (error) {
            console.error("City Creation Error:", error);
            const msg = error.response?.data?.message || "Failed to create city";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const filteredGlobalCities = allCities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">City Management</h2>
                    <p className="text-gray-600">Manage cities globally or specifically by country.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-4 p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "all" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        <Globe size={18} /> Global List
                    </button>
                    <button
                        onClick={() => setActiveTab("view")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "view" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        <MapPin size={18} /> Per Country
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "create" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                        <List size={18} /> Create City
                    </button>
                </div>

                {activeTab === "all" ? (
                    /* Global List View */
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-2 bg-green-600 rounded-full" />
                                <h3 className="text-2xl font-bold text-gray-800">Global City Directory</h3>
                            </div>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by city or country..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 max-h-[700px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr className="border-b border-gray-100">
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">City Name</th>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">Country</th>
                                        <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {globalFetchLoading ? (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-20 text-center text-gray-400 font-medium">Loading all cities...</td>
                                        </tr>
                                    ) : filteredGlobalCities.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-20 text-center text-gray-300">No cities found matching your search.</td>
                                        </tr>
                                    ) : (
                                        filteredGlobalCities.map((city) => (
                                            <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-8 py-5 font-bold text-gray-900 italic text-lg">{city.name}</td>
                                                <td className="px-8 py-5 text-gray-600 font-medium">
                                                    {city.country?.name || "Unknown Country"}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-md uppercase font-black tracking-widest border border-green-100">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === "view" ? (
                    /* Per Country List */
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-2 bg-blue-600 rounded-full" />
                                <h3 className="text-xl font-bold text-gray-800">Filter Cities by Country</h3>
                            </div>
                            <div className="w-full md:w-80">
                                <FieldCard
                                    label="Select Country"
                                    name="country"
                                    type="select"
                                    value={selectedCountryId}
                                    onChange={handleCountryChange}
                                    placeholder="Choose a country..."
                                    options={countries.map(c => ({ label: c.name, value: c.id }))}
                                />
                            </div>
                        </div>

                        {!selectedCountryId ? (
                            <div className="bg-gray-50 border border-dashed border-gray-200 p-20 rounded-2xl text-center">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Please select a country to visualize its specific cities.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
                                    <h4 className="font-bold text-blue-900">
                                        Showing {cities.length} cities for {countries.find(c => c.id == selectedCountryId)?.name}
                                    </h4>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">City Name</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Label</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {fetchLoading ? (
                                            <tr><td colSpan="2" className="px-8 py-10 text-center text-gray-400">Loading cities...</td></tr>
                                        ) : cities.length === 0 ? (
                                            <tr>
                                                <td colSpan="2" className="px-8 py-20 text-center text-gray-300">
                                                    No cities registered for this country yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            cities.map((city) => (
                                                <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-8 py-5 font-bold text-gray-900 italic text-lg">{city.name}</td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase font-black">
                                                            Registered
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Create City */
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleCreateCity} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <List className="text-green-600 w-6 h-6" />
                                <h3 className="text-xl font-bold text-gray-800">Add New City</h3>
                            </div>

                            <div className="space-y-6">
                                <FieldCard
                                    label="Select Country"
                                    name="country"
                                    type="select"
                                    value={selectedCountryId}
                                    onChange={handleCountryChange}
                                    placeholder="Which country owns this city?"
                                    options={countries.map(c => ({ label: c.name, value: c.id }))}
                                    error={error && !selectedCountryId}
                                />

                                <FieldCard
                                    label="City Name"
                                    name="cityName"
                                    value={cityName}
                                    onChange={(e) => {
                                        setCityName(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="e.g. Manama"
                                    error={error && !cityName}
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    <b>Wait!</b> {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? "Registering..." : "Assign City to Country"}
                                </button>
                            </div>

                            {success && (
                                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center font-medium">
                                    City successfully registered!
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CityManagementPage;
