import React, { useMemo } from "react";
import {
    roundedPlaneGeometry,
    roundedPlaneShape,
} from "../cube/building_blocks/piece/geometry/rounded_plane";
import * as THREE from "three";
import _ from "underscore";

interface InstancedStickerProps {
    count: number;
    colors: number[][];
}

const tempColor = new THREE.Color();

export const InstancedSticker = React.forwardRef<any, InstancedStickerProps>(
    function InstancedSticker(props, ref) {
        const colorArray = useMemo(
            () =>
                Float32Array.from(
                    _.flatten(props.colors)
                    // _.range(props.count).flatMap((_, i) =>
                    //     tempColor.set("red").toArray()
                    // )
                ),
            [props.colors.length]
        );

        return (
            <instancedMesh
                ref={ref}
                args={[roundedPlaneGeometry, undefined, props.count]}
            >
                <shapeBufferGeometry args={[roundedPlaneShape]}>
                    <instancedBufferAttribute
                        attachObject={["attributes", "color"]}
                        args={[colorArray, 3]}
                    />
                </shapeBufferGeometry>
                <meshLambertMaterial
                    attach="material"
                    /* @ts-ignore */
                    vertexColors={THREE.VertexColors}
                    side={THREE.DoubleSide}
                />
            </instancedMesh>
        );
    }
);
