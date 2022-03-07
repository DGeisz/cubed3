import clsx from "clsx";
import Link from "next/link";
import React from "react";
import { CubeTapestryModel } from "../../../../global_architecture/cube_model/cube_model";
import { MosaicTapestryV2 } from "../../../../global_building_blocks/mosaic_tapestry/mosaic_tapestry";
import { numberWithCommas } from "../../../../global_utils/number_utils";
import { LandingStyles } from "../../../landing_styles";
import { MosaicTapestry } from "../mosaic_tapestry/mosaic_tapestry";
import { GalleryItemStyles } from "./gallery_item_styles";

const MAX_ARTIST_LEN = 20;

export enum GalleryItemMessage {
    IntrinsicValue,
    LastBid,
    Price,
}

export function galleryMessageToString(message: GalleryItemMessage): string {
    switch (message) {
        case GalleryItemMessage.IntrinsicValue: {
            return "Intrinsic Value";
        }
        case GalleryItemMessage.LastBid: {
            return "Last Bid";
        }
        case GalleryItemMessage.Price: {
            return "Price";
        }
    }
}

interface Props {
    tapestry: CubeTapestryModel;
    time: number;
    artist: string;
    message: GalleryItemMessage;
    sol: number;
}

const GalleryItem: React.FC<Props> = (props) => {
    return (
        <div className="flex justify-center items-center flex-1 m-4">
            <div className="p-4  shadow-md bg-slate-200/80 rounded">
                <div className="bg-slate-100/100 p-4 rounded">
                    <div className="flex justify-center">
                        <div className="h-[256px] w-[256px] mb-4 ">
                            {props.tapestry.cubes.length > 0 ? (
                                <MosaicTapestryV2 tapestry={props.tapestry} />
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
                                "truncate",
                                "mb-4",
                                GalleryItemStyles.ContentText
                            )}
                        >
                            {props.artist.length > MAX_ARTIST_LEN
                                ? props.artist.substring(0, MAX_ARTIST_LEN) +
                                  "..."
                                : props.artist}
                        </div>
                        <div className={GalleryItemStyles.TitleHeader}>
                            {galleryMessageToString(props.message)}
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
                            {numberWithCommas(props.sol)}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center mt-4">
                    <Link href={`/studio/${props.time}`}>
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
