import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { LandingStyles, pinkToPurple } from "../lib/landing_styles";
import TopBar from "../global_building_blocks/top_bar/top_bar";
import { isOnMobile } from "../global_utils/screen";
import { randomTapestry } from "../global_utils/tapestry_utils";
import FaqItem from "../lib/building_blocks/faq_item/faq_item";
import { LineBreak } from "../global_building_blocks/line_break/line_break";
import BottomBar from "../global_building_blocks/bottom_bar/bottom_bar";
import _ from "underscore";
import { MosaicTapestryV2 } from "../global_building_blocks/mosaic_tapestry/mosaic_tapestry";
import CubeBackground from "../global_building_blocks/cube_background/cube_background";
require("@solana/wallet-adapter-react-ui/styles.css");
import { useProvider } from "../lib/service_providers/provider_provider";
import {
    buyCanvas,
    getDefaultAddresses,
    initializeCubed,
} from "../global_chain/chain_methods";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { priceEmaLamportsToCurrentSol } from "../global_chain/chain_utils";
import { cubeSideLength } from "../global_constants/cube_dimensions";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Modal from "../global_building_blocks/modal/model";
import Image from "next/image";
import axios from "axios";
import { buyCanvasOnChainAndServer } from "../lib/api/mutations";
import { useRouter } from "next/router";
import { DotLoader } from "react-spinners";
import { AiFillTwitterCircle } from "react-icons/ai";

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
                                    Rubiks Cubes meet{" "}
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
                            TL;DR: We basically just wanna make cool art with
                            frens :)
                            <br />
                            <br />
                            Cubed aims to unite Solana NFT artists and
                            communities around the first Solana-native art
                            medium: Rubiks Cube Mosaics!
                            {!isOnMobile && (
                                <>
                                    <br />
                                    <br />
                                    Unlike other NFT projects, each Cubed Canvas
                                    you own is a canvas that <i>you</i> use to
                                    create a Rubiks Cube Mosaic! And don't
                                    worry: even if you've never touched a Rubiks
                                    Cube before, we've built you all sorts of
                                    tools that make it super easy to create a
                                    Mosaic you're proud of.
                                </>
                            )}
                            <br />
                            <br />
                            {isOnMobile ? (
                                <>
                                    Here's why a blockchain-native art medium is
                                    great:
                                </>
                            ) : (
                                <>
                                    If you're new, you might be wondering: How
                                    does a Solana-native art medium help the
                                    Solana Community? Here are the three biggest
                                    ways:
                                </>
                            )}
                            <div className={LandingStyles.AboutListItem}>
                                1. Amazing for Artists
                            </div>
                            Whether you're a NFT newbie, veteran, or just enjoy
                            creating art as a hobby, the Cubed Community gives
                            you an immediate audience for your latest creations!
                            {!isOnMobile && (
                                <>
                                    <br />
                                    <br />
                                    By building a community around an art medium
                                    instead of a specific project or artist,
                                    we're effectively creating the most
                                    accessible space for new/small-time artists!
                                </>
                            )}
                            <div className={LandingStyles.AboutListItem}>
                                2. Amazing for NFT Communities
                            </div>
                            {!isOnMobile && (
                                <>
                                    The communities that form around successful
                                    NFT projects are some of the most magical
                                    spaces on the internet.
                                    <br />
                                    <br />
                                </>
                            )}
                            By participating in Cubed Collections you're able to
                            rep your favorite NFT projects while engaging with
                            the broader Solana NFT ecosystem!
                            <div className={LandingStyles.AboutListItem}>
                                3. Art with Intrinsic Value
                            </div>
                            The process of creating a Cubed Mosaic is
                            cryptographically secured on the Solana blockchain.
                            <br />
                            <br />
                            That means that when you see a Cubed Mosaic, you're
                            also seeing a proof of the time, effort, and capital
                            needed to create the beautiful piece of art!
                            {!isOnMobile && (
                                <>
                                    This proof of investment imbues each mosaic
                                    with intrinsic value.
                                </>
                            )}
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
                            <div className={LandingStyles.AboutListItem}>
                                Phase 1
                            </div>
                            <div className={LandingStyles.SubHeader}>
                                Launch
                            </div>
                            Artists can start creating Cubed Mosaics. The price
                            of a canvas adjusts dynamically itself so that one
                            canvas is purchased per hour on average.
                            <div className={LandingStyles.SubHeader}>
                                Early Artist Cube Airdrop
                            </div>
                            Selected early artists will be airdropped cubes to
                            aid in the creation of their first Cube Mosaics
                            <div className={LandingStyles.AboutListItem}>
                                Phase 2
                            </div>
                            <div className={LandingStyles.SubHeader}>
                                Marketplace Opens
                            </div>
                            Users will be able to buy, sell, and auction their
                            Mosaics on our dedicated Marketplace!
                            <div className={LandingStyles.SubHeader}>
                                Collection Contests
                            </div>
                            Contests will be held for artists to create mosaics
                            for different Cubed Collections. Winners will
                            receive Sol and widespread promos of their art!
                            <div className={LandingStyles.AboutListItem}>
                                Phase 3
                            </div>
                            <div className={LandingStyles.SubHeader}>
                                Cubed DAO
                            </div>
                            The Cubed DAO will to aim unite the Solana NFT
                            ecosystem under a common Solana-native art medium.
                            In order to join the Cubed DAO, members must create
                            a Cubed Portrait of another NFT they own from a
                            different project. The member will then act as a
                            representative of the other project in the Cubed
                            DAO.
                            <div className={LandingStyles.SubHeader}>
                                More Coming Soon...
                            </div>
                            We will constantly be looking for ways to support
                            and enrich this community of artists and Solana
                            holders!
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
                            There are lots of ways to get involved!
                            <LineBreak />
                            First make sure you join our Discord and follow us
                            on Twitter. This is where our community lives :)
                            <LineBreak />
                            If you like making art, then mint a canvas and
                            create a mosaic! (Be sure to share it in
                            Discord/other socials so we all see it!) Not sure
                            what to make? Try contributing to one of our
                            Collections (on our Collections page)!
                            <LineBreak />
                            If you're a collector, you can buy and sell Mosaics
                            like you would with any other NFT!
                        </FaqItem>
                        <FaqItem question="What are Collections?">
                            A Collection is a group of images that we want to
                            turn into Cubed Mosaics :) When you contribute to a
                            collection, your Mosaic will be featured on our
                            Collections Page!
                            <LineBreak />
                            One of our major goals is to complete each
                            Collection we've listed, and we want your help!!
                        </FaqItem>
                        <FaqItem question="How do I get my Mosaic featured in the Marketplace?">
                            Just DM on twitter us with your latest mosaic!
                            <LineBreak />
                            We feature Mosaics that either make important
                            contributions to Collections or are just
                            unreasonably cool
                        </FaqItem>
                        <FaqItem question="Is Cubed the secret to happiness?">
                            After carefully studying the holy books of the
                            world, we've reached a conclusion: yes, yes it is :)
                        </FaqItem>
                    </div>
                </div>
                {/* Here */}
                <BottomBar />
            </div>
        </div>
    );
};

export default Landing;
