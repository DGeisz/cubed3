import clsx from "clsx";
import { LandingStyles } from "../landing_styles";

export const DesignerStyles = {
    ToolTitle: clsx(
        "text-xl font-bold mb-1",
        LandingStyles.SolanaText,
        "from-cyan-500"
    ),
    ToolContainer: clsx(
        "bg-slate-100",
        "p-4 pt-2",
        "rounded",
        "shadow-md",
        "m-2"
    ),
    NumericInput: clsx(
        "border !border-gray-300 p-1 active:border-gray-300 rounded",
        "w-[150px]"
    ),
};
