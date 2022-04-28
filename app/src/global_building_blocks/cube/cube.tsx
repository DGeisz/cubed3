import * as THREE from "three";
import { GroupProps, useFrame } from "@react-three/fiber";
import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import {
    blankFocusedSticker,
    CubeModel,
    CubeModelPiece,
    CubeSyntaxTurn,
    faceOrientationToVector,
    FocusedSticker,
    getDirectionAndPiecesFromSyntaxTurn,
} from "../../global_architecture/cube_model/cube_model";
import { standardMaterialGenerator } from "../../global_three/materials/metalic_material";
import CubePiece from "./building_blocks/piece/piece";
import _ from "underscore";
import { ContactShadows } from "@react-three/drei";
import {
    useNewCubeInfo,
    useStudioState,
} from "../../lib/studio/service_providers/studio_state_provider/studio_state_provider";
import { invertTurn } from "../../global_architecture/cube_model/utils/utils";
import useEventListener from "@use-it/event-listener";

const x = new THREE.Vector3(1, 0, 0);
const negX = new THREE.Vector3(-1, 0, 0);
const y = new THREE.Vector3(0, 1, 0);
const negY = new THREE.Vector3(0, -1, 0);
const z = new THREE.Vector3(0, 0, 1);
const negZ = new THREE.Vector3(0, 0, -1);

const initialCameraDirection = new THREE.Vector3(0, 0, 1);

enum StickerSelectionState {
    Ready,
    SourceSelected,
}

