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
        "pb-2",
        "text-transparent bg-clip-text bg-gradient-to-br",
        "from-cyan-600 to-green-600",
        "select-none"
    ),
    categoryStat: clsx("text-3xl", "text-green-900", "select-none"),
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
};
