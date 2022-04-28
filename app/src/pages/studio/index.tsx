import { NextPage } from "next";
import clsx from "clsx";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { axiosPost, BASE_URL } from "../../global_networking/constants";
import axios from "axios";
import {
    ServerCanvas,
    serverCanvasToTapestry,
} from "../../global_architecture/cube_model/cube_model";
import CubeBackground from "../../global_building_blocks/cube_background/cube_background";
import TopBar from "../../global_building_blocks/top_bar/top_bar";
import { CUBE_PRICE } from "../../global_chain/chain_constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useFetch } from "../../global_api/queries";
import GalleryItem from "../../lib/gallery/building_blocks/gallery_item/gallery_item";
import { LandingStyles } from "../../lib/landing_styles";
import { StudioStyles } from "../../lib/studio/studio_styles";

enum CanvasType {
    Created,
    Owned,
}

const StudioLaunch: NextPage = () => {
    const wallet = useWallet();

    const [canvasType, setCanvasType] = useState<CanvasType>(
        CanvasType.Created
    );

    const {
        data: canvases,
        loading,
        error,
    } = useFetch<ServerCanvas[]>(async () => {
        if (wallet.publicKey) {
            let opts = {};

            if (canvasType === CanvasType.Owned) {
                opts = {
                    owner: wallet.publicKey,
                };
            } else if (canvasType === CanvasType.Created) {
                opts = {
                    artist: wallet.publicKey,
                };
            }

            return (await axiosPost("query_canvases", opts)).data;
        } else {
            return [];
        }
    }, [wallet.publicKey?.toString(), canvasType]);

    return (
        <div className="relative">
            <CubeBackground />
            <div className="relative flex flex-col h-full w-full ">
                <TopBar />
                <div className="m-8">
                    {wallet?.publicKey ? (
                        <>
                            <div className="flex justify-center items-center">
                                <div
                                    className={clsx(
                                        "sm:rounded-lg",
                                        "bg-slate-800/80",
                                        "text-center",
                                        "backdrop-blur-md",
                                        "shadow-md",
                                        "flex flex-col",
                                        "px-16 py-8",
                                        "mb-8"
                                    )}
                                >
                                    <div className="flex flex-row">
                                        <div
                                            className={
                                                canvasType ===
                                                CanvasType.Created
                                                    ? StudioStyles.studioOptionActive
                                                    : StudioStyles.studioOptionInactive
                                            }
                                            onClick={() =>
                                                setCanvasType(
                                                    CanvasType.Created
                                                )
                                            }
                                        >
                                            Your Creations
                                        </div>
                                        <div
                                            className={
                                                canvasType === CanvasType.Owned
                                                    ? StudioStyles.studioOptionActive
                                                    : StudioStyles.studioOptionInactive
                                            }
                                            onClick={() =>
                                                setCanvasType(CanvasType.Owned)
                                            }
                                        >
                                            Mosaics you Own
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {canvases && canvases.length > 0 ? (
                                <div className="flex flex-wrap justify-start items-start">
                                    {canvases.map((c, i) => {
                                        return (
                                            <GalleryItem
                                                serverCanvas={c}
                                                key={i}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex justify-center items-center">
                                    <div
                                        className={clsx(
                                            "sm:rounded-lg",
                                            "bg-slate-800/80",
                                            "text-center",
                                            "backdrop-blur-md",
                                            "shadow-md",
                                            "flex flex-col",
                                            "px-16 py-8",
                                            "mt-8"
                                        )}
                                    >
                                        <div className="text-center text-2xl font-semibold text-white ">
                                            {loading
                                                ? "Loading..."
                                                : canvasType ===
                                                  CanvasType.Created
                                                ? "You haven't created any mosaics yet"
                                                : "You don't own any mosaics"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex justify-center items-center">
                            <div
                                className={clsx(
                                    "text-2xl font-bold text-white",
                                    "sm:rounded-lg",
                                    "bg-slate-800/80",
                                    "text-center",
                                    "backdrop-blur-md",
                                    "shadow-md",
                                    "flex flex-col",
                                    "px-16 py-8",
                                    "mb-16"
                                )}
                            >
                                Connect to your wallet to see your Mosaics!
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudioLaunch;