export const CubeEditor: React.FC = (props) => {
    const { turnPeriod } = useStudioState();

    const cubeModel = useMemo(() => new CubeModel(), []);
    const [_time, setTime] = useState<number>(0);
    const [initialTurnTime, setInitTurnTime] = useState<number>(0);

    const cameraPosition = useRef<THREE.Vector3>(new THREE.Vector3());
    const cameraDirection = useRef<THREE.Vector3>(new THREE.Vector3());

    const stickerSelectionState = useRef<StickerSelectionState>(
        StickerSelectionState.Ready
    );

    const [turnQueue, setTurnQueue] = useState<CubeSyntaxTurn[]>([]);
    const queueLength = useRef<number>(0);
    queueLength.current = turnQueue.length;

    const { setHandleUndo, setNewCubeAlgo } = useNewCubeInfo();

    const [hoveredSticker, setHoveredSticker] =
        useState<FocusedSticker>(blankFocusedSticker);
    const [sourceSticker, setSourceSticker] =
        useState<FocusedSticker>(blankFocusedSticker);

    const shiftDown = useRef<boolean>(false);

    const resetSelector = () => {
        setSourceSticker(blankFocusedSticker);
        stickerSelectionState.current = StickerSelectionState.Ready;
    };

    const setTurn = (turn: CubeSyntaxTurn) => {
        setTurnQueue((lastQueue) => {
            const newQueue = [...lastQueue];
            newQueue.push(turn);
            return newQueue;
        });
    };
    const resetAnimation = () => {
        setTime((lastTime) => {
            setInitTurnTime(lastTime);

            return lastTime;
        });
    };

    useEffect(() => {
        setHandleUndo(() => {
            if (cubeModel.algorithm.length > 0 && queueLength.current === 0) {
                const lastTurn =
                    cubeModel.algorithm[cubeModel.algorithm.length - 1];

                const inverted = invertTurn(lastTurn);

                resetAnimation();
                setTurn(inverted);
            }
        });
    }, []);

    const turn = turnQueue[0];

    useEventListener("keyup", (e: KeyboardEvent) => {
        if (e.key === "Shift") {
            shiftDown.current = false;
            return;
        }
    });

    useEventListener("keydown", (e: KeyboardEvent) => {
        console.log("this is key", e.key);

        if (queueLength.current <= 0) {
            resetAnimation();
        }

        if (e.key === "Escape") {
            resetSelector();
            return;
        }

        if (e.key === "Shift") {
            shiftDown.current = true;
            return;
        }

        if (e.ctrlKey) {
            switch (e.key) {
                case "u": {
                    setTurn(CubeSyntaxTurn.y);
                    break;
                }
                case "r": {
                    setTurn(CubeSyntaxTurn.yp);
                    break;
                }
                case "j": {
                    setTurn(CubeSyntaxTurn.x);
                    break;
                }
                case "f": {
                    setTurn(CubeSyntaxTurn.xp);
                    break;
                }
                case "k": {
                    setTurn(CubeSyntaxTurn.zp);
                    break;
                }
                case "i": {
                    setTurn(CubeSyntaxTurn.z);
                    break;
                }
                case "d": {
                    setTurn(CubeSyntaxTurn.zp);
                    break;
                }
                case "e": {
                    setTurn(CubeSyntaxTurn.z);
                    break;
                }
                case "7": {
                    setTurn(CubeSyntaxTurn.xp);
                    break;
                }
                case "4": {
                    setTurn(CubeSyntaxTurn.x);
                    break;
                }
                case "l": {
                    setTurn(CubeSyntaxTurn.z);
                    break;
                }
                case "s": {
                    setTurn(CubeSyntaxTurn.zp);
                    break;
                }
            }
        } else if (e.shiftKey) {
            switch (e.key.toLowerCase()) {
                case "u": {
                    setTurn(CubeSyntaxTurn.u);
                    break;
                }
                case "r": {
                    setTurn(CubeSyntaxTurn.up);
                    break;
                }
                case "j": {
                    setTurn(CubeSyntaxTurn.f);
                    break;
                }
                case "f": {
                    setTurn(CubeSyntaxTurn.fp);
                    break;
                }
                case "k": {
                    setTurn(CubeSyntaxTurn.rp);
                    break;
                }
                case "i": {
                    setTurn(CubeSyntaxTurn.r);
                    break;
                }
                case "d": {
                    setTurn(CubeSyntaxTurn.l);
                    break;
                }
                case "e": {
                    setTurn(CubeSyntaxTurn.lp);
                    break;
                }
                case "&": {
                    setTurn(CubeSyntaxTurn.b);
                    break;
                }
                case "$": {
                    setTurn(CubeSyntaxTurn.bp);
                    break;
                }
                case "l": {
                    setTurn(CubeSyntaxTurn.dp);
                    break;
                }
                case "s": {
                    setTurn(CubeSyntaxTurn.d);
                    break;
                }
                case "x": {
                    setTurn(CubeSyntaxTurn.xp);
                    break;
                }
                case "y": {
                    setTurn(CubeSyntaxTurn.yp);
                    break;
                }
                case "z": {
                    setTurn(CubeSyntaxTurn.zp);
                    break;
                }
            }
        } else {
            switch (e.key) {
                case "u": {
                    setTurn(CubeSyntaxTurn.U);
                    break;
                }
                case "r": {
                    setTurn(CubeSyntaxTurn.UP);
                    break;
                }
                case "j": {
                    setTurn(CubeSyntaxTurn.F);
                    break;
                }
                case "f": {
                    setTurn(CubeSyntaxTurn.FP);
                    break;
                }
                case "k": {
                    setTurn(CubeSyntaxTurn.RP);
                    break;
                }
                case "i": {
                    setTurn(CubeSyntaxTurn.R);
                    break;
                }
                case "d": {
                    setTurn(CubeSyntaxTurn.L);
                    break;
                }
                case "e": {
                    setTurn(CubeSyntaxTurn.LP);
                    break;
                }
                case "7": {
                    setTurn(CubeSyntaxTurn.B);
                    break;
                }
                case "4": {
                    setTurn(CubeSyntaxTurn.BP);
                    break;
                }
                case "l": {
                    setTurn(CubeSyntaxTurn.DP);
                    break;
                }
                case "s": {
                    setTurn(CubeSyntaxTurn.D);
                    break;
                }
                case "x": {
                    setTurn(CubeSyntaxTurn.x);
                    break;
                }
                case "y": {
                    setTurn(CubeSyntaxTurn.y);
                    break;
                }
                case "z": {
                    setTurn(CubeSyntaxTurn.z);
                    break;
                }
            }
        }
    });

    function handleCubeSyntaxTurn(
        turn: CubeSyntaxTurn,
        turnElapsedTime: number
    ) {
        const { direction, pieces } = getDirectionAndPiecesFromSyntaxTurn(
            cubeModel,
            turn
        );

        if (turnElapsedTime < turnPeriod) {
            const angle = (Math.PI / 2) * (turnElapsedTime / turnPeriod);
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(direction, angle);

            pieces.forEach((piece) => {
                piece.position.copy(piece.lastFixedPosition);
                piece.position.applyQuaternion(q);

                piece.quaternion.copy(piece.lastFixedQuaternion);
                piece.quaternion.premultiply(q);
            });
        } else {
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(direction, Math.PI / 2);

            cubeModel.applyCubeTurn(turn);
            setNewCubeAlgo(cubeModel.algorithm);

            if (turnQueue.length > 0) {
                setTime((lastTime) => {
                    setInitTurnTime(lastTime);

                    return lastTime;
                });

                setTurnQueue((queue) => {
                    const newQueue = [...queue];
                    newQueue.shift();

                    return newQueue;
                });
            }
        }
    }

    useFrame(({ clock, camera }) => {
        setTime(clock.elapsedTime);
        const turnElapsedTime = clock.elapsedTime - initialTurnTime;

        cameraPosition.current.copy(camera.position);
        cameraDirection.current.copy(initialCameraDirection);
        cameraDirection.current.applyEuler(camera.rotation);

        if (typeof turn !== "undefined") {
            handleCubeSyntaxTurn(turn, turnElapsedTime);
        }
    });

    useEffect(() => {
        if (hoveredSticker.pieceIndex >= 0) {
            const timeout = setTimeout(() => {
                setHoveredSticker(blankFocusedSticker);
            }, 1000);

            return () => {
                clearTimeout(timeout);
            };
        }
    }, [hoveredSticker.pieceIndex]);

    const selectProperSticker = (
        sticker: FocusedSticker,
        setSticker: (sticker: FocusedSticker) => void
    ) => {
        const nextPiece = cubeModel.pieces[sticker.pieceIndex];

        if (nextPiece) {
            const stickerDirection = faceOrientationToVector(
                sticker.orientation
            );
            stickerDirection.applyQuaternion(nextPiece.quaternion);

            if (stickerDirection.dot(cameraDirection.current) > 0) {
                setSticker(sticker);
            }
        }
    };

    const setSelectedSticker = (sticker: FocusedSticker) => {
        if (stickerSelectionState.current === StickerSelectionState.Ready) {
            selectProperSticker(sticker, (sticker: FocusedSticker) => {
                setSourceSticker(sticker);
                stickerSelectionState.current =
                    StickerSelectionState.SourceSelected;
            });
        } else if (
            stickerSelectionState.current ===
            StickerSelectionState.SourceSelected
        ) {
            if (!_.isEqual(sourceSticker, sticker)) {
                selectProperSticker(sticker, (sticker: FocusedSticker) => {
                    let seq;

                    if (shiftDown.current) {
                        seq = cubeModel.getFaceTransformationSeq(
                            sourceSticker,
                            sticker
                        );
                    } else {
                        seq = cubeModel.getStickerTransformationSeq(
                            sourceSticker,
                            sticker
                        );
                    }

                    // const seq = cubeModel.getStickerTransformationSeq(
                    //     sourceSticker,
                    //     sticker
                    // );

                    resetAnimation();
                    setTurnQueue(seq);

                    resetSelector();
                });
            }
        }
    };

    return (
        <>
            <ContactShadows
                position={[0, -4, 0]}
                opacity={0.4}
                width={10}
                height={10}
                blur={2}
                far={20}
            />
            <group {...props}>
                {cubeModel.pieces.map((piece, i) => {
                    const euler = new THREE.Euler();
                    euler.setFromQuaternion(piece.quaternion);

                    const eA = euler.toArray();
                    const infDelta =
                        cameraPosition.current.distanceTo(piece.position) *
                        0.001;

                    return (
                        <CubePiece
                            key={`cube:${i}`}
                            pieceIndex={i}
                            infDelta={infDelta}
                            stickers={piece.stickers}
                            position={piece.position.toArray()}
                            rotation={[eA[0], eA[1], eA[2]]}
                            materialGenerator={standardMaterialGenerator}
                            hoveredSticker={hoveredSticker}
                            setHoveredSticker={(sticker: FocusedSticker) =>
                                selectProperSticker(sticker, setHoveredSticker)
                            }
                            sourceSticker={sourceSticker}
                            setSelectedSticker={setSelectedSticker}
                        />
                    );
                })}
            </group>
        </>
    );
};

interface FixedCubeProps extends GroupProps {
    cubeModel: CubeModel;
    distanceToViewer: number;
    index?: number;
    opacity?: number;
}

export const FixedCube: React.FC<FixedCubeProps> = (props) => {
    return (
        <group {...props}>
            {props.cubeModel.pieces.map((piece, i) => {
                const euler = new THREE.Euler();
                euler.setFromQuaternion(piece.quaternion);

                const eA = euler.toArray();
                const infDelta = props.distanceToViewer * 0.001;

                return (
                    <CubePiece
                        key={`cube:${i}`}
                        pieceIndex={i}
                        infDelta={infDelta}
                        stickers={piece.stickers}
                        position={piece.position.toArray()}
                        rotation={[eA[0], eA[1], eA[2]]}
                        materialGenerator={standardMaterialGenerator}
                        opacity={props.opacity}
                    />
                );
            })}
        </group>
    );
};
