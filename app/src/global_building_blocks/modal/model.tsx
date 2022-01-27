import React, { useEffect, useState } from "react";
import clsx from "clsx";

interface Props {
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

const Modal: React.FC<Props> = (props) => {
    const [intVis, setIntVis] = useState<boolean>(false);
    const [finalVis, setFinal] = useState<boolean>(false);

    useEffect(() => {
        if (props.visible) {
            setFinal(true);
            setTimeout(() => {
                setIntVis(true);
            }, 10);
        } else {
            if (intVis) {
                setIntVis(false);
                setTimeout(() => {
                    setFinal(false);
                }, 300);
            } else {
                setFinal(false);
            }
        }
    }, [props.visible]);

    return (
        <div
            className={clsx(
                finalVis ? "fixed inset-0" : "hidden",
                "flex justify-center items-center !z-[200]",
                "bg-slate-800/80",
                "transition-all duration-300",
                !intVis && "opacity-0"
            )}
            onClick={() => props.setVisible(false)}
        >
            <div className={clsx("bg-white", "rounded-lg", "p-8")}>
                {props.children}
            </div>
        </div>
    );
};

export default Modal;
