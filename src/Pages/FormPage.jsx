import React, { useState, useEffect } from "react";
import FormLayout from "../components/FormLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";

const FormPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        passport_uid: "",
        national_id: "",
        date_of_birth: "",
        gender: "MALE",
        marital_status: "SINGLE",
        nationality_id: "",
        travelling_to_id: "",
        visa_type: "Work",
        position_id: "",
        medical_center_country_id: "",
        medical_center_city_id: "",
        email: "",
        phone: "",
        amount: 10.00
    });

    const [options, setOptions] = useState({
        countries: [],
        cities: [],
        positions: []
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [countriesRes, positionsRes] = await Promise.all([
                    api.get("/locations/countries"),
                    api.get("/locations/positions")
                ]);
                setOptions(prev => ({
                    ...prev,
                    countries: countriesRes.data,
                    positions: positionsRes.data
                }));
            } catch (err) {
                console.error("Error fetching initial form data:", err);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.medical_center_country_id) {
                setOptions(prev => ({ ...prev, cities: [] }));
                return;
            }
            try {
                const response = await api.get(`/locations/countries/${formData.medical_center_country_id}/cities`);
                setOptions(prev => ({ ...prev, cities: response.data }));
            } catch (err) {
                console.error("Error fetching cities:", err);
            }
        };
        fetchCities();
    }, [formData.medical_center_country_id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };

    const stepFields = {
        1: ["medical_center_country_id", "medical_center_city_id", "travelling_to_id"],
        2: ["first_name", "last_name", "date_of_birth", "gender", "marital_status", "nationality_id"],
        3: ["passport_uid", "national_id", "visa_type", "position_id", "email", "phone"]
    };

    const validateStep = (step) => {
        let newErrors = {};
        let isValid = true;

        stepFields[step].forEach((field) => {
            if (!formData[field] || !formData[field].toString().trim()) {
                newErrors[field] = true;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            alert("Please fill in all required fields correctly.");
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) {
            alert("Please fill in all required fields correctly.");
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const response = await api.post("/candidates/register", {
                ...formData,
                nationality_id: parseInt(formData.nationality_id),
                travelling_to_id: parseInt(formData.travelling_to_id),
                position_id: parseInt(formData.position_id),
                medical_center_country_id: parseInt(formData.medical_center_country_id),
                medical_center_city_id: parseInt(formData.medical_center_city_id),
                amount: parseFloat(formData.amount)
            });

            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                alert("Candidate registered successfully! Payment receipt and booking generated.");
                // Redirect or reset could happen here
            }
        } catch (err) {
            console.error("Registration Error:", err);
            alert("Error: " + (err.response?.data?.message || "Registration failed"));
        } finally {
            setLoading(false);
        }
    };

    const countryOptions = options.countries.map(c => ({ label: c.name, value: c.id.toString() }));
    const cityOptions = options.cities.map(c => ({ label: c.name, value: c.id.toString() }));
    const positionOptions = options.positions.map(p => ({ label: p.name, value: p.id.toString() }));

    // Gulf Countries Filter (Frontend Only)
    const gulfCountries = ["Bahrain", "Kuwait", "Oman", "Qatar", "Saudi Arabia", "United Arab Emirates"];
    const gulfOptions = countryOptions.filter(c => gulfCountries.includes(c.label));

    return (
        <FormLayout>
            <div className="bg-white px-8 pt-8 pb-6 rounded-lg shadow-md border-t-8 border-green-600 mb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">MCM System</h1>
                    <p className="text-lg text-gray-600 font-medium">Book a medical examination appointment</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
                    <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-3 text-xs font-semibold text-gray-400">
                    <span className={currentStep >= 1 ? "text-green-600" : ""}>LOCATION</span>
                    <span className={currentStep >= 2 ? "text-green-600" : ""}>CANDIDATE</span>
                    <span className={currentStep >= 3 ? "text-green-600" : ""}>DOCUMENTS</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20 mt-6">
                {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-gray-800 bg-white p-4 rounded-lg shadow-sm mb-4">Location & Destination</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldCard
                                label="Medical Center Country"
                                name="medical_center_country_id"
                                value={formData.medical_center_country_id}
                                onChange={handleChange}
                                options={countryOptions}
                                placeholder="Select Country"
                                error={errors.medical_center_country_id}
                            />
                            <FieldCard
                                label="Medical Center City"
                                name="medical_center_city_id"
                                value={formData.medical_center_city_id}
                                onChange={handleChange}
                                options={cityOptions}
                                placeholder="Select City"
                                error={errors.medical_center_city_id}
                                disabled={!formData.medical_center_country_id}
                            />
                            <FieldCard
                                label="Travelling To"
                                name="travelling_to_id"
                                type="select"
                                value={formData.travelling_to_id}
                                onChange={handleChange}
                                options={[{ label: "Select Destination", value: "" }, ...gulfOptions]}
                                error={errors.travelling_to_id}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2 ... */}
                {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-gray-800 bg-white p-4 rounded-lg shadow-sm mb-4">Candidate Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldCard
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Enter first name"
                                error={errors.first_name}
                            />
                            <FieldCard
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Enter last name"
                                error={errors.last_name}
                            />
                            <FieldCard
                                label="Date of Birth"
                                name="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                error={errors.date_of_birth}
                            />
                            <FieldCard
                                label="Nationality"
                                name="nationality_id"
                                value={formData.nationality_id}
                                onChange={handleChange}
                                options={countryOptions}
                                placeholder="Select Nationality"
                                error={errors.nationality_id}
                            />
                            <FieldCard
                                label="Gender"
                                name="gender"
                                type="radio"
                                value={formData.gender}
                                onChange={handleChange}
                                options={[
                                    { label: "Male", value: "MALE" },
                                    { label: "Female", value: "FEMALE" }
                                ]}
                            />
                            <FieldCard
                                label="Marital Status"
                                name="marital_status"
                                type="radio"
                                value={formData.marital_status}
                                onChange={handleChange}
                                options={[
                                    { label: "Single", value: "SINGLE" },
                                    { label: "Married", value: "MARRIED" },
                                    { label: "Divorced", value: "DIVORCED" }
                                ]}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-gray-800 bg-white p-4 rounded-lg shadow-sm mb-4">Passport & Identification</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldCard
                                label="Passport UID"
                                name="passport_uid"
                                value={formData.passport_uid}
                                onChange={handleChange}
                                placeholder="Enter Passport UID"
                                error={errors.passport_uid}
                            />
                            <FieldCard
                                label="National ID"
                                name="national_id"
                                value={formData.national_id}
                                onChange={handleChange}
                                placeholder="Enter National ID"
                                error={errors.national_id}
                            />
                            <FieldCard
                                label="Visa Type"
                                name="visa_type"
                                value={formData.visa_type}
                                onChange={handleChange}
                                options={[
                                    { label: "Work", value: "Work" },
                                    { label: "Tourist", value: "Tourist" },
                                    { label: "Business", value: "Business" }
                                ]}
                                placeholder="Select Visa Type"
                            />
                            <FieldCard
                                label="Position Applied For"
                                name="position_id"
                                value={formData.position_id}
                                onChange={handleChange}
                                options={positionOptions}
                                placeholder="Select Position"
                                error={errors.position_id}
                            />
                            <FieldCard
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="candidate@example.com"
                                error={errors.email}
                            />
                            <FieldCard
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+257..."
                                error={errors.phone}
                            />
                            <div className="md:col-span-2">
                                <FieldCard
                                    label="Total Amount (USD)"
                                    name="amount"
                                    value={`$${formData.amount}`}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentStep === 1 || loading}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'}`}
                    >
                        Previous
                    </button>

                    <div className="flex gap-4">
                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-3 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${loading ? "opacity-70" : ""}`}
                            >
                                {loading ? "Processing..." : "Complete Enrollment"}
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center font-bold animate-in zoom-in-95 duration-300">
                    <p className="text-2xl mb-2">Registration Complete!</p>
                    <p className="text-green-600">Your professional business flow has been initiated successfully.</p>
                </div>
            )}
        </FormLayout>
    );
};

export default FormPage;
