import clsx from "clsx";
import React from "react";

const BottomBar: React.FC = () => {
    return (
        <div className={clsx("bg-gray-800 py-8 px-4", "flex")}>
            <div className={clsx("font-semibold", "text-lg", "text-slate-400")}>
                Copyright, All Rights Reserved
            </div>
        </div>
    );
};

export default BottomBar;
