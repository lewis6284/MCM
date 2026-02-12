import React from "react";
import BackgroundWatermark from "./BackgroundWatermark";
import gulfLogo from "../asset/gulflogo.svg";
import mainLogo from "../asset/logo.png";

const FormLayout = ({ children }) => {
    return (
        <div className="bg-green-100 min-h-screen py-10 px-4 relative overflow-hidden font-sans">
            <BackgroundWatermark />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Logos - Aligned with the form container */}
                <div className="flex justify-end items-center gap-4 mb-6">
                    <img
                        src={gulfLogo}
                        alt="Gulf Logo"
                        className="h-10 md:h-14 w-auto drop-shadow-sm"
                    />
                    <div className="h-8 w-[1px] bg-green-200" />
                    <img
                        src={mainLogo}
                        alt="MCM Logo"
                        className="h-12 md:h-16 w-auto drop-shadow-sm"
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
