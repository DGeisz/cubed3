import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { NextPage } from "next";
import React, { useMemo } from "react";
import _ from "underscore";
import { useFetch } from "../../global_api/queries";
import {
    CanvasCube,
    CubeModel,
    ServerCanvas,
    serverCanvasToTapestry,
} from "../../global_architecture/cube_model/cube_model";
import CubeBackground from "../../global_building_blocks/cube_background/cube_background";
import TopBar from "../../global_building_blocks/top_bar/top_bar";
import { CUBE_PRICE } from "../../global_chain/chain_constants";
import { cubeSideLength } from "../../global_constants/cube_dimensions";
import { axiosPost } from "../../global_networking/constants";
import { randomTapestry } from "../../global_utils/tapestry_utils";
import GalleryItem from "../../lib/gallery/building_blocks/gallery_item/gallery_item";

const cubes: CanvasCube[] = [];
const xDim = 8;
const yDim = 8;

for (const x of _.range(xDim)) {
    for (const y of _.range(yDim)) {
        const cube = new CubeModel();

        _.range(5).forEach(() => {
            const turn = Math.floor(Math.random() * 30);
            cube.applyCubeTurn(turn);
        });

        cubes.push({
            position: [
                (x - Math.floor(xDim / 2)) * cubeSideLength,
                (y - Math.floor(yDim / 2)) * cubeSideLength,
                0,
            ],
            cube,
        });
    }
}

const Gallery: NextPage = () => {
    const wallet = useWallet();

    const {
        data: canvases,
        loading,
        error,
    } = useFetch<ServerCanvas[]>(async () => {
        if (wallet.publicKey) {
            return (
                await axiosPost("query_canvases", {
                    finished: true,
                })
            ).data;
        } else {
            return [];
        }
    }, [wallet.publicKey?.toString()]);

    const artist = useMemo(
        () => wallet.publicKey?.toString() || "",
        [wallet.publicKey]
    );

    const pubKeyString = wallet.publicKey?.toString();

    return (
        <div className="relative">
            <CubeBackground />
            <div className="relative flex flex-col h-full w-full ">
                <TopBar />
                <div className="m-8">
                    {canvases && (
                        <div className="flex flex-wrap justify-start items-start">
                            {canvases.map((c, i) => {
                                const numCubes = c.finalCubes.reduce(
                                    (prev, next) =>
                                        prev + (next.created ? 1 : -1),
                                    0
                                );

                                const intrinsicValue =
                                    (Math.max(numCubes, 16) - 16) * CUBE_PRICE +
                                    c.price / LAMPORTS_PER_SOL;

                                return <GalleryItem key={i} serverCanvas={c} />;
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
