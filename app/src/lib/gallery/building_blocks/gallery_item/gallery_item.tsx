import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import clsx from "clsx";
import Link from "next/link";
import React from "react";
import {
    CubeTapestryModel,
    MarketplaceInfo,
    ServerCanvas,
    serverCanvasToTapestry,
} from "../../../../global_architecture/cube_model/cube_model";
import { MosaicTapestryV2 } from "../../../../global_building_blocks/mosaic_tapestry/mosaic_tapestry";
import { CUBE_PRICE } from "../../../../global_chain/chain_constants";
import { numberWithCommas } from "../../../../global_utils/number_utils";
import { LandingStyles } from "../../../landing_styles";
import { GalleryItemStyles } from "./gallery_item_styles";

const MAX_ARTIST_LEN = 20;

interface Props {
    serverCanvas: ServerCanvas;
}

const GalleryItem: React.FC<Props> = (props) => {
    const tapestry = serverCanvasToTapestry(props.serverCanvas);

    const { artist, time, marketplaceInfo, marketplacePrice } =
        props.serverCanvas;

    const [showFullArtist, setShowFullArtist] = React.useState<boolean>(false);

    let sol;
    let message;

    switch (marketplaceInfo) {
        case MarketplaceInfo.Listing: {
            message = "Price";
            sol = marketplacePrice || 0;

            break;
        }
        case MarketplaceInfo.LastSale: {
            message = "Last Sale";
            sol = marketplacePrice || 0;

            break;
        }
        default: {
            message = "Intrinsic Value";
            const numCubes = props.serverCanvas.finalCubes.reduce(
                (prev, next) => prev + (next.created ? 1 : -1),
                0
            );

            const intrinsicValue =
                (Math.max(numCubes, 16) - 16) * CUBE_PRICE +
                props.serverCanvas.price / LAMPORTS_PER_SOL;

            sol = intrinsicValue;
        }
    }

    return (
        <div className="flex justify-center items-center flex-1 m-4">
            <div className="p-4  shadow-md bg-slate-200/80 rounded">
                <div className="bg-slate-100/100 p-4 rounded">
                    <div className="flex justify-center">
                        <div className="h-[256px] w-[256px] mb-4 ">
                            {tapestry.cubes.length > 0 ? (
                                <MosaicTapestryV2 tapestry={tapestry} />
                            ) : (
                                <div
                                    className={clsx(
                                        "h-full w-full",
                                        "flex justify-center items-center",
                                        "bg-slate-200/40 rounded-md shadow-md"
                                    )}
                                >
                                    <div className="">
                                        <div className="font-bold text-xl text-slate-300">
                                            Empty Canvas
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className={GalleryItemStyles.TitleHeader}>
                            Artist
                        </div>
                        <div
                            className={clsx(
                                "mb-4",
                                !showFullArtist && "cursor-pointer",
                                GalleryItemStyles.ContentText
                            )}
                            onClick={() =>
                                !showFullArtist &&
                                setShowFullArtist(!showFullArtist)
                            }
                        >
                            {showFullArtist
                                ? artist
                                : props.serverCanvas.artist.length >
                                  MAX_ARTIST_LEN
                                ? artist.substring(0, MAX_ARTIST_LEN) + "..."
                                : artist}
                        </div>
                        <div className={GalleryItemStyles.TitleHeader}>
                            {message}
                        </div>
                        <div
                            className={clsx(
                                GalleryItemStyles.ContentText,
                                "mt-1"
                            )}
                        >
                            <span className={clsx(LandingStyles.SolanaText)}>
                                ◎
                            </span>
                            {numberWithCommas(sol)}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center mt-4">
                    <Link href={`/studio/${time}`}>
                        <a className={GalleryItemStyles.ViewButton}>
                            View in Studio
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GalleryItem;
