import React from "react";

const BackgroundWatermark = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 flex flex-wrap content-start justify-center opacity-5 select-none overflow-hidden gap-12">
            {Array.from({ length: 200 }).map((_, i) => (
                <span key={i} className="text-6xl font-black text-green-900 rotate-[-12deg] tracking-widest whitespace-nowrap">
                    MCM
                </span>
            ))}
        </div>
    );
};

export default BackgroundWatermark;
