import React, { useState, useEffect } from "react";
import FormLayout from "../components/FormLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";
import { MoveLeft, CheckCircle, ArrowRight } from "lucide-react";

const MedicalReportPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [formData, setFormData] = useState({
        booking_id: "",
        fit_status: "FIT",
        report_expiry_date: "",
        ghc_code: "",
        gcc_slip_no: "",
        height: "",
        weight: "",
        bmi: "",
        bp: "",
        pulse: "",
        rr_min: "",
        vision_colour: "Normal",
        vision_distant_unaided_left: "6/6",
        vision_distant_unaided_right: "6/6",
        hearing_left: "Normal",
        hearing_right: "Normal",
        blood_group: "",
        blood_haemoglobin: "",
        thick_film_malaria: "Absent",
        biochem_rbs: "",
        biochem_creatinine: "",
        serology_hiv: "Negative",
        serology_hcv: "Negative",
        serology_hbsag: "Negative",
        radiology_chest_xray: "NAD",
        system_respiratory: "NAD",
        pregnancy_test: "NEGATIVE"
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // Auto-calculate BMI
    useEffect(() => {
        if (formData.height && formData.weight) {
            const h = parseFloat(formData.height);
            const w = parseFloat(formData.weight);
            if (h > 0 && w > 0) {
                const calculatedBmi = (w / (h * h)).toFixed(2);
                setFormData(prev => ({ ...prev, bmi: parseFloat(calculatedBmi) }));
            }
        }
    }, [formData.height, formData.weight]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const validateStep = (step) => {
        let newErrors = {};
        let isValid = true;

        if (step === 1) {
            if (!formData.booking_id) { newErrors.booking_id = true; isValid = false; }
            if (!formData.report_expiry_date) { newErrors.report_expiry_date = true; isValid = false; }
            if (!formData.ghc_code) { newErrors.ghc_code = true; isValid = false; }
            if (!formData.gcc_slip_no) { newErrors.gcc_slip_no = true; isValid = false; }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            alert("Please fill in all required fields.");
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const payload = {
                ...formData,
                booking_id: parseInt(formData.booking_id),
                height: parseFloat(formData.height || 0),
                weight: parseFloat(formData.weight || 0),
                bmi: parseFloat(formData.bmi || 0),
                pulse: parseInt(formData.pulse || 0),
                rr_min: parseInt(formData.rr_min || 0),
                // Ensure strings are strings
                blood_haemoglobin: formData.blood_haemoglobin?.toString() || "",
                biochem_rbs: formData.biochem_rbs?.toString() || "",
                biochem_creatinine: formData.biochem_creatinine?.toString() || ""
            };

            await api.post("/medical-reports", payload);
            setSuccess(true);
            alert("Medical Report Submitted Successfully!");
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Error submitting report: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <FormLayout>
                <div className="bg-white p-12 rounded-2xl shadow-xl text-center animate-in zoom-in-95 duration-500">
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Medical Report Filed!</h2>
                    <p className="text-gray-600 text-lg mb-8">The medical examination results have been successfully recorded and the agency has been notified.</p>
                    <button onClick={() => window.location.href = '/dashboard'} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                        Return to Dashboard
                    </button>
                </div>
            </FormLayout>
        );
    }

    return (
        <FormLayout>
            <div className="bg-white px-8 pt-8 pb-6 rounded-lg shadow-md border-t-8 border-green-600 mb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Medical Examination Report</h1>
                    <p className="text-lg text-gray-600 font-medium">Doctor's submission for candidate fitness.</p>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
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
                    <span className={currentStep >= 1 ? "text-green-600 transition-colors duration-300" : ""}>VITALS</span>
                    <span className={currentStep >= 2 ? "text-green-600 transition-colors duration-300" : ""}>VISION/HEARING</span>
                    <span className={currentStep >= 3 ? "text-green-600 transition-colors duration-300" : ""}>LAB</span>
                    <span className={currentStep >= 4 ? "text-green-600 transition-colors duration-300" : ""}>FINAL</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">

                {/* STEP 1: General & Vitals */}
                {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Examination Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FieldCard label="Booking ID" name="booking_id" value={formData.booking_id} onChange={handleChange} placeholder="e.g. 12" error={errors.booking_id} type="number" />
                                <FieldCard label="Expiry Date" name="report_expiry_date" value={formData.report_expiry_date} onChange={handleChange} type="date" error={errors.report_expiry_date} />
                                <FieldCard label="GHC Code" name="ghc_code" value={formData.ghc_code} onChange={handleChange} placeholder="e.g. 25/01/02" error={errors.ghc_code} />
                                <FieldCard label="GCC Slip No" name="gcc_slip_no" value={formData.gcc_slip_no} onChange={handleChange} placeholder="e.g. 113230120267713" error={errors.gcc_slip_no} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Vitals & Anthropometry</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FieldCard label="Height (m)" name="height" value={formData.height} onChange={handleChange} placeholder="1.75" type="number" step="0.01" />
                                <FieldCard label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} placeholder="75.5" type="number" step="0.1" />
                                <FieldCard label="BMI" name="bmi" value={formData.bmi} disabled={true} placeholder="Auto-calculated" />
                                <FieldCard label="Blood Pressure" name="bp" value={formData.bp} onChange={handleChange} placeholder="120/80" />
                                <FieldCard label="Pulse (bpm)" name="pulse" value={formData.pulse} onChange={handleChange} placeholder="72" type="number" />
                                <FieldCard label="RR (min)" name="rr_min" value={formData.rr_min} onChange={handleChange} placeholder="20" type="number" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Vision & Hearing */}
                {currentStep === 2 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Vision & Hearing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldCard label="Color Vision" name="vision_colour" value={formData.vision_colour} onChange={handleChange} options={["Normal", "Abnormal"]} />
                            <div className="hidden md:block"></div>
                            <FieldCard label="Vision Left (Unaided)" name="vision_distant_unaided_left" value={formData.vision_distant_unaided_left} onChange={handleChange} placeholder="6/6" />
                            <FieldCard label="Vision Right (Unaided)" name="vision_distant_unaided_right" value={formData.vision_distant_unaided_right} onChange={handleChange} placeholder="6/6" />
                            <FieldCard label="Hearing Left" name="hearing_left" value={formData.hearing_left} onChange={handleChange} options={["Normal", "Abnormal"]} />
                            <FieldCard label="Hearing Right" name="hearing_right" value={formData.hearing_right} onChange={handleChange} options={["Normal", "Abnormal"]} />
                        </div>
                    </div>
                )}

                {/* STEP 3: Laboratory Results */}
                {currentStep === 3 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Laboratory Results</h2>

                        <h3 className="font-semibold text-gray-700 mb-3">Haematology</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <FieldCard label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
                            <FieldCard label="Haemoglobin (g/dL)" name="blood_haemoglobin" value={formData.blood_haemoglobin} onChange={handleChange} placeholder="14.5" />
                            <FieldCard label="Malaria" name="thick_film_malaria" value={formData.thick_film_malaria} onChange={handleChange} options={["Absent", "Present"]} />
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-3">Biochemistry</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <FieldCard label="RBS (mmol/L)" name="biochem_rbs" value={formData.biochem_rbs} onChange={handleChange} placeholder="4.8" />
                            <FieldCard label="Creatinine (µmol/L)" name="biochem_creatinine" value={formData.biochem_creatinine} onChange={handleChange} placeholder="69.0" />
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-3">Serology</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FieldCard label="HIV" name="serology_hiv" value={formData.serology_hiv} onChange={handleChange} options={["Negative", "Positive"]} />
                            <FieldCard label="HCV" name="serology_hcv" value={formData.serology_hcv} onChange={handleChange} options={["Negative", "Positive"]} />
                            <FieldCard label="HBsAg" name="serology_hbsag" value={formData.serology_hbsag} onChange={handleChange} options={["Negative", "Positive"]} />
                        </div>
                    </div>
                )}

                {/* STEP 4: Radiology & Final Assessment */}
                {currentStep === 4 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Radiology & Final Assessment</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldCard label="Chest X-Ray" name="radiology_chest_xray" value={formData.radiology_chest_xray} onChange={handleChange} placeholder="NAD" />
                            <FieldCard label="Respiratory System" name="system_respiratory" value={formData.system_respiratory} onChange={handleChange} placeholder="NAD" />
                            <FieldCard label="Pregnancy Test" name="pregnancy_test" value={formData.pregnancy_test} onChange={handleChange} options={["NEGATIVE", "POSITIVE", "N/A"]} />

                            <div className="md:col-span-2 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Fitness Status</h3>
                                <FieldCard
                                    label="Candidate Fit Status"
                                    name="fit_status"
                                    value={formData.fit_status}
                                    onChange={handleChange}
                                    options={[
                                        { label: "FIT FOR TRAVEL", value: "FIT" },
                                        { label: "UNFIT", value: "UNFIT" }
                                    ]}
                                    type="radio"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentStep === 1 || loading}
                        className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'}`}
                    >
                        <MoveLeft size={18} /> Previous
                    </button>

                    <div className="flex gap-4">
                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-green-700 hover:bg-green-800 text-white font-bold px-10 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                <CheckCircle size={18} />
                                {loading ? "Submitting..." : "Submit Final Report"}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </FormLayout>
    );
};

export default MedicalReportPage;
