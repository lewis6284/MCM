import React from "react";

const FieldCard = ({ label, name, value, onChange, type = "text", options = null, placeholder = "", error = false }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300">
            <label className="text-gray-800 font-medium text-base block mb-2">
                {label} <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-4 group">
                {type === "radio" ? (
                    <div className={`flex flex-col gap-4 p-3 rounded-xl transition-all duration-300 ${error ? "bg-red-50 ring-1 ring-red-200" : ""}`}>
                        {options.map((opt, index) => {
                            const isObject = typeof opt === 'object' && opt !== null;
                            const val = isObject ? opt.value : opt;
                            const lab = isObject ? opt.label : opt;
                            const isSelected = value === val;

                            return (
                                <label key={index} className="flex items-center cursor-pointer group/radio">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="radio"
                                            name={name}
                                            value={val}
                                            checked={isSelected}
                                            onChange={onChange}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${isSelected ? "border-green-600 bg-green-50" : error ? "border-red-300 bg-white" : "border-gray-300 bg-white"}`} />
                                        <div className={`absolute w-2.5 h-2.5 rounded-full bg-green-600 transition-all duration-300 transform ${isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                                    </div>
                                    <span className={`ml-3 text-base transition-colors duration-300 ${isSelected ? "text-green-700 font-semibold" : error ? "text-red-500" : "text-gray-600 font-medium"}`}>
                                        {lab}
                                    </span>
                                </label>
                            );
                        })}
                        {error && (
                            <p className="text-xs text-red-500 font-medium mt-1 animate-pulse">
                                * This selection is mandatory
                            </p>
                        )}
                    </div>
                ) : options ? (
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full pb-2 bg-transparent outline-none appearance-none border-none text-gray-700 cursor-pointer"
                    >
                        <option value="">{placeholder || "Select"}</option>
                        {options.map((opt, index) => {
                            const isObject = typeof opt === 'object' && opt !== null;
                            const val = isObject ? opt.value : opt;
                            const lab = isObject ? opt.label : opt;
                            return (
                                <option key={isObject ? val : index} value={val}>
                                    {lab}
                                </option>
                            );
                        })}
                    </select>
                ) : type === "file" ? (
                    <div className="flex flex-col gap-2">
                        <input
                            type="file"
                            name={name}
                            onChange={onChange}
                            className="w-full pb-2 bg-transparent outline-none border-none text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                        />
                        {value && typeof value === 'string' && (
                            <p className="text-xs text-gray-500 truncate">Selected: {value}</p>
                        )}
                        {value && value instanceof File && (
                            <p className="text-xs text-gray-500 truncate">Selected: {value.name}</p>
                        )}
                    </div>
                ) : type === "checkbox" ? (
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name={name}
                            checked={value}
                            onChange={onChange}
                            className="w-5 h-5 accent-green-600 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-500 italic">Received / Completed</span>
                    </div>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="w-full pb-2 bg-transparent outline-none border-none text-gray-700 placeholder:text-gray-400"
                    />
                ) /* end input type check */}

                {/* Static bottom line - Hidden for radio types as they don't follow the line design */}
                {type !== "radio" && (
                    <div className={`absolute bottom-0 left-0 w-full h-[1.5px] ${error ? "bg-red-500" : "bg-gray-300"}`} />
                )}

                {/* Animated growing focus line - Hidden for radio types */}
                {type !== "radio" && (
                    <div
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-green-500 transition-all duration-300 ease-out origin-center w-0 group-focus-within:w-full
                            ${error ? "bg-red-500 opacity-50" : ""}`}
                    />
                )}
            </div>
        </div>
    );
};

export default FieldCard;
