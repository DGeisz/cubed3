import clsx from "clsx";
import { LandingStyles } from "../../../landing_styles";

export const GalleryItemStyles = {
    TitleHeader: clsx(
        "text-transparent",
        "bg-clip-text",
        "bg-gradient-to-br",
        "from-red-500 to-yellow-500",
        "font-extrabold",
        "leading-3"
    ),
    ContentText: clsx("font-semibold", "text-slate-800", "text-2xl"),
    ViewButton: clsx(
        "bg-gradient-to-br",
        "from-pink-600 to-purple-700",
        "text-white font-extrabold",
        "px-4 py-2",
        "rounded-lg",
        "cursor-pointer",
        "select-none"
    ),
};
