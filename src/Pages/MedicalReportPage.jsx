import React, { useState, useEffect } from "react";
import FormLayout from "../components/FormLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";
import { MoveLeft, CheckCircle, ArrowRight, Search } from "lucide-react";

const MedicalReportPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [formData, setFormData] = useState({
        booking_id: "",
        candidate_photo: null,
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
        // Vision & Hearing
        vision_colour: "Normal",
        vision_distant_unaided_left: "",
        vision_distant_unaided_right: "",
        vision_distant_aided_left: "",
        vision_distant_aided_right: "",
        vision_near_unaided_left: "",
        vision_near_unaided_right: "",
        vision_near_aided_left: "",
        vision_near_aided_right: "",
        hearing_left: "Normal",
        hearing_right: "Normal",
        // Systemic Examination
        system_appearance: "NAD",
        system_cardiovascular: "NAD",
        system_respiratory: "NAD",
        system_ent: "NAD",
        gi_abdomen: "NAD",
        gi_hernia: "NAD",
        gu_genitourinary: "NAD",
        gu_hydrocele: "NAD",
        ms_extremities: "NAD",
        ms_back: "NAD",
        ms_skin: "NAD",
        ms_cns: "NAD",
        ms_deformities: "NAD",
        // Mental Status
        mental_appearance: "NAD",
        mental_behavior: "NAD",
        mental_speech: "NAD",
        mental_cognition: "NAD",
        mental_memory: "NAD",
        mental_mood: "NAD",
        mental_orientation: "NAD",
        mental_concentration: "NAD",
        mental_thoughts: "NAD",
        // Laboratory
        blood_group: "",
        blood_haemoglobin: "",
        thick_film_malaria: "Absent",
        thick_film_microfilaria: "Absent",
        biochem_rbs: "",
        biochem_creatinine: "",
        biochem_lft: "Normal",
        serology_hiv: "Negative",
        serology_hcv: "Negative",
        serology_hbsag: "Negative",
        serology_vdrl: "Negative",
        serology_tpha: "Negative",
        serology_pregnancy: "Negative",
        urine_sugar: "Negative",
        urine_albumin: "Negative",
        stool_helminthes: "Absent",
        stool_ova: "Absent",
        stool_cyst: "Absent",
        stool_others: "",
        // Radiology
        radiology_chest_xray: "NAD",
        radiology_comment: "",
        // Vaccinations
        vac_polio: false,
        vac_polio_date: "",
        vac_mmr1: false,
        vac_mmr1_date: "",
        vac_mmr2: false,
        vac_mmr2_date: "",
        vac_meningococcal: false,
        vac_meningococcal_date: "",
        vac_covid19: false,
        vac_covid19_date: "",
        // Meta
        remarks: ""
    });

    const [reportId, setReportId] = useState(() => localStorage.getItem("temp_medical_report_id"));
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [finalSuccess, setFinalSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchPassport, setSearchPassport] = useState("");
    const [searching, setSearching] = useState(false);

    // Persist reportId
    useEffect(() => {
        if (reportId) {
            localStorage.setItem("temp_medical_report_id", reportId);
        } else {
            localStorage.removeItem("temp_medical_report_id");
        }
    }, [reportId]);

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

    // Check query params for passport (from Dashboard)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const passport = params.get("passport");
        if (passport) {
            setSearchPassport(passport);
            // Trigger search automatically if available? 
            // We can't call handlePassportSearch here easily because it updates state that might cause loops or issues if not careful.
            // But we can just set the search term for the user to click 'Find' or we can extract the logic.
            // Let's just set it for now. User clicks Find.
            // Or better, trigger it via a timeout or flag?
            // Actually, let's just leave it populated.
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "file" ? files[0] : (type === "number" ? parseFloat(value) : value)
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const handlePassportSearch = async () => {
        if (!searchPassport) {
            alert("Please enter a passport number");
            return;
        }

        setSearching(true);
        try {
            const response = await api.get(`/bookings?passport_number=${searchPassport}`);
            const bookings = response.data;

            if (bookings && bookings.length > 0) {
                // Assuming we take the most recent booking or the first one found
                // Ideally, there might be logic to select the correct active booking
                const booking = bookings[0]; // Simplification

                setFormData(prev => ({
                    ...prev,
                    booking_id: booking.id,
                    // Auto-fill other details if available from candidate/booking
                    // candidate_photo might be tricky if it's a file object vs URL string
                    // For now, let's just set the ID which is the critical missing piece
                }));
                alert(`Found Booking ID: ${booking.id} for ${booking.Candidate.first_name} ${booking.Candidate.last_name}`);
            } else {
                alert("No booking found for this passport number.");
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Error searching for booking: " + (error.response?.data?.message || error.message));
        } finally {
            setSearching(false);
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

    const saveProgress = async (step) => {
        try {
            console.log(`--- Saving Progress (Step ${step}) ---`);
            let response;
            const payload = new FormData();

            if (step === 1 && !reportId) {
                // Initial creation
                console.log("POST: Creating initial report...");
                Object.keys(formData).forEach(key => {
                    if (key === 'candidate_photo' && formData[key]) {
                        payload.append('candidate_photo', formData[key]);
                    } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
                        payload.append(key, formData[key]);
                    }
                });

                response = await api.post("/medical-reports", payload, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                if (response.data?.report?.id) {
                    setReportId(response.data.report.id);
                    console.log("SUCCESS: Created ID", response.data.report.id);
                }
            } else if (reportId) {
                // Progressive updates - Always use FormData for PATCH to match backend multer
                console.log(`PATCH: Updating report ${reportId}...`);

                let fields = [];
                if (step === 1) {
                    fields = ['booking_id', 'report_expiry_date', 'ghc_code', 'gcc_slip_no', 'height', 'weight', 'bmi', 'bp', 'pulse', 'rr_min'];
                    if (formData.candidate_photo instanceof File) {
                        payload.append('candidate_photo', formData.candidate_photo);
                    }
                } else if (step === 2) {
                    // Systemic & Mental Status
                    fields = [
                        'system_appearance', 'system_cardiovascular', 'system_respiratory', 'system_ent',
                        'gi_abdomen', 'gi_hernia', 'gu_genitourinary', 'gu_hydrocele',
                        'ms_extremities', 'ms_back', 'ms_skin', 'ms_cns', 'ms_deformities',
                        'mental_appearance', 'mental_behavior', 'mental_speech', 'mental_cognition',
                        'mental_memory', 'mental_mood', 'mental_orientation', 'mental_concentration', 'mental_thoughts'
                    ];
                } else if (step === 3) {
                    // Vision & Hearing
                    fields = [
                        'vision_colour', 'vision_distant_unaided_left', 'vision_distant_unaided_right',
                        'vision_distant_aided_left', 'vision_distant_aided_right',
                        'vision_near_unaided_left', 'vision_near_unaided_right',
                        'vision_near_aided_left', 'vision_near_aided_right',
                        'hearing_left', 'hearing_right'
                    ];
                } else if (step === 4) {
                    // Laboratory Results
                    fields = [
                        'blood_group', 'blood_haemoglobin', 'thick_film_malaria', 'thick_film_microfilaria',
                        'biochem_rbs', 'biochem_creatinine', 'biochem_lft',
                        'serology_hiv', 'serology_hcv', 'serology_hbsag', 'serology_vdrl', 'serology_tpha', 'serology_pregnancy',
                        'urine_sugar', 'urine_albumin',
                        'stool_helminthes', 'stool_ova', 'stool_cyst', 'stool_others'
                    ];
                } else if (step === 5) {
                    // Radiology, Vaccines & Final
                    fields = [
                        'radiology_chest_xray', 'radiology_comment',
                        'vac_polio', 'vac_polio_date', 'vac_mmr1', 'vac_mmr1_date',
                        'vac_mmr2', 'vac_mmr2_date', 'vac_meningococcal', 'vac_meningococcal_date',
                        'vac_covid19', 'vac_covid19_date',
                        'fit_status', 'remarks'
                    ];
                }

                fields.forEach(k => {
                    if (formData[k] !== null && formData[k] !== undefined && formData[k] !== "") {
                        payload.append(k, formData[k]);
                    }
                });

                response = await api.patch(`/medical-reports/${reportId}`, payload, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                console.log(`SUCCESS: Step ${step} Patched with ${fields.length} fields`);
            }
            return response;
        } catch (error) {
            console.error(`Save Error (Step ${step}):`, error);
            throw error;
        }
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await saveProgress(currentStep);
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            alert("Error saving progress: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reportId) {
            alert("Report ID not found. Initial step must be completed first.");
            return;
        }

        setLoading(true);
        try {
            await saveProgress(5);
            localStorage.removeItem("temp_medical_report_id"); // Clear after successful finalize
            setSuccess(true);
            alert("Medical Report Finalized Successfully!");
        } catch (error) {
            alert("Error finalizing report: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePrintPDF = async () => {
        if (!reportId) {
            alert("No report ID found. Please complete the first step.");
            return;
        }
        try {
            console.log(`Printing PDF for Report ID: ${reportId}`);
            // fetch PDF as blob to include auth headers
            const pdfRes = await api.get(`/medical-reports/${reportId}/pdf`, {
                responseType: 'blob'
            });

            // create blob link
            const url = window.URL.createObjectURL(new Blob([pdfRes.data], { type: 'application/pdf' }));

            // Open in new window for printing
            window.open(url, '_blank');
        } catch (error) {
            alert("Error generating PDF for print: " + error.message);
        }
    };

    const handleUploadSigned = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const res = await api.get(`/medical-reports/booking/${formData.booking_id}`);
            const reportId = res.data.id;

            const payload = new FormData();
            payload.append('signed_report', file);

            await api.post(`/medical-reports/${reportId}/submit-signed`, payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setFinalSuccess(true);
        } catch (error) {
            alert("Error uploading signed report: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (finalSuccess) {
        return (
            <FormLayout>
                <div className="bg-white p-12 rounded-2xl shadow-xl text-center animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Process Complete!</h2>
                    <p className="text-gray-600 text-lg mb-8">
                        The signed report has been uploaded successfully.
                        <br />
                        <span className="font-semibold text-green-700">
                            The certificate has been automatically sent to the Agency.
                        </span>
                    </p>
                    <button
                        onClick={() => window.location.href = '/hospital-dashboard'}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </FormLayout>
        );
    }

    if (success) {
        return (
            <FormLayout>
                <div className="bg-white p-12 rounded-2xl shadow-xl text-center animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Medical Report Created!</h2>
                    <p className="text-gray-600 text-lg mb-8">
                        The initial report has been recorded.
                        Please print the PDF, sign/stamp it, and upload the scanned copy to finalize.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-2">Step 1: Print Report</h3>
                            <button
                                onClick={handlePrintPDF}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all mb-2"
                            >
                                Print PDF
                            </button>
                            <p className="text-xs text-gray-500">Opens in new tab. Use browser print (Ctrl+P).</p>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-2">Step 2: Upload Signed Copy</h3>
                            <label className="block w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all cursor-pointer">
                                {loading ? "Uploading..." : "Upload Scanned PDF"}
                                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg" onChange={handleUploadSigned} disabled={loading} />
                            </label>
                            <p className="text-xs text-gray-500">Supported: PDF, JPG</p>
                        </div>
                    </div>

                    <button onClick={() => window.location.href = '/hospital-dashboard'} className="text-gray-500 hover:text-gray-800 font-medium transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </FormLayout>
        );
    }

    return (
        <FormLayout>
            <div className="bg-white px-8 pt-8 pb-6 rounded-lg shadow-md border-t-8 border-green-600 mb-6 relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Medical Examination Report</h1>
                        <p className="text-lg text-gray-600 font-medium">Doctor's submission for candidate fitness.</p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/hospital-dashboard'}
                        className="bg-white/90 backdrop-blur text-green-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-white transition-all flex items-center gap-2 text-sm"
                    >
                        View Dashboard <ArrowRight size={16} />
                    </button>
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
                    <span className={currentStep >= 1 ? "text-green-600 transition-colors duration-300" : ""}>OVERVIEW</span>
                    <span className={currentStep >= 2 ? "text-green-600 transition-colors duration-300" : ""}>SYSTEMIC</span>
                    <span className={currentStep >= 3 ? "text-green-600 transition-colors duration-300" : ""}>VISION</span>
                    <span className={currentStep >= 4 ? "text-green-600 transition-colors duration-300" : ""}>LAB</span>
                    <span className={currentStep >= 5 ? "text-green-600 transition-colors duration-300" : ""}>FINAL</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">

                {/* STEP 1: Overview & Vitals */}
                {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">I. Examination Details</h2>
                            <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <label className="block text-sm font-medium text-blue-800 mb-2">Search Booking by Passport</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchPassport}
                                        onChange={(e) => setSearchPassport(e.target.value)}
                                        placeholder="Enter Passport Number"
                                        className="flex-1 p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePassportSearch}
                                        disabled={searching}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70"
                                    >
                                        {searching ? "Searching..." : "Find"}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Photo</label>
                                    <input
                                        type="file"
                                        name="candidate_photo"
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        accept="image/*"
                                    />
                                </div>
                                <FieldCard label="Booking ID" name="booking_id" value={formData.booking_id} onChange={handleChange} placeholder="e.g. 12" error={errors.booking_id} type="number" />
                                <FieldCard label="Expiry Date" name="report_expiry_date" value={formData.report_expiry_date} onChange={handleChange} type="date" error={errors.report_expiry_date} />
                                <FieldCard label="GHC Code" name="ghc_code" value={formData.ghc_code} onChange={handleChange} placeholder="GHC-2026-001" error={errors.ghc_code} />
                                <FieldCard label="GCC Slip No" name="gcc_slip_no" value={formData.gcc_slip_no} onChange={handleChange} placeholder="GCC-123456" error={errors.gcc_slip_no} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">II. Vitals & Anthropometry</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FieldCard label="Height (m)" name="height" value={formData.height} onChange={handleChange} placeholder="1.75" type="number" step="0.01" />
                                <FieldCard label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} placeholder="70.5" type="number" step="0.1" />
                                <FieldCard label="BMI" name="bmi" value={formData.bmi} disabled={true} placeholder="Auto-calculated" />
                                <FieldCard label="Blood Pressure" name="bp" value={formData.bp} onChange={handleChange} placeholder="120/80" />
                                <FieldCard label="Pulse (bpm)" name="pulse" value={formData.pulse} onChange={handleChange} placeholder="72" type="number" />
                                <FieldCard label="RR (min)" name="rr_min" value={formData.rr_min} onChange={handleChange} placeholder="16" type="number" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Systemic & Mental Status */}
                {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">III. Physical Examination</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FieldCard label="Appearance" name="system_appearance" value={formData.system_appearance} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Cardiovascular" name="system_cardiovascular" value={formData.system_cardiovascular} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Respiratory" name="system_respiratory" value={formData.system_respiratory} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="ENT" name="system_ent" value={formData.system_ent} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Abdomen" name="gi_abdomen" value={formData.gi_abdomen} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Hernia" name="gi_hernia" value={formData.gi_hernia} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Genitourinary" name="gu_genitourinary" value={formData.gu_genitourinary} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Hydrocele" name="gu_hydrocele" value={formData.gu_hydrocele} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Extremities" name="ms_extremities" value={formData.ms_extremities} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Back" name="ms_back" value={formData.ms_back} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Skin" name="ms_skin" value={formData.ms_skin} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="CNS" name="ms_cns" value={formData.ms_cns} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Deformities" name="ms_deformities" value={formData.ms_deformities} onChange={handleChange} options={["NAD", "Abnormal"]} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">IV. Mental Status Examination</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FieldCard label="Mental Appearance" name="mental_appearance" value={formData.mental_appearance} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Behavior" name="mental_behavior" value={formData.mental_behavior} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Speech" name="mental_speech" value={formData.mental_speech} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Cognition" name="mental_cognition" value={formData.mental_cognition} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Memory" name="mental_memory" value={formData.mental_memory} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Mood" name="mental_mood" value={formData.mental_mood} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Orientation" name="mental_orientation" value={formData.mental_orientation} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Concentration" name="mental_concentration" value={formData.mental_concentration} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Thoughts" name="mental_thoughts" value={formData.mental_thoughts} onChange={handleChange} options={["NAD", "Abnormal"]} />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Vision & Hearing */}
                {currentStep === 3 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">V. Visual Acuity & Hearing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-700 underline">Distant Vision</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldCard label="Left (Unaided)" name="vision_distant_unaided_left" value={formData.vision_distant_unaided_left} onChange={handleChange} placeholder="6/6" />
                                    <FieldCard label="Right (Unaided)" name="vision_distant_unaided_right" value={formData.vision_distant_unaided_right} onChange={handleChange} placeholder="6/6" />
                                    <FieldCard label="Left (Aided)" name="vision_distant_aided_left" value={formData.vision_distant_aided_left} onChange={handleChange} placeholder="6/6" />
                                    <FieldCard label="Right (Aided)" name="vision_distant_aided_right" value={formData.vision_distant_aided_right} onChange={handleChange} placeholder="6/6" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-700 underline">Near Vision</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldCard label="Left (Unaided)" name="vision_near_unaided_left" value={formData.vision_near_unaided_left} onChange={handleChange} placeholder="20/20" />
                                    <FieldCard label="Right (Unaided)" name="vision_near_unaided_right" value={formData.vision_near_unaided_right} onChange={handleChange} placeholder="20/20" />
                                    <FieldCard label="Left (Aided)" name="vision_near_aided_left" value={formData.vision_near_aided_left} onChange={handleChange} placeholder="20/20" />
                                    <FieldCard label="Right (Aided)" name="vision_near_aided_right" value={formData.vision_near_aided_right} onChange={handleChange} placeholder="20/20" />
                                </div>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                                <FieldCard label="Color Vision" name="vision_colour" value={formData.vision_colour} onChange={handleChange} options={["Normal", "Abnormal"]} />
                                <FieldCard label="Hearing Left" name="hearing_left" value={formData.hearing_left} onChange={handleChange} options={["Normal", "Abnormal"]} />
                                <FieldCard label="Hearing Right" name="hearing_right" value={formData.hearing_right} onChange={handleChange} options={["Normal", "Abnormal"]} />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: Laboratory Results */}
                {currentStep === 4 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">VI. Laboratory Investigation</h2>

                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 underline">Haematology & Parasitology</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <FieldCard label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
                                <FieldCard label="Hb (g/dL)" name="blood_haemoglobin" value={formData.blood_haemoglobin} onChange={handleChange} placeholder="14.5" />
                                <FieldCard label="Malaria" name="thick_film_malaria" value={formData.thick_film_malaria} onChange={handleChange} options={["Absent", "Present"]} />
                                <FieldCard label="Microfilaria" name="thick_film_microfilaria" value={formData.thick_film_microfilaria} onChange={handleChange} options={["Absent", "Present"]} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-bold text-gray-700 underline">Biochemistry</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FieldCard label="RBS (mg/dL)" name="biochem_rbs" value={formData.biochem_rbs} onChange={handleChange} placeholder="95" />
                                <FieldCard label="Creatinine (mg/dL)" name="biochem_creatinine" value={formData.biochem_creatinine} onChange={handleChange} placeholder="1.0" />
                                <FieldCard label="LFT" name="biochem_lft" value={formData.biochem_lft} onChange={handleChange} options={["Normal", "Abnormal"]} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-bold text-gray-700 underline">Serology</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FieldCard label="HIV 1 & 2" name="serology_hiv" value={formData.serology_hiv} onChange={handleChange} options={["Negative", "Positive"]} />
                                <FieldCard label="HCV" name="serology_hcv" value={formData.serology_hcv} onChange={handleChange} options={["Negative", "Positive"]} />
                                <FieldCard label="HBsAg" name="serology_hbsag" value={formData.serology_hbsag} onChange={handleChange} options={["Negative", "Positive"]} />
                                <FieldCard label="VDRL" name="serology_vdrl" value={formData.serology_vdrl} onChange={handleChange} options={["Negative", "Positive"]} />
                                <FieldCard label="TPHA" name="serology_tpha" value={formData.serology_tpha} onChange={handleChange} options={["Negative", "Positive"]} />
                                <FieldCard label="Pregnancy" name="serology_pregnancy" value={formData.serology_pregnancy} onChange={handleChange} options={["Negative", "Positive", "N/A"]} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-bold text-gray-700 underline">Urine & Stool</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <FieldCard label="Urine Sugar" name="urine_sugar" value={formData.urine_sugar} onChange={handleChange} options={["Negative", "Positive"]} />
                                <FieldCard label="Urine Albumin" name="urine_albumin" value={formData.urine_albumin} onChange={handleChange} options={["Negative", "Positive"]} />
                                <FieldCard label="Helminthes" name="stool_helminthes" value={formData.stool_helminthes} onChange={handleChange} options={["Absent", "Present"]} />
                                <FieldCard label="Stool Ova" name="stool_ova" value={formData.stool_ova} onChange={handleChange} options={["Absent", "Present"]} />
                                <FieldCard label="Stool Cyst" name="stool_cyst" value={formData.stool_cyst} onChange={handleChange} options={["Absent", "Present"]} />
                                <div className="md:col-span-3">
                                    <FieldCard label="Stool Others" name="stool_others" value={formData.stool_others} onChange={handleChange} placeholder="e.g. Normal" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: Radiology, Vaccinations & Final Assessment */}
                {currentStep === 5 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">VII. Radiology</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FieldCard label="Chest X-Ray" name="radiology_chest_xray" value={formData.radiology_chest_xray} onChange={handleChange} options={["NAD", "Abnormal"]} />
                                <FieldCard label="Radiology Comment" name="radiology_comment" value={formData.radiology_comment} onChange={handleChange} placeholder="e.g. Clear lung fields" />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h2 className="text-xl font-bold text-gray-800 pb-2 mb-4">VIII. Vaccination Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <FieldCard label="Polio" name="vac_polio" value={formData.vac_polio} onChange={(e) => setFormData(p => ({ ...p, vac_polio: e.target.checked }))} type="checkbox" />
                                    <input type="date" name="vac_polio_date" value={formData.vac_polio_date} onChange={handleChange} className="p-2 border rounded-lg text-sm" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <FieldCard label="MMR 1" name="vac_mmr1" value={formData.vac_mmr1} onChange={(e) => setFormData(p => ({ ...p, vac_mmr1: e.target.checked }))} type="checkbox" />
                                    <input type="date" name="vac_mmr1_date" value={formData.vac_mmr1_date} onChange={handleChange} className="p-2 border rounded-lg text-sm" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <FieldCard label="MMR 2" name="vac_mmr2" value={formData.vac_mmr2} onChange={(e) => setFormData(p => ({ ...p, vac_mmr2: e.target.checked }))} type="checkbox" />
                                    <input type="date" name="vac_mmr2_date" value={formData.vac_mmr2_date} onChange={handleChange} className="p-2 border rounded-lg text-sm" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <FieldCard label="Meningococcal" name="vac_meningococcal" value={formData.vac_meningococcal} onChange={(e) => setFormData(p => ({ ...p, vac_meningococcal: e.target.checked }))} type="checkbox" />
                                    <input type="date" name="vac_meningococcal_date" value={formData.vac_meningococcal_date} onChange={handleChange} className="p-2 border rounded-lg text-sm" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl md:col-span-2">
                                    <FieldCard label="COVID-19" name="vac_covid19" value={formData.vac_covid19} onChange={(e) => setFormData(p => ({ ...p, vac_covid19: e.target.checked }))} type="checkbox" />
                                    <input type="date" name="vac_covid19_date" value={formData.vac_covid19_date} onChange={handleChange} className="p-2 border rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h2 className="text-xl font-bold text-gray-800 pb-2 mb-4">IX. Final Assessment</h2>
                            <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-100 italic mb-6">
                                <FieldCard label="Overall Remarks" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="e.g. Candidate is physically and mentally fit for travel." />
                            </div>
                            <div className="p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-inner">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Fitness Decision</h3>
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
