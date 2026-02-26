import React from "react";
import BackgroundWatermark from "./BackgroundWatermark";
import gulfLogo from "../asset/BVFSlogo.png";
import mainLogo from "../asset/worldlogo.png";

const FormLayout = ({ children }) => {
    return (
        <div className="bg-green-100 min-h-screen py-10 px-4 relative overflow-hidden font-sans">
            <BackgroundWatermark />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Logos - Aligned with the form container */}
                <div className="flex justify-between items-center px-2 mb-6">
                    <img
                        src={gulfLogo}
                        alt="Gulf Logo"
                        className="h-24 md:h-38 w-auto drop-shadow-sm"
                    />
                    <img
                        src={mainLogo}
                        alt="MCM Logo"
                        className="h-16 md:h-20 w-auto drop-shadow-sm"
                    />
                </div>

                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FormLayout;
