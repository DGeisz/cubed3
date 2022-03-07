import { GroupProps, useFrame } from "@react-three/fiber";
import React, { useRef, useState } from "react";
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
import { InstancedRoundedCube } from "../instanced_rounded_cube/InstancedRoundedCube";
import { InstancedSticker } from "../instanced_sticker/InstancedSticker";

interface CubeTapestryProps extends GroupProps {
    tapestry: CubeTapestryModel;
}

const basePosition = new THREE.Vector3();
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

    const triggerUpdate = () => renderIndex((i) => i + 1);

    const piecesRef = useRef<any>();

    const numPieces = 26 * props.tapestry.cubes.length;
    const numStickers = 54 * props.tapestry.cubes.length;

    useFrame(({ camera }) => {
        const stickerColorArray = [];
        let stickerIndex = -1;
        let pieceIndex = -1;

        for (const { cube, position: basePosition } of props.tapestry.cubes) {
            for (const piece of cube.pieces) {
                pieceIndex++;
                tempPiece.position.fromArray(basePosition);
                tempPiece.rotation.setFromQuaternion(piece.quaternion);
                tempPiece.position.add(piece.position);

                tempPiece.updateMatrix();
                piecesRef.current.setMatrixAt(pieceIndex, tempPiece.matrix);

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

                    stickerRef.current.setMatrixAt(
                        stickerIndex,
                        tempSticker.matrix
                    );
                    stickerColorArray.push(tempColor.toArray());
                }
            }
        }

        stickerRef.current.instanceMatrix.needsUpdate = true;
        piecesRef.current.instanceMatrix.needsUpdate = true;

        let needsUpdate = stickerColorsRef.current.length === 0;
        stickerColorsRef.current = stickerColorArray;

        if (needsUpdate) {
            triggerUpdate();
        }
    });

    return (
        <group ref={ref} {...props}>
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
        </group>
    );
});

export default CubeTapestry;
