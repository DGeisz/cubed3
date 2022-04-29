import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { LandingStyles, pinkToPurple } from "../lib/landing_styles";
import TopBar from "../global_building_blocks/top_bar/top_bar";
import { isOnMobile } from "../global_utils/screen";
import FaqItem from "../lib/building_blocks/faq_item/faq_item";
import { LineBreak } from "../global_building_blocks/line_break/line_break";
import BottomBar from "../global_building_blocks/bottom_bar/bottom_bar";
import _ from "underscore";
import CubeBackground from "../global_building_blocks/cube_background/cube_background";
require("@solana/wallet-adapter-react-ui/styles.css");
import { useProvider } from "../lib/service_providers/provider_provider";
import {
    getDefaultAddresses,
    initializeCubed,
} from "../global_chain/chain_methods";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { priceEmaLamportsToCurrentSol } from "../global_chain/chain_utils";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import axios from "axios";
import { buyCanvasOnChainAndServer } from "../lib/api/mutations";
import { useRouter } from "next/router";
import { DotLoader } from "react-spinners";
import { AiFillTwitterCircle } from "react-icons/ai";
import Link from "next/link";

const DEV = false;

const BUY_CANVAS_LIVE = true;
const pfpSideLen = 260;

const Landing: NextPage = () => {
    const { provider, program } = useProvider();

    const { setVisible } = useWalletModal();

    const [price, setPrice] = useState<number>(0.1);

    const [buyLoading, setBuyLoading] = useState<boolean>(false);

    const callBuyCanvas = async () => {
        const res = await axios.post("http://localhost:4000/buy_canvas", {
            hello: 1,
        });

        console.log("called", res.data);
    };

    const router = useRouter();

    const CubedText = <span className={LandingStyles.SolanaText}>Cubed</span>;

    useEffect(() => {
        let master_pda: PublicKey;

        const fetchPrice = async () => {
            if (!master_pda) {
                master_pda = (await getDefaultAddresses(program)).master_pda;
            }

            try {
                const master = await program.account.cubedMaster.fetch(
                    master_pda
                );

                const nowSec = Math.floor(Date.now() / 1000);

                const current = priceEmaLamportsToCurrentSol(
                    master.canvasPriceEma.toNumber(),
                    nowSec - master.lastCanvasTime.toNumber()
                );

                setPrice(current);
            } catch (e) {
                console.error("Could fetch from master", e);
            }
        };

        fetchPrice();

        if (BUY_CANVAS_LIVE) {
            const interval = setInterval(fetchPrice, 5000);

            return () => clearInterval(interval);
        }
    }, [provider, program]);

    async function init() {
        if (DEV) {
            await initializeCubed(provider, program);
            const canvases = await program.account.cubedCanvas.all();
            const { master_pda } = await getDefaultAddresses(program);
            const master = await provider.connection.getAccountInfo(master_pda);

            console.log("canvases", canvases);
            if (master) {
                console.log(
                    "master.lamports / LAMPORTS_PER_SOL",
                    master.lamports / LAMPORTS_PER_SOL
                );
            }
        }
    }

    const scrollToId = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <div>
            <CubeBackground />
            <div className="flex flex-col h-full w-full relative">
                <TopBar />
                <div className={clsx("mt-8", "sm:mx-16")}>
                    <div className={LandingStyles.ContentContainer}>
                        <div className="flex flex-col lg:flex-row">
                            <div
                                className={clsx(
                                    "flex-1",
                                    "justify-center items-center",
                                    "border-b-2 lg:border-b-0 lg:border-r-2 border-opacity-40 border-gray-600 sm:pr-4",
                                    "py-8 sm:py-12",
                                    "!z-0"
                                )}
                            >
                                <div className="flex justify-center items-center">
                                    <h1
                                        className={clsx(
                                            "text-8xl font-extrabold",
                                            "text-transparent",
                                            "bg-clip-text",
                                            "bg-gradient-to-tr",
                                            pinkToPurple,
                                            "mx-auto",
                                            DEV && "cursor-pointer"
                                        )}
                                        // onClick={callBuyCanvas}
                                        onClick={init}
                                    >
                                        Cubed
                                    </h1>
                                </div>
                                <p className="mt-4 text-3xl font-bold text-slate-200">
                                    Rubiks Cube Mosaics just found{" "}
                                    <span className={LandingStyles.SolanaText}>
                                        Solana
                                    </span>
                                </p>
                                <div className="flex justify-center items-center mt-4">
                                    <a
                                        href="https://twitter.com/cubed_art"
                                        target="_blank"
                                    >
                                        <AiFillTwitterCircle
                                            size={35}
                                            className="text-slate-600"
                                        />
                                    </a>
                                </div>
                            </div>
                            <div className="flex flex-1 justify-center items-center flex-col py-8 px-4">
                                <div
                                    className={LandingStyles.CenteringContainer}
                                >
                                    <div
                                        className={clsx(
                                            "bg-slate-600 bg-opacity-60",
                                            "px-8 py-4",
                                            "rounded-lg"
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                "text-white",
                                                "font-extrabold",
                                                !buyLoading && "mb-8",
                                                "rounded-lg",
                                                "cursor-pointer",
                                                "select-none",
                                                "text-3xl sm:text-4xl",
                                                "underline",
                                                "italic"
                                            )}
                                        >
                                            The Shop
                                        </div>
                                        {buyLoading ? (
                                            <div
                                                className={clsx(
                                                    "flex flex-1 justify-center items-center mb-8"
                                                )}
                                            >
                                                <DotLoader color="#00bcd4" />
                                            </div>
                                        ) : (
                                            <div
                                                className={clsx(
                                                    LandingStyles.MintButton,
                                                    !BUY_CANVAS_LIVE &&
                                                        "opacity-60 cursor-default"
                                                )}
                                                onClick={async () => {
                                                    if (BUY_CANVAS_LIVE) {
                                                        if (
                                                            provider.wallet
                                                                .publicKey
                                                        ) {
                                                            setBuyLoading(true);

                                                            const time =
                                                                await buyCanvasOnChainAndServer(
                                                                    provider,
                                                                    program
                                                                );

                                                            await router.push(
                                                                `studio/${time}`
                                                            );

                                                            setBuyLoading(
                                                                false
                                                            );
                                                        } else {
                                                            setVisible(true);
                                                        }
                                                    }
                                                }}
                                            >
                                                <span
                                                    className={clsx(
                                                        BUY_CANVAS_LIVE && [
                                                            "border-0 border-r-2 border-white",
                                                            "pr-2 mr-2",
                                                        ]
                                                    )}
                                                >
                                                    Buy Canvas
                                                </span>
                                                {BUY_CANVAS_LIVE && (
                                                    <span>◎{price}</span>
                                                )}
                                            </div>
                                        )}
                                        <div
                                            className={clsx(
                                                "text-lg font-semibold",
                                                "mt-[2px]",
                                                BUY_CANVAS_LIVE
                                                    ? "text-slate-300"
                                                    : "text-slate-600"
                                            )}
                                        >
                                            (
                                            {BUY_CANVAS_LIVE
                                                ? "Now Open"
                                                : "Coming Soon"}
                                            !)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={clsx("flex justify-center mt-2")}>
                            <div
                                className={LandingStyles.PageMarker}
                                onClick={() => scrollToId("about")}
                            >
                                About
                            </div>
                            <div className={LandingStyles.MarkerDot}>•</div>
                            <div
                                className={LandingStyles.PageMarker}
                                onClick={() => scrollToId("roadmap")}
                            >
                                Roadmap
                            </div>
                            <div className={LandingStyles.MarkerDot}>•</div>
                            <div
                                className={LandingStyles.PageMarker}
                                onClick={() => scrollToId("team")}
                            >
                                Creator
                            </div>
                            <div className={LandingStyles.MarkerDot}>•</div>
                            <div
                                className={LandingStyles.PageMarker}
                                onClick={() => scrollToId("faq")}
                            >
                                FAQ
                            </div>
                        </div>
                    </div>
                    <div className={clsx(LandingStyles.ContentContainer)}>
                        <div
                            id="about"
                            className={clsx(
                                LandingStyles.CenteringContainer,
                                "w-full"
                            )}
                        >
                            <h2 className={clsx(LandingStyles.ContentTitle)}>
                                About
                            </h2>
                        </div>
                        <div className={LandingStyles.ContentText}>
                            We can all agree that the lack of representation of
                            Rubiks Cubes in NFT projects is a heinous crime. We
                            come before you to rectify this horrific injustice.
                            <br />
                            <br />
                            Is this just another stupid PFP collection?{" "}
                            <i>HELL</i> no. Oh, then it is just another virtual
                            Rubiks Cube project? How about you go fuck yourself.
                            <br />
                            <br />
                            Well then, what is it? We built a way for <i>
                                you
                            </i>{" "}
                            to create an aesthetic masterpiece using nought but
                            the puzzle cube that has captured the imagination of
                            a generation. Need to see it for yourself? Ok,
                            Doubting Thomas.{" "}
                            <Link href="/mario">
                                <a className="text-sky-400">Check this out</a>
                            </Link>{" "}
                            and see what happens when you doubt us.
                            <br />
                            <br />
                            So who should sip from this glorious metaphorical
                            chalice? (The chalice being{" "}
                            <span className={LandingStyles.SolanaText}>
                                Cubed
                            </span>
                            ... you get it)
                            <div className={LandingStyles.AboutListItem}>
                                1. Cubing Fans
                            </div>
                            Whether you're a speed cuber or a puzzle cube
                            collector, {CubedText} gives you a totally new way
                            to experience the magic of the cube. It's also an
                            excellent excuse to learn a thing or two about
                            crypto if you haven't already had the chance.
                            <div className={LandingStyles.AboutListItem}>
                                2. Artists who are... out there :)
                            </div>
                            If you like making art, and you're not afraid to get
                            funky, {CubedText} gives you a way to create art
                            that's sure to enrapture you and delight even your
                            most dogmatic followers.
                            <div className={LandingStyles.AboutListItem}>
                                3. Crypto Collectors & Investors
                            </div>
                            Hey crypto people? Tired of seeing another stupid
                            BAYC derivative sell for $70k? Even though it's a
                            heap of hot garbage?
                            <br />
                            <br />
                            It takes time, effort, money and dedication to
                            produce a {CubedText} mosaic. So when you buy one,
                            you're buying something closer to a Mona Lisa than
                            something that might as well be a Google search
                            result of "dumb monkey clipart."
                        </div>
                    </div>
                    <div className={clsx(LandingStyles.ContentContainer)}>
                        <div
                            id="roadmap"
                            className={clsx(
                                LandingStyles.CenteringContainer,
                                "w-full"
                            )}
                        >
                            <h2 className={clsx(LandingStyles.ContentTitle)}>
                                Roadmap
                            </h2>
                        </div>
                        <div className={LandingStyles.ContentText}>
                            Sike, bitches! If you thought this was just another
                            idiotic PFP collection, kindly slink back to
                            whatever Discord server you just squelched out of.
                            <div className={LandingStyles.AboutListItem}>
                                ...so there's no Roadmap?
                            </div>
                            <div className={LandingStyles.SubHeader}>
                                Well, not quite
                            </div>
                            <i>You're</i> the roadmap! {CubedText} gives people
                            a way to create art, so {CubedText} really takes
                            flight when people create Rubiks Cube masterpieces!
                            <div className={LandingStyles.AboutListItem}>
                                So what's currently available?
                            </div>
                            <div className={LandingStyles.SubHeader}>
                                Mosaic Studio
                            </div>
                            We're built you all the tools you need to design,
                            create, and tweak our own Rubiks Cube Mosaics
                            (kindly take a peak at our{" "}
                            <Link href="/demo">
                                <a className="text-sky-400">demo</a>
                            </Link>
                            )
                            <div className={LandingStyles.SubHeader}>
                                Gallery & Marketplace
                            </div>
                            We've given you the basic tools to display and sell
                            your creations, should you so desire.
                            <div className={LandingStyles.AboutListItem}>
                                What's coming in the future?
                            </div>
                            <div className={LandingStyles.SubHeader}>
                                *sigh* ok, yeah, there's a roadmap
                            </div>
                            Moving forward, we're planning to create a more
                            robust marketplace that includes the ability to make
                            offers for mosaics you like, or auction mosaics you
                            think might fetch a pretty penny.
                            <br />
                            <br />
                            As {CubedText} grows, we'll also eventually add the
                            ability to make public and private collections of
                            mosaics. This will give you the ability to either
                            create a portfolio, or give you and your buddies a
                            way to reproduce SMB with Rubiks Cubes.
                            <div className={LandingStyles.SubHeader}>
                                Anything else?
                            </div>
                            As humble servants of the cube, we'll be doing
                            everything to further this project. We therefore
                            plan to actively maintain, improve, and expand the{" "}
                            {CubedText} platform. Don't you worry, baby.
                        </div>
                    </div>
                    <div className={clsx(LandingStyles.ContentContainer)}>
                        <div
                            id="team"
                            className={clsx(LandingStyles.CenteringContainer)}
                        >
                            <h2 className={clsx(LandingStyles.ContentTitle)}>
                                Creator
                            </h2>
                        </div>
                        <div className="flex flex-wrap justify-center">
                            <div className={LandingStyles.TeamContainer}>
                                <div className="h-[256px] w-[256px] mb-4">
                                    <a
                                        href="https://twitter.com/danny_nkjg"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Image
                                            src="/pfp.png"
                                            alt="logo"
                                            width={pfpSideLen}
                                            height={pfpSideLen}
                                        />
                                    </a>
                                </div>
                                <div className={LandingStyles.TeamTitle}>
                                    Danny Geisz
                                </div>
                                <div className={LandingStyles.TeamPosition}>
                                    (Aspiring Hype Lord)
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={clsx(LandingStyles.ContentContainer)}>
                        <div
                            id="faq"
                            className={clsx(LandingStyles.CenteringContainer)}
                        >
                            <h2 className={clsx(LandingStyles.ContentTitle)}>
                                FAQ
                            </h2>
                        </div>
                        <FaqItem question="Why Rubiks Cube Mosaics?">
                            <div className="flex flex-col items-start ">
                                <p>Quite a few reasons:</p>
                                <br />
                                <ul
                                    className={clsx(
                                        "list-decimal ml-4 flex items-start justify-start flex-col text-left font-semibold"
                                    )}
                                >
                                    <li>Rubiks Cubes are sick</li>
                                    <li>
                                        They're the physical version of pixel
                                        art
                                    </li>
                                    <li>They're objectively impressive</li>
                                    <li>
                                        Anyone can make them (with the right
                                        tools)
                                    </li>
                                    <li>
                                        The process of creating a mosaic can be
                                        cryptographically verified, so each
                                        Cubed Mosaic is also a proof of the time
                                        and effort needed to create it
                                    </li>
                                </ul>
                            </div>
                        </FaqItem>
                        <FaqItem question="How can I get involved?">
                            Make a mosaic, duuuhhh.
                            <LineBreak />
                            If you want to make friends, that's why we have a
                            discord, and if you want people to see your
                            creations, hit us up on twitter.
                            <LineBreak />
                            If you're just looking to collect some sick art,
                            well then, you're halfway to heaven. Just hit up the
                            marketplace to see what's cookin'.
                        </FaqItem>
                        <FaqItem question="Is this a rug pull?">
                            If this is a rug pull, then I just spent five months
                            creating the most elaborately stupid rug pull you
                            could even imagine. I had to learn how to write
                            Solana smart contracts, how to create 3d stuff in
                            the browser, and I came up with the custom algorithm
                            that solves the goddamn Rubiks Cube for you.
                            <LineBreak />
                            Oh, and also I'm not anonymous. So I'm either the
                            biggest idiot alive (which might be true, I
                            suppose), or this isn't a rugpull.
                        </FaqItem>
                        <FaqItem question="Is Cubed the secret to happiness?">
                            The answer to that question is so obvious it might
                            as well be written on the back of the Declaration of
                            Independence in invisible ink.
                        </FaqItem>
                    </div>
                </div>
                <BottomBar />
            </div>
        </div>
    );
};

export default Landing;
