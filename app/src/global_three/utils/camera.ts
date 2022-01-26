export const getFOVHeightWidthTan = (camera: any) => {
    const vFOV = (camera.fov * Math.PI) / 180;
    const tan = Math.tan(vFOV / 2);

    return [tan, tan * camera.aspect];
};

export const visibleHeightAtDistance = (depth: number, camera: any) => {
    const vFOV = (camera.fov * Math.PI) / 180;
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};

export const visibleWidthAtDistance = (depth: number, camera: any) => {
    const height = visibleHeightAtDistance(depth, camera);
    return height * camera.aspect;
};
