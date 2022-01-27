import clsx from "clsx";

const pageMarkerText = "text-2xl sm:text-3xl";
export const pinkToPurple = "from-purple-500 via-sky-400 to-emerald-400";
export const gradientText = clsx(
    "text-transparent",
    "bg-clip-text",
    "bg-gradient-to-tr"
);
const redYellowText = clsx(
    "text-transparent",
    "bg-clip-text",
    "bg-gradient-to-tr",
    pinkToPurple
);
export const LandingStyles = {
    HeaderOption: clsx(
        "text-xl",
        "px-2 lg:px-4",
        "cursor-pointer",
        "font-extrabold",
        "pb-2",
        "text-transparent bg-clip-text bg-gradient-to-tr",
        pinkToPurple,
        "select-none"
    ),
    HeaderOptionMobile: clsx(
        "text-3xl",
        "px-4",
        "cursor-pointer",
        "font-extrabold",
        "pb-2",
        "text-transparent bg-clip-text bg-gradient-to-tr",
        pinkToPurple,
        "select-none",
        "mb-2"
    ),
    PageMarker: clsx(
        pageMarkerText,
        "font-bold",
        "cursor-pointer",
        "text-transparent",
        "bg-clip-text",
        "bg-gradient-to-tr",
        pinkToPurple
    ),
    MarkerDot: clsx("mx-2", pageMarkerText),
    MintButton: clsx(
        "bg-gradient-to-tr",
        // "from-red-500 to-yellow-400",
        pinkToPurple,
        "text-white",
        "font-extrabold",
        "py-3 px-4",
        "rounded-lg",
        "shadow-md",
        "cursor-pointer",
        "select-none",
        "text-xl sm:text-2xl md:text-3xl",
        "transition-all duration-100",
        "active:opacity-60"
    ),
    WalletButton: clsx(
        "bg-gradient-to-tr",
        // "from-red-500 to-yellow-400",
        pinkToPurple,
        "text-white !h-[40px] !px-[24px]",
        "font-extrabold",
        "py-3 px-4",
        "rounded-lg",
        "shadow-md",
        "cursor-pointer",
        "select-none",
        "!text-md"
    ),
    CenteringContainer: clsx("flex flex-col justify-center items-center"),
    ContentContainer: clsx(
        "w-full",
        "sm:rounded-lg",
        "bg-slate-800/80",
        "text-center",
        "backdrop-blur-md",
        "shadow-md",
        "flex flex-col",
        "px-4 py-4",
        "mb-16"
    ),
    ContentTitle: clsx(
        "text-6xl font-extrabold",
        "text-transparent",
        "bg-clip-text",
        "bg-gradient-to-tr",
        pinkToPurple,
        "mb-8"
    ),
    ContentText: clsx("font-bold text-left text-xl text-slate-100 "),
    CubedText: redYellowText,
    SolanaText: clsx(
        "text-transparent bg-clip-text bg-gradient-to-tr",
        pinkToPurple
    ),
    AboutListItem: clsx(
        "text-transparent",
        "bg-clip-text",
        " bg-gradient-to-tr",
        // "from-pink-400 to-purple-600",
        pinkToPurple,
        "mt-10 mb-2",
        "text-3xl"
    ),
    SubHeader: clsx("text-slate-200", "mt-6 mb-2", "text-2xl"),
    TeamContainer: clsx(
        "bg-slate-600/50",
        "p-4 m-4",
        "rounded",
        "flex flex-col justify-center"
    ),
    TeamTitle: clsx(
        "text-2xl",
        "font-bold",
        "text-transparent",
        "bg-clip-text",
        "bg-gradient-to-t",
        pinkToPurple,
        "justify-self-center self-center"
    ),
    TeamPosition: clsx("text-slate-200", "font-semibold"),
};
