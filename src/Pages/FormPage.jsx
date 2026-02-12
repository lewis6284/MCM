import React, { useState } from "react";
import FormLayout from "../components/FormLayout";
import FieldCard from "../components/FieldCard";

const FormPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        // Appointment Information
        appointment_location: "",
        country: "",
        city: "",
        country_traveling_to: "",

        // Candidate Information
        first_name: "",
        last_name: "",
        dob: "",
        nationality: "",
        gender: "",
        marital_status: "",

        // Passport & Visa
        passport_number: "",
        confirm_passport: "",
        passport_issue_date: "",
        passport_issue_place: "",
        passport_expiry_date: "",
        visa_type: "",

        // Contact & Other
        email: "",
        phone: "",
        national_id: "",
        position_applied: "",

        // Confirmation
        confirm_info: false,
    });

    const [errors, setErrors] = useState({});

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

    // Define fields for each step
    const stepFields = {
        1: ["appointment_location", "country", "city", "country_traveling_to"],
        2: ["first_name", "last_name", "dob", "nationality", "gender", "marital_status"],
        3: ["passport_number", "confirm_passport", "passport_issue_date", "passport_issue_place",
            "passport_expiry_date", "visa_type", "email", "phone", "national_id", "position_applied", "confirm_info"]
    };

    const validateStep = (step) => {
        let newErrors = {};
        let isValid = true;

        stepFields[step].forEach((field) => {
            const value = formData[field];
            if (field === "confirm_info") {
                if (!value) {
                    newErrors[field] = true;
                    isValid = false;
                }
            } else if (!value || !value.toString().trim()) {
                newErrors[field] = true;
                isValid = false;
            }
        });

        // Check passport confirmation match (only in step 3)
        if (step === 3 && formData.passport_number !== formData.confirm_passport) {
            newErrors.confirm_passport = true;
            isValid = false;
        }

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateStep(currentStep)) {
            alert("Form submitted successfully!");
            console.log("Form Data:", formData);
        } else {
            alert("Please fill in all required fields correctly.");
        }
    };

    return (
        <FormLayout>
            {/* Header Card */}
            <div className="bg-white px-8 pt-8 pb-6 rounded-lg shadow-md border-t-8 border-green-600 mb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                        MCM System
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                        Book a medical examination appointment
                    </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-red-500 text-sm font-semibold flex items-center">

                    </p>
                </div>
            </div>

            {/* Progress Indicator */}
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
                <div className="flex justify-between mt-3">
                    <span className={`text-xs ${currentStep >= 1 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>Appointment</span>
                    <span className={`text-xs ${currentStep >= 2 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>Candidate</span>
                    <span className={`text-xs ${currentStep >= 3 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>Passport & Visa</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                {/* STEP 1: APPOINTMENT INFORMATION */}
                {currentStep === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 bg-white p-4 rounded-lg shadow-sm mb-4">
                            Appointment Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FieldCard
                                label="Appointment Location"
                                name="appointment_location"
                                value={formData.appointment_location}
                                onChange={handleChange}
                                placeholder="Enter location"
                                error={errors.appointment_location}
                            />

                            <FieldCard
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                options={["USA", "Canada", "UK", "France", "Germany", "Other"]}
                                placeholder="Select Country"
                                error={errors.country}
                            />

                            <FieldCard
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                options={["New York", "London", "Paris", "Berlin", "Toronto", "Other"]}
                                placeholder="Select City"
                                error={errors.city}
                            />

                            <FieldCard
                                label="Country Traveling To"
                                name="country_traveling_to"
                                value={formData.country_traveling_to}
                                onChange={handleChange}
                                options={["USA", "Canada", "UK", "France", "Germany", "Australia", "Other"]}
                                placeholder="Select Country Travelling To"
                                error={errors.country_traveling_to}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: CANDIDATE INFORMATION */}
                {currentStep === 2 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 bg-white p-4 rounded-lg shadow-sm mb-4">
                            Candidate information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FieldCard
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="First name"
                                error={errors.first_name}
                            />

                            <FieldCard
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Last name"
                                error={errors.last_name}
                            />

                            <FieldCard
                                label="Date of Birth"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                type="date"
                                placeholder="Select Date"
                                error={errors.dob}
                            />

                            <FieldCard
                                label="Nationality"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                                options={["American", "Canadian", "British", "French", "German", "Other"]}
                                placeholder="Select Nationality"
                                error={errors.nationality}
                            />

                            <FieldCard
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                options={["Male", "Female"]}
                                error={errors.gender}
                            />

                            <FieldCard
                                label="Marital status"
                                name="marital_status"
                                value={formData.marital_status}
                                onChange={handleChange}
                                options={["Single", "Married", "Divorced", "Widowed"]}
                                error={errors.marital_status}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: PASSPORT & VISA */}
                {currentStep === 3 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 bg-white p-4 rounded-lg shadow-sm mb-4">
                            Passport & Visa Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FieldCard
                                label="Passport number №"
                                name="passport_number"
                                value={formData.passport_number}
                                onChange={handleChange}
                                placeholder="Enter Passport No"
                                error={errors.passport_number}
                            />

                            <FieldCard
                                label="Confirm Passport №"
                                name="confirm_passport"
                                value={formData.confirm_passport}
                                onChange={handleChange}
                                placeholder="Confirm Passport No"
                                error={errors.confirm_passport}
                            />

                            <FieldCard
                                label="Passport Issue Date"
                                name="passport_issue_date"
                                value={formData.passport_issue_date}
                                onChange={handleChange}
                                type="date"
                                placeholder="Select Date"
                                error={errors.passport_issue_date}
                            />

                            <FieldCard
                                label="Passport Issue Place"
                                name="passport_issue_place"
                                value={formData.passport_issue_place}
                                onChange={handleChange}
                                placeholder="Enter Issue Place"
                                error={errors.passport_issue_place}
                            />

                            <FieldCard
                                label="Passport Expiry Date"
                                name="passport_expiry_date"
                                value={formData.passport_expiry_date}
                                onChange={handleChange}
                                type="date"
                                placeholder="Select Date"
                                error={errors.passport_expiry_date}
                            />

                            <FieldCard
                                label="Visa Type"
                                name="visa_type"
                                value={formData.visa_type}
                                onChange={handleChange}
                                options={["Work", "Tourist", "Business", "Student"]}
                                placeholder="Select Visa Type"
                                error={errors.visa_type}
                            />

                            <FieldCard
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="your@mail.com"
                                error={errors.email}
                            />

                            <FieldCard
                                label="Phone №"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                type="tel"
                                placeholder="Enter Phone Number"
                                error={errors.phone}
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
                                label="Position applied for"
                                name="position_applied"
                                value={formData.position_applied}
                                onChange={handleChange}
                                placeholder="Enter Position"
                                error={errors.position_applied}
                            />
                        </div>

                        {/* CONFIRMATION CHECKBOX */}
                        <div className="bg-white p-6 rounded-lg shadow-sm mt-4">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    name="confirm_info"
                                    checked={formData.confirm_info}
                                    onChange={handleChange}
                                    className={`mt-1 w-4 h-4 ${errors.confirm_info ? "ring-2 ring-red-500" : ""}`}
                                />
                                <label className="text-gray-800 text-sm">
                                    I confirm that all information provided is correct and accurate. <span className="text-red-500">*</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 rounded-md font-semibold transition-all ${currentStep === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400 active:scale-95'
                            }`}
                    >
                        Previous
                    </button>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({
                                appointment_location: "", country: "", city: "", country_traveling_to: "",
                                first_name: "", last_name: "", dob: "", nationality: "", gender: "", marital_status: "",
                                passport_number: "", confirm_passport: "", passport_issue_date: "", passport_issue_place: "",
                                passport_expiry_date: "", visa_type: "", email: "", phone: "", national_id: "",
                                position_applied: "", confirm_info: false
                            })}
                            className="text-green-700 font-medium hover:underline px-4"
                        >
                            Clear form
                        </button>

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-md shadow-md transition-all active:scale-95"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-md shadow-md transition-all active:scale-95"
                            >
                                Submit Form
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </FormLayout>
    );
};

export default FormPage;
