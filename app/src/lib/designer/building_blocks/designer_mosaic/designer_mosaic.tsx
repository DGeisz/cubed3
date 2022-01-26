import React, { useEffect, useMemo, useRef, useState } from "react";
import { fchownSync } from "fs";
import { BooleanKeyframeTrack, Vector3Tuple } from "three";
import {
    BoundingBox,
    StickerColor,
} from "../../../../global_architecture/cube_model/cube_model";
import { drawCubePiece } from "../../../../global_building_blocks/mosaic_tapestry/mosaic_tapestry";
import _ from "underscore";
import useEventListener from "@use-it/event-listener";
import CubePage from "../../../../pages/cube";

/* The unit in this space with be the piece width */
interface Coord {
    x: number;
    y: number;
}

interface DesignerMosaicPiece {
    position: Coord;
    color: StickerColor;
}

class DesignerMosaicCube {
    pieces: DesignerMosaicPiece[];
    position: Coord;

    constructor(position?: Coord) {
        if (position) {
            this.position = position;
        } else {
            this.position = {
                x: 0,
                y: 0,
            };
        }

        const pieces: DesignerMosaicPiece[] = [];

        for (let x of _.range(3)) {
            for (let y of _.range(3)) {
                pieces.push({
                    position: {
                        x,
                        y,
                    },
                    color: StickerColor.White,
                });
            }
        }

        this.pieces = pieces;
    }
}

interface TapArgs {
    dim?: {
        xDim: number;
        yDim: number;
    };
    oldTap?: DesignerMosaicTapestry;
}

export class DesignerMosaicTapestry {
    cubes: DesignerMosaicCube[];
    xDim: number;
    yDim: number;

    constructor({ dim, oldTap }: TapArgs) {
        if (oldTap) {
            this.cubes = oldTap.cubes;
            this.xDim = oldTap.xDim;
            this.yDim = oldTap.yDim;
        } else {
            if (dim) {
                const { xDim, yDim } = dim;
                this.xDim = xDim;
                this.yDim = yDim;

                const cubes: DesignerMosaicCube[] = [];

                for (let x of _.range(xDim || 0)) {
                    for (let y of _.range(yDim || 0)) {
                        cubes.push(
                            new DesignerMosaicCube({ x: 3 * x, y: 3 * y })
                        );
                    }
                }

                this.cubes = cubes;
            } else {
                this.cubes = [];
                this.xDim = 0;
                this.yDim = 0;
            }
        }
    }

    setAllCubes() {
        const cubes: DesignerMosaicCube[] = [];

        for (let cube of this.cubes) {
            const pieces: DesignerMosaicPiece[] = [];

            for (let piece of cube.pieces) {
                pieces.push({
                    position: piece.position,
                    color: StickerColor.Blue,
                });
            }

            cubes.push({
                pieces,
                position: cube.position,
            });
        }

        this.cubes = cubes;
    }

    getAndSetActiveCubes(
        mouseInCanvas: boolean,
        mouseX: number,
        mouseY: number,
        mouseRadius: number,
        mouseColor: StickerColor,
        mouseDown: boolean
    ): DesignerMosaicCube[] {
        if (mouseInCanvas) {
            const cubes: DesignerMosaicCube[] = [];

            for (let cube of this.cubes) {
                const pieces: DesignerMosaicPiece[] = [];

                for (let piece of cube.pieces) {
                    let color;
                    if (
                        (mouseX - (cube.position.x + piece.position.x) - 0.5) **
                            2 +
                            (mouseY -
                                (cube.position.y + piece.position.y) -
                                0.5) **
                                2 <
                        mouseRadius ** 2
                    ) {
                        color = mouseColor;
                    } else {
                        color = piece.color;
                    }
                    pieces.push({
                        color,
                        position: piece.position,
                    });
                }

                cubes.push({
                    position: cube.position,
                    pieces,
                });
            }

            if (mouseDown) {
                this.cubes = cubes;
            }

            return cubes;
        } else {
            return this.cubes;
        }
    }

    getBoundingBox(): BoundingBox {
        return {
            left: 0,
            right: this.xDim * 3,
            top: 0,
            bottom: this.yDim * 3,
            height: this.yDim * 3,
            width: this.xDim * 3,
        };
    }
}

