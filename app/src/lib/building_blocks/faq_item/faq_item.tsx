import clsx from "clsx";
import React, { useState } from "react";
import { LandingStyles } from "../../landing_styles";

interface Props {
    question: string;
}

const fontSize = "text-xl";

const FaqItem: React.FC<Props> = (props) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div
            onClick={() => setOpen(!open)}
            className={clsx(
                "bg-slate-700/90",
                "rounded",
                "p-4 m-2",
                "text-left",
                "cursor-pointer"
            )}
        >
            <div
                className={clsx(
                    "flex",
                    open && "pb-1 border-b-2 border-solid border-slate-200/40"
                )}
            >
                <div
                    className={clsx(
                        fontSize,
                        "duration-300",
                        "text-slate-200",
                        open ? "rotate-45" : "rotate-0"
                    )}
                >
                    +
                </div>
                <div
                    className={clsx(
                        fontSize,
                        "ml-4",
                        "text-slate-200",
                        "font-semibold"
                    )}
                >
                    {props.question}
                </div>
            </div>
            {open && (
                <div className="mt-3 flex flex-col justify-start font-semibold text-left text-slate-200">
                    {props.children}
                </div>
            )}
        </div>
    );
};

export default FaqItem;
