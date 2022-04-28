import { GroupProps, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
    CubeTapestryModel,
    FaceOrientation,
    StickerColor,
    stickerColorToHex,
} from "../../global_architecture/cube_model/cube_model";
import {
    cubePieceSideLength,
    cubeRoundedRadius,
    stickerInfDelta,
} from "../../global_constants/cube_dimensions";
import { randomTapestry } from "../../global_utils/tapestry_utils";
import {
    CubeTapestryState,
    useStudioState,
} from "../../lib/studio/service_providers/studio_state_provider/studio_state_provider";
import { InstancedPerformancePiece } from "../instanced_rounded_cube/InstancedPerformancePiece";
import { InstancedRoundedCube } from "../instanced_rounded_cube/InstancedRoundedCube";
import { InstancedSticker } from "../instanced_sticker/InstancedSticker";

interface CubeTapestryProps extends GroupProps {
    tapestry: CubeTapestryModel;
    /* Indicates whether the tapestry is dynamically solved */
    dynamicTapestry: boolean;
}

// const tapestry = randomTapestry(8, 8, 10);

const tempPiece = new THREE.Object3D();
const tempSticker = new THREE.Object3D();
const tempPosition = new THREE.Vector3();
const tempRotation = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
const tempColor = new THREE.Color();

const CubeTapestry: React.FC<CubeTapestryProps> = React.forwardRef<
    any,
    CubeTapestryProps
