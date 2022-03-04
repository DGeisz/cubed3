import { useEffect, useRef, useState } from "react";
import {
    CubeModel,
    CubeTapestryModel,
    faceOrientationToVector,
    StickerColor,
    stickerColorToRegularHex,
} from "../../global_architecture/cube_model/cube_model";
import {
    cubePieceSideLength,
    cubeSideLength,
} from "../../global_constants/cube_dimensions";
import { randomTapestry } from "../../global_utils/tapestry_utils";

export function createRoundedSquare(
    context: CanvasRenderingContext2D,
    sideWidth: number,
    radius: number,
    xOffset: number,
    yOffset: number,
    fillColor: string
) {
    const linePoint = sideWidth - radius;

    context.fillStyle = fillColor;

    context.beginPath();
    context.moveTo(radius + xOffset, yOffset);
    context.lineTo(linePoint + xOffset, yOffset);
    context.quadraticCurveTo(
        sideWidth + xOffset,
        yOffset,
        sideWidth + xOffset,
        radius + yOffset
    );
    context.lineTo(sideWidth + xOffset, linePoint + yOffset);
    context.quadraticCurveTo(
        sideWidth + xOffset,
        sideWidth + yOffset,
        linePoint + xOffset,
        sideWidth + yOffset
    );
    context.lineTo(radius + xOffset, sideWidth + yOffset);
    context.quadraticCurveTo(
        xOffset,
        sideWidth + yOffset,
        xOffset,
        linePoint + yOffset
    );
    context.lineTo(xOffset, radius + yOffset);
    context.quadraticCurveTo(xOffset, yOffset, radius + xOffset, yOffset);
    context.closePath();
    context.fill();
}

export function drawCubePiece(
    context: CanvasRenderingContext2D,
    sideLength: number,
    color: StickerColor,
    xOffset: number,
    yOffset: number
) {
    const pieceRadius = 0.1 * sideLength;
    const stickerLen = 0.8 * sideLength;

    createRoundedSquare(
        context,
        sideLength,
        pieceRadius,
        xOffset,
        yOffset,
        "black"
    );
    createRoundedSquare(
        context,
        stickerLen,
        pieceRadius,
        xOffset + pieceRadius,
        yOffset + pieceRadius,
        stickerColorToRegularHex(color)
    );
}

export function drawCubeFace(
    context: CanvasRenderingContext2D,
    sideLength: number,
    cube: CubeModel,
    xOffset: number,
    yOffset: number
) {
    const pieceSideLen = sideLength / 3;
    /* Get pieces */
    const pieces = cube.getFPieces();

    for (const piece of pieces) {
        const sticker = piece.stickers.find((s) => {
            const sVec = faceOrientationToVector(s.baseOrientation);
            sVec.applyQuaternion(piece.lastFixedQuaternion);

            return sVec.z > 0.001;
        });

        if (sticker) {
            drawCubePiece(
                context,
                pieceSideLen,
                sticker.color,
                xOffset +
                    pieceSideLen +
                    pieceSideLen * (piece.position.x / cubePieceSideLength),
                yOffset +
                    pieceSideLen +
                    (-piece.position.y / cubePieceSideLength) * pieceSideLen
            );
        }
    }
}

export function drawMosaicTapestry(
    context: CanvasRenderingContext2D,
    tapestry: CubeTapestryModel,
    height: number,
    width: number,
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

        finalSideLength = finalWidth / (bb.width / cubeSideLength);
    } else {
        finalHeight = height;
        finalWidth = (1 / bbDimProp) * finalHeight;

        finalSideLength = finalHeight / (bb.height / cubeSideLength);
    }

    const tapXOffset = (width - finalWidth) / 2;
    const tapYOffset = (height - finalHeight) / 2;

    for (const c of tapestry.cubes) {
        drawCubeFace(
            context,
            finalSideLength,
            c.cube,
            xOffset +
                tapXOffset +
                ((c.position[0] - cubeSideLength / 2 - bb.left) /
                    cubeSideLength) *
                    finalSideLength,
            yOffset +
                tapYOffset +
                ((bb.top - (c.position[1] + cubeSideLength / 2)) /
                    cubeSideLength) *
                    finalSideLength
        );
    }
}

interface Props {
    tapestry: CubeTapestryModel;
}

const scale = 4;

export const MosaicTapestryV2: React.FC<Props> = (props) => {
    const ref = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [height, setHeight] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);

    const canvasHeight = height * 2;
    const canvasWidth = width * 2;

    useEffect(() => {
        if (canvasRef.current && canvasRef.current.getContext) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);

                drawMosaicTapestry(
                    context,
                    props.tapestry,
                    canvasHeight,
                    canvasWidth
                );
            }
        }
    }, [height, width, props.tapestry]);

    const download = function () {
        if (canvasRef.current) {
            const link = document.createElement("a");
            link.download = "mosaic.png";
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    };
    const refExists = !!ref.current;

    useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
            setWidth(ref.current.clientWidth);
        }
    });

    return (
        <div ref={ref} className="relative h-full w-full">
            <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                style={{ width, height }}
            />
        </div>
    );
};
