import clsx from "clsx";

export const StudioStyles = {
    categoryContainer: clsx(
        "rounded-lg",
        "bg-gradient-to-br",
        "from-green-50 to-blue-100",
        "p-2",
        "shadow-md",
        "mb-4"
    ),
    categoryTitle: clsx(
        "font-extrabold",
        "text-lg",
        "pb-2",
        "text-transparent bg-clip-text bg-gradient-to-br",
        "from-cyan-600 to-green-600",
        "select-none"
    ),
    blueGreenText: clsx(
        "text-transparent bg-clip-text bg-gradient-to-br",
        "from-cyan-800 to-green-800"
    ),
    categoryStat: clsx(
        "text-md",
        "text-transparent bg-clip-text bg-gradient-to-br",
        "from-cyan-800 to-green-800",
        "select-none",
        "font-bold"
    ),
    categoryText: clsx("text-xl", "text-green-900", "select-none"),
    categoryTextNone: clsx("text-xl", "text-gray-400", "select-none"),
    buttonContainer: clsx(
        "flex justify-center items-center",
        "select-none",
        "mb-2"
    ),
    studioButton: clsx(
        "bg-cyan-500",
        "text-white",
        "font-extrabold",
        "py-2 px-3",
        "rounded-lg",
        "shadow-md",
        "cursor-pointer",
        "select-none"
    ),
    smallButton: clsx(
        "bg-cyan-500",
        "text-white",
        "font-extrabold",
        "py-1 px-2",
        "rounded-lg",
        "shadow-md",
        "cursor-pointer",
        "select-none"
    ),
    buttonDisabled: clsx("opacity-50"),
    studioButtonDisabled: clsx(
        "bg-cyan-500",
        "opacity-50",
        "text-white",
        "font-extrabold",
        "py-2 px-3",
        "rounded-lg",
        "shadow-md",
        "select-none"
    ),
    studioButtonCancel: clsx(
        "bg-gray-200",
        "text-gray-400",
        "font-extrabold",
        "py-2 px-3",
        "rounded-lg",
        "shadow-md",
        "cursor-pointer",
        "select-none"
    ),
    studioTitle: clsx("font-bold", "text-slate-500"),
    marketPlaceContainer: clsx("self-stretch"),
    mpContainerAddOn: clsx("pb-4", "mb-4", "border-b border-slate-300"),
    marketPlaceTextContainer: clsx("mb-3"),
    marketplaceTitle: clsx("text-sm font-bold text-slate-400"),
    marketplaceAmount: clsx(
        "text-2xl font-bold",
        "text-transparent bg-clip-text",
        "bg-gradient-to-tr",
        "from-purple-600 via-sky-600 to-emerald-600"
    ),
    marketplaceButtonContainer: clsx(
        "self-stretch flex justify-center items-center"
    ),
    studioOptionActive: clsx(
        "text-white text-lg",
        "font-bold",
        "px-4 py-2",
        "mx-4",
        "rounded-full",
        "bg-gradient-to-tr",
        "from-purple-600 via-sky-600 to-emerald-600",
        "cursor-pointer"
    ),
    studioOptionInactive: clsx(
        "text-white text-lg",
        "font-bold",
        "px-4 py-2",
        "mx-4",
        "rounded-full",
        // "bg-gradient-to-tr",
        // "from-purple-600 via-sky-600 to-emerald-600",
        "cursor-pointer"
    ),
};