>(function CubeTapestry(props, ref) {
    const stickerRef = useRef<any>();
    const stickerColorsRef = useRef<number[][]>([]);
    const [_, renderIndex] = useState<number>(0);

    const { performanceCubes: usePerformanceCubes } = useStudioState();

    const triggerUpdate = () => renderIndex((i) => i + 1);

    const piecesRef = useRef<any>();
    const performanceCubesRef = useRef<any>();

    const { tapestry } = props;

    const numPieces = 26 * tapestry.cubes.length;
    const numStickers = 54 * tapestry.cubes.length;

    const turnCounterRef = useRef<number>(-1);
    const lastTurnTime = useRef<number>(0);

    const { turnPeriod, tapestryState, setTapestryState } = useStudioState();

    const unSolvedTapestry = useMemo(
        () => tapestry.getIntermediateTapestry(-1, 0, false),
        [tapestry.cubes.length]
    );
    const solvedTapestry = useMemo(
        () => tapestry.getIntermediateTapestry(-1, 0, true),
        [tapestry.cubes.length]
    );

    /* Sketch */
    useFrame(({ camera, clock }) => {
        const stickerColorArray = [];
        let stickerIndex = -1;
        let pieceIndex = -1;

        const now = clock.getElapsedTime();

        let finalTapestry: CubeTapestryModel;

        if (props.dynamicTapestry) {
            if (
                tapestryState === CubeTapestryState.Solving ||
                tapestryState === CubeTapestryState.UnSolving
            ) {
                if (lastTurnTime.current === 0) {
                    lastTurnTime.current = now;
                }

                let newState;
                if (now - lastTurnTime.current >= turnPeriod) {
                    lastTurnTime.current = now;
                    const maxAlgoLength = tapestry.getMaxAlgorithmLength();

                    if (turnCounterRef.current < maxAlgoLength) {
                        turnCounterRef.current++;
                    } else {
                        turnCounterRef.current = -1;
                        lastTurnTime.current = 0;

                        newState =
                            tapestryState === CubeTapestryState.Solving
                                ? CubeTapestryState.Solved
                                : CubeTapestryState.Unsolved;

                        setTapestryState(newState);
                    }

                    console.log(turnCounterRef.current);
                }

                if (newState !== undefined) {
                    if (newState == CubeTapestryState.Solved) {
                        finalTapestry = solvedTapestry;
                    } else {
                        finalTapestry = unSolvedTapestry;
                    }
                } else {
                    finalTapestry = tapestry.getIntermediateTapestry(
                        turnCounterRef.current,
                        (now - lastTurnTime.current) / turnPeriod,
                        tapestryState === CubeTapestryState.UnSolving
                    );
                }
            } else if (tapestryState === CubeTapestryState.Unsolved) {
                finalTapestry = unSolvedTapestry;
            } else {
                finalTapestry = solvedTapestry;
            }
        } else {
            finalTapestry = tapestry;
        }

        for (const { cube, position: basePosition } of finalTapestry.cubes) {
            for (const piece of cube.pieces) {
                pieceIndex++;

                /* Get position of the current position */
                tempPiece.position.fromArray(basePosition);
                tempPiece.rotation.setFromQuaternion(piece.quaternion);
                tempPiece.position.add(piece.position);

                tempPiece.updateMatrix();
                if (piecesRef.current)
                    piecesRef.current.setMatrixAt(pieceIndex, tempPiece.matrix);
                if (performanceCubesRef.current)
                    performanceCubesRef.current.setMatrixAt(
                        pieceIndex,
                        tempPiece.matrix
                    );

                for (const sticker of piece.stickers) {
                    stickerIndex++;

                    const stickerColor = sticker.color as StickerColor;

                    tempSticker.position.copy(tempPiece.position);
                    tempSticker.rotation.set(0, 0, 0);

                    tempColor.set(stickerColorToHex(stickerColor));

                    const infDelta =
                        camera.position.distanceTo(tempSticker.position) *
                        stickerInfDelta;

                    switch (sticker.baseOrientation) {
                        case FaceOrientation.U: {
                            tempPosition.fromArray([
                                0,
                                cubePieceSideLength / 2 + infDelta,
                                0,
                            ]);
                            tempRotation.fromArray([Math.PI / 2, 0, 0]);

                            break;
                        }
                        case FaceOrientation.D: {
                            tempPosition.fromArray([
                                0,
                                -(cubePieceSideLength / 2 + infDelta),
                                0,
                            ]);
                            tempRotation.fromArray([Math.PI / 2, 0, 0]);
                            break;
                        }
                        case FaceOrientation.F: {
                            tempPosition.fromArray([
                                0,
                                0,
                                cubePieceSideLength / 2 + infDelta,
                            ]);
                            tempRotation.fromArray([0, 0, 0]);
                            break;
                        }
                        case FaceOrientation.B: {
                            tempPosition.fromArray([
                                0,
                                0,
                                -(cubePieceSideLength / 2 + infDelta),
                            ]);
                            tempRotation.fromArray([0, 0, 0]);
                            break;
                        }
                        case FaceOrientation.R: {
                            tempPosition.fromArray([
                                cubePieceSideLength / 2 + infDelta,
                                0,
                                0,
                            ]);
                            tempRotation.fromArray([0, Math.PI / 2, 0]);
                            break;
                        }
                        case FaceOrientation.L: {
                            tempPosition.fromArray([
                                -(cubePieceSideLength / 2 + infDelta),
                                0,
                                0,
                            ]);
                            tempRotation.fromArray([0, Math.PI / 2, 0]);
                            break;
                        }
                    }

                    tempPosition.applyQuaternion(piece.quaternion);
                    tempSticker.position.add(tempPosition);

                    tempQuaternion.setFromEuler(tempRotation);
                    tempQuaternion.premultiply(piece.quaternion);

                    tempSticker.rotation.setFromQuaternion(tempQuaternion);
                    tempSticker.updateMatrix();

                    if (stickerRef.current)
                        stickerRef.current?.setMatrixAt(
                            stickerIndex,
                            tempSticker.matrix
                        );
                    stickerColorArray.push(tempColor.toArray());
                }
            }
        }

        if (stickerRef.current)
            stickerRef.current.instanceMatrix.needsUpdate = true;
        if (piecesRef.current)
            piecesRef.current.instanceMatrix.needsUpdate = true;
        if (performanceCubesRef.current)
            performanceCubesRef.current.instanceMatrix.needsUpdate = true;

        let needsUpdate = stickerColorsRef.current.length === 0;
        stickerColorsRef.current = stickerColorArray;

        if (needsUpdate) {
            triggerUpdate();
        }
    });

    return (
        <group ref={ref} {...props}>
            {usePerformanceCubes ? (
                <InstancedPerformancePiece
                    ref={performanceCubesRef}
                    count={numPieces}
                />
            ) : (
                <>
                    <InstancedSticker
                        ref={stickerRef}
                        count={numStickers}
                        colors={stickerColorsRef.current}
                    />
                    <InstancedRoundedCube
                        ref={piecesRef}
                        count={numPieces}
                        radius={cubeRoundedRadius}
                    />
                </>
            )}
        </group>
    );
});

export default CubeTapestry;
