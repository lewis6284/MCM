import React from "react";
import BackgroundWatermark from "./BackgroundWatermark";
import gulfLogo from "../asset/gulflogo.svg";
import mainLogo from "../asset/logo.png";

const FormLayout = ({ children }) => {
    return (
        <div className="bg-green-100 min-h-screen py-10 px-4 relative overflow-hidden font-sans">
            <BackgroundWatermark />

            {/* Top-right Logos */}
            <div className="absolute top-6 right-8 z-20 flex items-center gap-4">
                <img
                    src={gulfLogo}
                    alt="Gulf Logo"
                    className="h-12 md:h-16 w-auto drop-shadow-sm"
                />
                <div className="h-8 w-[1px] bg-green-200" />
                <img
                    src={mainLogo}
                    alt="MCM Logo"
                    className="h-12 md:h-16 w-auto drop-shadow-sm"
                />
            </div>

            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                {children}
            </div>
        </div>
    );
};

export default FormLayout;
