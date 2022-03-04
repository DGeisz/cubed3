import { NextPage } from "next";
import clsx from "clsx";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../../global_networking/constants";
import axios from "axios";
import {
    ServerCanvas,
    serverCanvasToTapestry,
} from "../../global_architecture/cube_model/cube_model";
import GalleryItem, {
    GalleryItemMessage,
} from "../../lib/gallery/building_blocks/gallery_item/gallery_item";
import CubeBackground from "../../global_building_blocks/cube_background/cube_background";
import TopBar from "../../global_building_blocks/top_bar/top_bar";
import { CUBE_PRICE } from "../../global_chain/chain_constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const StudioLaunch: NextPage = () => {
    const wallet = useWallet();

    const [canvases, setCanvases] = useState<ServerCanvas[]>([]);

    const artist = useMemo(
        () => wallet.publicKey?.toString() || "",
        [wallet.publicKey]
    );

    const pubKeyString = wallet.publicKey?.toString();

    useEffect(() => {
        (async () => {
            if (wallet.publicKey) {
                const canvases = await axios.post(
                    `${BASE_URL}/artist_canvases`,
                    {
                        artist: wallet.publicKey.toString(),
                    }
                );

                setCanvases(canvases.data);
            }
        })();
    }, [pubKeyString]);

    return (
        <div className="relative">
            <CubeBackground />
            <div className="relative flex flex-col h-full w-full ">
                <TopBar />
                <div className="m-8">
                    <div className="flex flex-wrap justify-start items-start">
                        {canvases.map((c, i) => {
                            const numCubes = c.finalCubes.reduce(
                                (prev, next) => prev + (next.created ? 1 : -1),
                                0
                            );

                            const intrinsicValue =
                                (Math.max(numCubes, 16) - 16) * CUBE_PRICE +
                                c.price / LAMPORTS_PER_SOL;

                            return (
                                <GalleryItem
                                    key={i}
                                    time={c.time}
                                    tapestry={serverCanvasToTapestry(c)}
                                    artist={artist}
                                    message={GalleryItemMessage.IntrinsicValue}
                                    sol={intrinsicValue}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioLaunch;
