import * as THREE from "three";

const inf = 0.001;

export function correctEuler(euler: THREE.Euler) {
    const absX = Math.abs(euler.x);

    if (absX < inf) {
        euler.x = 0;
    }
    const absY = Math.abs(euler.y);

    if (absY < inf) {
        euler.y = 0;
    }
    const absZ = Math.abs(euler.z);

    if (absZ < inf) {
        euler.z = 0;
    }
}
