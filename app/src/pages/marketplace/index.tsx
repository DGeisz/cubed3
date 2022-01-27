import { NextPage } from "next";
import React from "react";
import _ from "underscore";
import {
    CanvasCube,
    CubeModel,
} from "../../global_architecture/cube_model/cube_model";
import CubeBackground from "../../global_building_blocks/cube_background/cube_background";
import TopBar from "../../global_building_blocks/top_bar/top_bar";
import { cubeSideLength } from "../../global_constants/cube_dimensions";
import { randomTapestry } from "../../global_utils/tapestry_utils";
import GalleryItem, {
    GalleryItemMessage,
} from "../../lib/gallery/building_blocks/gallery_item/gallery_item";

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
    return (
        <div className="relative">
            <CubeBackground />
            <div className="relative flex flex-col h-full w-full ">
                <TopBar />
                <div className="m-8">
                    <div className="flex flex-wrap justify-start items-start">
                        {_.range(10).map((_c, i) => (
                            <GalleryItem
                                key={i}
                                tapestry={randomTapestry(xDim, yDim)}
                                artist="CubedTheSon.sol"
                                message={GalleryItemMessage.IntrinsicValue}
                                sol={4}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gallery;