export function drawDesignerCubeFace(
    context: CanvasRenderingContext2D,
    sideLength: number,
    cube: DesignerMosaicCube,
    xOffset: number,
    yOffset: number
) {
    const pieceSideLength = sideLength / 3;

    for (const piece of cube.pieces) {
        drawCubePiece(
            context,
            pieceSideLength,
            piece.color,
            xOffset + pieceSideLength * piece.position.x,
            yOffset + pieceSideLength * piece.position.y
        );
    }
}

export function drawDesignerTapestry(
    context: CanvasRenderingContext2D,

    tapestry: DesignerMosaicTapestry,
    height: number,
    width: number,

    mouseInCanvas: boolean,
    mouseX: number,
    mouseY: number,
    mouseRadius: number,
    mouseDown: boolean,
    mouseColor: StickerColor,
    separateCubes: boolean,

    xOffset = 0,
    yOffset = 0
) {
    const outerDimProp = height / width;
    const bb = tapestry.getBoundingBox();

    const bbDimProp = bb.height / bb.width;

    let finalHeight;
    let finalWidth;
    let finalSideLength: number;

    if (outerDimProp > bbDimProp) {
        finalWidth = width;
        finalHeight = bbDimProp * finalWidth;

        finalSideLength = finalWidth / (bb.width / 3);
    } else {
        finalHeight = height;
        finalWidth = (1 / bbDimProp) * finalHeight;

        finalSideLength = finalHeight / (bb.height / 3);
    }

    const finalPieceSideLength = finalSideLength / 3;
    const tapXOffset = (width - finalWidth) / 2;
    const tapYOffset = (height - finalHeight) / 2;

    mouseX = (mouseX - tapXOffset) / finalPieceSideLength;
    mouseY = (mouseY - tapYOffset) / finalPieceSideLength;

    for (const c of tapestry.getAndSetActiveCubes(
        mouseInCanvas,
        mouseX,
        mouseY,
        mouseRadius,
        mouseColor,
        mouseDown
    )) {
        drawDesignerCubeFace(
            context,
            finalSideLength * (separateCubes ? 0.8 : 1),
            c,
            xOffset + tapXOffset + c.position.x * finalPieceSideLength,
            yOffset + tapYOffset + c.position.y * finalPieceSideLength
        );
    }
}

interface Props {
    xDim: number;
    yDim: number;
    selectedColor: StickerColor;
    brushRadius: number;
    separateCubes: boolean;
}

const DesignerMosaic: React.FC<Props> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ref = useRef<HTMLDivElement>(null);

    const [height, setHeight] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);

    const [mouseX, setMouseX] = useState<number>(0);
    const [mouseY, setMouseY] = useState<number>(0);

    const [mouseInCanvas, setMouseInCanvas] = useState<boolean>(false);
    const [mouseDown, setMouseDown] = useState<boolean>(false);

    useEventListener("mousedown", () => {
        setMouseDown(true);
    });

    useEventListener("mouseup", () => {
        setMouseDown(false);
    });

    const tapestry = useMemo(
        () => new DesignerMosaicTapestry({ dim: props }),
        [props.xDim, props.yDim]
    );

    useEffect(() => {
        if (canvasRef.current && canvasRef.current.getContext) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            const rect = canvas.getBoundingClientRect();

            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                // const tapestry = new DesignerMosaicTapestry({ dim: props });

                drawDesignerTapestry(
                    context,
                    tapestry,
                    height,
                    width,
                    mouseInCanvas,
                    mouseX - rect.left,
                    mouseY - rect.top,
                    props.brushRadius,
                    mouseDown,
                    props.selectedColor,
                    props.separateCubes,
                    0,
                    0
                );
            }
        }
    }, [
        height,
        width,
        props.xDim,
        props.yDim,
        mouseX,
        mouseY,
        mouseInCanvas,
        props.brushRadius,
        props.separateCubes,
        mouseDown,
    ]);

    const refExists = !!ref.current;

    useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
            setWidth(ref.current.clientWidth);
        }
    }, [refExists]);

    return (
        <div ref={ref} className="relative h-full w-full">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseMove={(e) => {
                    setMouseX(e.clientX);
                    setMouseY(e.clientY);
                }}
                onMouseLeave={() => {
                    setMouseInCanvas(false);
                }}
                onMouseEnter={() => {
                    setMouseInCanvas(true);
                }}
            />
        </div>
    );
};

export default DesignerMosaic;
