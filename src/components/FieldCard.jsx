import React from "react";

const FieldCard = ({ label, name, value, onChange, type = "text", options = null, placeholder = "", error = false }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300">
            <label className="text-gray-800 font-medium text-base block mb-2">
                {label} <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-4 group">
                {options ? (
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full pb-2 bg-transparent outline-none appearance-none border-none text-gray-700 cursor-pointer"
                    >
                        <option value="">{placeholder || "Select"}</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="w-full pb-2 bg-transparent outline-none border-none text-gray-700 placeholder:text-gray-400"
                    />
                )}

                {/* Static bottom line */}
                <div className={`absolute bottom-0 left-0 w-full h-[1.5px] ${error ? "bg-red-500" : "bg-gray-300"}`} />

                {/* Animated growing focus line */}
                <div
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-green-500 transition-all duration-300 ease-out origin-center w-0 group-focus-within:w-full
                        ${error ? "bg-red-500 opacity-50" : ""}`}
                />
            </div>
        </div>
    );
};

export default FieldCard;
