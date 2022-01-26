import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import _ from "underscore";
import {
    CubeModel,
    CubeSyntaxTurn,
    CubeTapestryModel,
    faceOrientationToVector,
    StickerColor,
    stickerColorToRegularHex,
} from "../../../../global_architecture/cube_model/cube_model";
import {
    cubePieceSideLength,
    cubeSideLength,
} from "../../../../global_constants/cube_dimensions";

interface MosaicPiecePosition {
    left: number;
    top: number;
    sticker: StickerColor;
}

interface MosaicPieceProps {
    sideLength: number;
    mosaicPosition: MosaicPiecePosition;
}

const stickerProportion = 0.75;
const pieceRoundedProportion = 0.1;
const stickerRoundedProportion = 0.06;

const MosaicPiece: React.FC<MosaicPieceProps> = (props) => {
    let stickerSideLen = props.sideLength * stickerProportion;
    const smallMode = props.sideLength - stickerSideLen < 2;

    stickerSideLen = smallMode ? props.sideLength : stickerSideLen;

    const { mosaicPosition } = props;

    const pieceRounded: number = props.sideLength * pieceRoundedProportion;
    const stickerRounded = props.sideLength * stickerRoundedProportion;

    return (
        <div
            className="absolute flex justify-center items-center"
            style={{
                left: mosaicPosition.left,
                top: mosaicPosition.top,
                height: props.sideLength,
                width: props.sideLength,
                backgroundColor: "black",
                borderRadius: pieceRounded > 1 ? pieceRounded : undefined,
            }}
        >
            <div
                style={{
                    height: stickerSideLen,
                    width: stickerSideLen,
                    backgroundColor: stickerColorToRegularHex(
                        mosaicPosition.sticker
                    ),
                    borderRadius:
                        stickerRounded > 1 ? stickerRounded : undefined,
                    // border: smallMode ? "1px solid black" : undefined,
                }}
            />
        </div>
    );
};

interface MosaicCubePosition {
    cube: CubeModel;
    left: number;
    top: number;
}

interface MosaicCubeProps {
    sideLength: number;
    mosaicPosition: MosaicCubePosition;
}

const MosaicCube: React.FC<MosaicCubeProps> = (props) => {
    const pieceSideLen = props.sideLength / 3;

    const pieces: MosaicPiecePosition[] = useMemo(() => {
        const cPieces = props.mosaicPosition.cube.getFPieces();

        const mPieces = cPieces.map((p) => {
            /* Get the sticker that's facing the correct direction */
            const sticker = p.stickers.find((s) => {
                const sVec = faceOrientationToVector(s.baseOrientation);
                sVec.applyQuaternion(p.lastFixedQuaternion);

                return sVec.z > 0.001;
            });

            if (sticker) {
                return {
                    left:
                        (pieceSideLen * p.lastFixedPosition.x) /
                            cubePieceSideLength +
                        props.sideLength / 2 -
                        pieceSideLen / 2,
                    top:
                        (pieceSideLen * p.lastFixedPosition.y) /
                            cubePieceSideLength +
                        props.sideLength / 2 -
                        pieceSideLen / 2,
                    sticker: sticker.color,
                };
            } else {
                return null;
            }
        });

        return mPieces.filter((p) => !!p) as MosaicPiecePosition[];
    }, [props.sideLength]);

    return (
        <div
            className="absolute"
            style={{
                height: props.sideLength,
                width: props.sideLength,
                left: props.mosaicPosition.left,
                top: props.mosaicPosition.top,
            }}
        >
            {pieces.map((p, i) => (
                <MosaicPiece
                    key={i}
                    sideLength={pieceSideLen}
                    mosaicPosition={p}
                />
            ))}
        </div>
    );
};

const cube = new CubeModel();
cube.applyAlgoTurns([CubeSyntaxTurn.x, CubeSyntaxTurn.x]);

interface MosaicTapestryProps {
    tapestry: CubeTapestryModel;
}

export const MosaicTapestry: React.FC<MosaicTapestryProps> = (props) => {
    const ref = useRef<HTMLDivElement>(null);

    const [height, setHeight] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
    const mosaicSideLen = useRef<number>(0.1);

    const cubePositions: MosaicCubePosition[] = useMemo(() => {
        const outerDimProp = height / width;

        const bb = props.tapestry.getBoundingBox();

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

        mosaicSideLen.current = finalSideLength;

        const leftBuffer = (width - finalWidth) / 2;
        const topBuffer = (height - finalHeight) / 2;

        return props.tapestry.cubes.map((c) => {
            return {
                cube: c.cube,
                left:
                    ((c.position[0] - cubeSideLength / 2 - bb.left) /
                        cubeSideLength) *
                        finalSideLength +
                    leftBuffer,
                top:
                    ((bb.top - c.position[1] - cubeSideLength / 2) /
                        cubeSideLength) *
                        finalSideLength +
                    topBuffer,
            };
        });
    }, [height, width]);

    useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
            setWidth(ref.current.clientWidth);
        }
    }, []);

    return (
        <div ref={ref} className="relative h-full w-full">
            {cubePositions.map((p, i) => (
                <MosaicCube
                    key={i}
                    mosaicPosition={p}
                    sideLength={mosaicSideLen.current}
                />
            ))}
        </div>
    );
};
