import React, { useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import { LandingStyles } from "../../lib/landing_styles";
import Link from "next/link";
import { isOnMobile } from "../../global_utils/screen";
import { IoMdMenu } from "react-icons/io";
import Image from "next/image";
import {
    WalletDisconnectButton,
    WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import useEventListener from "@use-it/event-listener";
// import { WalletButton } from "../wallet_button/wallet_button";

const logoSize = 60;

const TopBar: React.FC = () => {
    const [menuVisible, showMenu] = useState<boolean>(false);
    const [barHeight, setHeight] = useState<number>(72);

    const ref = useRef<HTMLDivElement>(null);

    const resize = () => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
        }
    };

    useEventListener("resize", resize);
    useLayoutEffect(resize, []);

    return (
        <>
            <div
                className={clsx(
                    "flex",
                    "w-full",
                    "duration-300",
                    menuVisible ? "h-[350px]" : "h-[100px]",
                    `md:h-auto`,
                    "!z-100"
                )}
            >
                <div
                    ref={ref}
                    className={clsx(
                        "flex",
                        "w-full",
                        "flex-col md:flex-row",
                        "bg-slate-800/90",
                        "text-center",
                        "backdrop-blur-sm",
                        "py-[6px] md:py-5",
                        `md:text-xl`,
                        "shadow-md",
                        "mb-8",
                        "overflow-hidden",
                        "md:px-16"
                    )}
                >
                    <div className="flex justify-center my-2 md:my-auto">
                        <Link href="/">
                            <a
                                className={clsx(
                                    "block sm:hidden",
                                    "ml-2 text-2xl",
                                    "font-extrabold",
                                    "drop-shadow-sm",
                                    "cursor-pointer select-none",
                                    "w-[50px] h-[40px]"
                                )}
                            >
                                <Image
                                    src="/mini_logo.svg"
                                    alt="logo"
                                    layout="fill"
                                    // width={150}
                                />
                            </a>
                        </Link>
                        <Link href="/">
                            <a
                                className={clsx(
                                    "hidden sm:block",
                                    "ml-2 text-2xl",
                                    "font-extrabold",
                                    "drop-shadow-sm",
                                    "cursor-pointer select-none",
                                    "w-[150px] h-[40px]"
                                )}
                            >
                                <Image
                                    src="/logov3.svg"
                                    alt="logo"
                                    layout="fill"
                                    // width={150}
                                />
                            </a>
                        </Link>
                        <div className="flex md:hidden flex-grow justify-end">
                            <div
                                className={clsx(
                                    "h-[40px] w-[40px]",
                                    "flex justify-center items-center",
                                    "mr-2",
                                    "border-solid border-cyan-500 border-2",
                                    "rounded cursor-pointer"
                                )}
                                onClick={() => showMenu(!menuVisible)}
                            >
                                <IoMdMenu className="text-cyan-500" size={30} />
                            </div>
                        </div>
                    </div>
                    {/* For desktop */}
                    <div
                        className={clsx(
                            "hidden",
                            `md:flex`,
                            "justify-center items-center flex-grow flex-wrap"
                        )}
                    >
                        <div className="block">
                            <Link href="/">
                                <a className={LandingStyles.HeaderOption}>
                                    Home
                                </a>
                            </Link>
                            <Link href="/mario">
                                <a className={LandingStyles.HeaderOption}>
                                    Demo
                                </a>
                            </Link>
                        </div>
                        <div className="block">
                            <Link href="/gallery">
                                <a className={LandingStyles.HeaderOption}>
                                    Gallery
                                </a>
                            </Link>
                            <Link href="/studio">
                                <a className={LandingStyles.HeaderOption}>
                                    Your Studio
                                </a>
                            </Link>
                        </div>
                    </div>
                    <div
                        className={clsx("hidden", `md:block`, "w-[150px]")}
                    ></div>
                    {/* For mobile */}
                    <div
                        className={clsx(
                            "flex",
                            `md:hidden`,
                            "flex-col items-start",
                            "mt-8"
                        )}
                    >
                        <Link href="/">
                            <a className={LandingStyles.HeaderOptionMobile}>
                                Home
                            </a>
                        </Link>
                        <Link href="/mario">
                            <a className={LandingStyles.HeaderOptionMobile}>
                                Demo
                            </a>
                        </Link>
                        <Link href="/gallery">
                            <a className={LandingStyles.HeaderOptionMobile}>
                                Gallery
                            </a>
                        </Link>
                        <Link href="/studio">
                            <a className={LandingStyles.HeaderOptionMobile}>
                                Your Studio
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
            <div
                className={clsx(
                    "absolute right-[60px]",
                    "md:right-[68px] !z-100",
                    "flex justify-center items-center"
                    // "bg-red-300"
                )}
                style={{ height: barHeight }}
            >
                <WalletMultiButton
                    className={clsx(LandingStyles.WalletButton)}
                />
            </div>
        </>
    );
};

export default TopBar;
