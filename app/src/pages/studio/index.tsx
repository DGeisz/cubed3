import { NextPage } from "next";
import clsx from "clsx";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../global_networking/constants";
import axios from "axios";
import {
    ServerCanvas,
    serverCanvasToTapestry,
} from "../../global_architecture/cube_model/cube_model";
import GalleryItem, {
    GalleryItemMessage,
} from "../../lib/gallery/building_blocks/gallery_item/gallery_item";

const StudioLaunch: NextPage = () => {
    const wallet = useWallet();

    const [canvases, setCanvases] = useState<ServerCanvas[]>([]);

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
    }, [wallet.publicKey?.toString()]);

    return (
        <div className={clsx("h-full w-screen  p-8")}>
            <div className={clsx("flex flex-row flex-wrap")}>Hey there!!</div>
            {canvases.map((c, i) => {
                return (
                    <GalleryItem
                        key={i}
                        tapestry={serverCanvasToTapestry(c)}
                        artist="CubedTheSon.sol"
                        message={GalleryItemMessage.IntrinsicValue}
                        sol={4}
                    />
                );
            })}
        </div>
    );
};

export default StudioLaunch;
