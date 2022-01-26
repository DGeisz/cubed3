import * as THREE from "three";
import {
    cubeRoundedRadius,
    cubeStickerSideLength,
} from "../../../../../global_constants/cube_dimensions";

export function createRoundedPlaneShape(
    width: number,
    height: number,
    radius: number
) {
    let x = -width / 2;
    let y = -height / 2;

    let shape = new THREE.Shape();
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(
        x + width,
        y + height,
        x + width,
        y + height - radius
    );
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    return shape;
}

export function createRoundedPlane(
    width: number,
    height: number,
    radius: number
) {
    return new THREE.ShapeBufferGeometry(
        createRoundedPlaneShape(width, height, radius)
    );
}

export const roundedPlaneShape = createRoundedPlaneShape(
    cubeStickerSideLength,
    cubeStickerSideLength,
    cubeRoundedRadius
);

export const roundedPlaneGeometry = createRoundedPlane(
    cubeStickerSideLength,
    cubeStickerSideLength,
    cubeRoundedRadius
);
