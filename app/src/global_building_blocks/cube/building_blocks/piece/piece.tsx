import React, { Ref, useState } from "react";
import { RoundedBox } from "@react-three/drei";
import {
    cubeRoundedRadius,
    cubePieceSideLength,
    stickerInfDelta,
} from "../../../../global_constants/cube_dimensions";
import { GroupProps } from "@react-three/fiber";
import { roundedPlaneGeometry } from "./geometry/rounded_plane";
import {
    FaceOrientation,
    FocusedSticker,
    Sticker,
    StickerColor,
} from "../../../../global_architecture/cube_model/cube_model";
import { MeshStandardMaterialParameters } from "three";

export interface CubePieceProps extends GroupProps {
    pieceIndex: number;
    setHoveredSticker?: (sticker: FocusedSticker) => void;
    hoveredSticker?: FocusedSticker;
    setSelectedSticker?: (sticker: FocusedSticker) => void;
    targetSticker?: FocusedSticker;
    sourceSticker?: FocusedSticker;
    materialGenerator: (
        color: StickerColor,
        opts?: MeshStandardMaterialParameters
    ) => THREE.Material;
    infDelta?: number;
    stickers: Sticker[];
    opacity?: number;
}

type VecProp = [number, number, number];

const CubePiece: React.FC<CubePieceProps> = (props) => {
    const infDelta = props.infDelta || stickerInfDelta;

    return (
        <group {...props}>
            <RoundedBox
                args={[
                    cubePieceSideLength,
                    cubePieceSideLength,
                    cubePieceSideLength,
                ]}
                radius={cubeRoundedRadius}
                smoothness={4}
            >
                <meshStandardMaterial
                    color="black"
                    opacity={props.opacity}
                    transparent
                />
            </RoundedBox>
            {props.stickers.map((sticker, i) => {
                const { targetSticker, hoveredSticker, sourceSticker } = props;

                const isTarget =
                    targetSticker &&
                    targetSticker.pieceIndex === props.pieceIndex &&
                    targetSticker.orientation === sticker.baseOrientation;
                const isHovered =
                    hoveredSticker &&
                    hoveredSticker.pieceIndex === props.pieceIndex &&
                    hoveredSticker.orientation === sticker.baseOrientation;
                const isSource =
                    sourceSticker &&
                    sourceSticker.pieceIndex === props.pieceIndex &&
                    sourceSticker.orientation === sticker.baseOrientation;

                const material = props.materialGenerator(
                    isTarget
                        ? StickerColor.TargetBlue
                        : isSource
                        ? StickerColor.SourceMint
                        : isHovered
                        ? StickerColor.HoverViolet
                        : sticker.color,
                    props.opacity ? { opacity: props.opacity } : {}
                );

                let position: VecProp = [0, 0, 0];
                let rotation: VecProp = [0, 0, 0];

                switch (sticker.baseOrientation) {
                    case FaceOrientation.U: {
                        position = [0, cubePieceSideLength / 2 + infDelta, 0];
                        rotation = [Math.PI / 2, 0, 0];
                        break;
                    }
                    case FaceOrientation.D: {
                        position = [
                            0,
                            -(cubePieceSideLength / 2 + infDelta),
                            0,
                        ];
                        rotation = [Math.PI / 2, 0, 0];
                        break;
                    }
                    case FaceOrientation.F: {
                        position = [0, 0, cubePieceSideLength / 2 + infDelta];
                        break;
                    }
                    case FaceOrientation.B: {
                        position = [
                            0,
                            0,
                            -(cubePieceSideLength / 2 + infDelta),
                        ];
                        break;
                    }
                    case FaceOrientation.R: {
                        position = [cubePieceSideLength / 2 + infDelta, 0, 0];
                        rotation = [0, Math.PI / 2, 0];
                        break;
                    }
                    case FaceOrientation.L: {
                        position = [
                            -(cubePieceSideLength / 2 + infDelta),
                            0,
                            0,
                        ];
                        rotation = [0, Math.PI / 2, 0];
                        break;
                    }
                }

                return (
                    <mesh
                        key={i}
                        position={position}
                        rotation={rotation}
                        material={material}
                        geometry={roundedPlaneGeometry}
                        onClick={() => {
                            props.setSelectedSticker &&
                                props.setSelectedSticker({
                                    pieceIndex: props.pieceIndex,
                                    orientation: sticker.baseOrientation,
                                });
                        }}
                        onPointerOver={() => {
                            props.setHoveredSticker &&
                                props.setHoveredSticker({
                                    pieceIndex: props.pieceIndex,
                                    orientation: sticker.baseOrientation,
                                });
                        }}
                    />
                );
            })}
        </group>
    );
};

export default CubePiece;
