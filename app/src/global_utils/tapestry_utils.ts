import {
    CanvasCube,
    CubeModel,
    CubeTapestryModel,
} from "../global_architecture/cube_model/cube_model";
import _ from "underscore";
import { cubeSideLength } from "../global_constants/cube_dimensions";

export function randomTapestry(
    xDim: number,
    yDim: number,
    turns = 5
): CubeTapestryModel {
    const cubes: CanvasCube[] = [];

    for (const x of _.range(xDim)) {
        for (const y of _.range(yDim)) {
            const cube = new CubeModel();

            _.range(turns).forEach(() => {
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

    return new CubeTapestryModel(cubes);
}
