import { MeshStandardMaterialProps } from "@react-three/fiber";
import * as THREE from "three";
import { MeshStandardMaterialParameters } from "three";
import {
    StickerColor,
    stickerColorToHex,
} from "../../global_architecture/cube_model/cube_model";

const colorCache: { [key: string]: THREE.Material } = {};

function createMetallicMaterial(color: number | string): THREE.Material {
    if (colorCache[color]) {
        return colorCache[color];
    } else {
        const material = new THREE.MeshPhysicalMaterial({
            clearcoat: 0.9,
            metalness: 1,
            roughness: 0.6,
            color,
            normalScale: new THREE.Vector2(0.15, 0.15),
            side: THREE.DoubleSide,
        });

        colorCache[color] = material;

        return material;
    }
}

export function standardMaterialGenerator(
    color: StickerColor,
    opts?: MeshStandardMaterialParameters
): THREE.Material {
    opts = Object.assign(
        {
            color: stickerColorToHex(color),
            side: THREE.DoubleSide,
            transparent: true,
        },
        opts
    );

    return new THREE.MeshStandardMaterial(opts);
}

function stickerColorToColor(color: StickerColor): string {
    return stickerColorToHex(color);
}

export function metallicMaterialGenerator(color: StickerColor) {
    const stringColor = stickerColorToColor(color);

    return createMetallicMaterial(stringColor);
}
