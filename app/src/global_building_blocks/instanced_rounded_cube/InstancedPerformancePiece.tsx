import * as THREE from "three";
import * as React from "react";
import { Shape, Vector3Tuple } from "three";
import {
    StickerColor,
    stickerColorToHex,
} from "../../global_architecture/cube_model/cube_model";

const eps = 0.00001;

function createShape(width: number, height: number, radius0: number) {
    const shape = new Shape();
    const radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(
        width - radius * 2,
        height - radius * 2,
        eps,
        Math.PI / 2,
        0,
        true
    );
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    return shape;
}

interface InstancedRoundedCubeProps {
    args?: Vector3Tuple;
    smoothness?: number;
    count: number;
}

const shape = createShape(1, 1, 0.05);

const box = new THREE.BoxBufferGeometry(1, 1, 1);
const genMaterial = (sticker: StickerColor) =>
    new THREE.MeshStandardMaterial({
        color: stickerColorToHex(sticker),
        side: THREE.DoubleSide,
        transparent: true,
    });

const materials = [
    genMaterial(StickerColor.Red),
    genMaterial(StickerColor.Orange),
    genMaterial(StickerColor.White),
    genMaterial(StickerColor.Yellow),
    genMaterial(StickerColor.Green),
    genMaterial(StickerColor.Blue),
];

export const InstancedPerformancePiece = React.forwardRef<
    any,
    InstancedRoundedCubeProps
>(function RoundedBox(
    { args: [width = 1, height = 1, depth = 1] = [], children, count, ...rest },
    ref
) {
    return <instancedMesh ref={ref} args={[box, materials, count]} />;
});
