import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEventListener from "@use-it/event-listener";
import { Vector3Tuple } from "three";
import {
    CubeModel,
    CubeTapestryModel,
} from "../../../../global_architecture/cube_model/cube_model";
import { useForceRerender } from "../../../../global_utils/react";
import { cubeSideLength } from "../../../../global_constants/cube_dimensions";
import _ from "underscore";
import CubeTapestry from "../../../../global_building_blocks/cube_tapestry/cube_tapestry";
import { FixedCube } from "../../../../global_building_blocks/cube/cube";
import { euclideanDistance } from "../../../../global_architecture/cube_model/utils/utils";
import { getFOVHeightWidthTan } from "../../../../global_three/utils/camera";
import EmptyCanvasText from "../empty_canvas_text/empty_canvas_text";
import {
    CanvasScreen,
    useCanvasScreenInfo,
    useNewCubeInfo,
    useTapestryInfo,
} from "../../service_providers/studio_state_provider/studio_state_provider";

interface Props {
    loading: boolean;
    canvasTime: number;
}

const CubeCanvas: React.FC<Props> = (props) => {
    const { canvasScreen, setCanvasScreen } = useCanvasScreenInfo();
    const cameraPosition = useRef<Vector3Tuple>([0, 0, 0]);
    const currentCubePosition = useRef<Vector3Tuple>([0, 0, 0]);

    const { tapestry } = useTapestryInfo();
    const { newCubeAlgo, newCubePosition, setNewCubePosition } =
        useNewCubeInfo();

    const forceUpdate = useForceRerender();

    const cubeModel = useMemo(() => {
        const model = new CubeModel();
        model.applyAlgoTurns(newCubeAlgo || []);

        return model;
    }, [newCubeAlgo]);

    useEventListener("mousedown", (e: MouseEvent) => {
        if (e.shiftKey) {
            if (canvasScreen === CanvasScreen.AddCube) {
                setNewCubePosition(currentCubePosition.current);
                setCanvasScreen(CanvasScreen.ConfirmAddCube);
            } else if (canvasScreen === CanvasScreen.RemoveCube) {
                if (
                    tapestry.cubes.some((c) =>
                        _.isEqual(c.position, currentCubePosition.current)
                    )
                ) {
                    setNewCubePosition(currentCubePosition.current);
                    setCanvasScreen(CanvasScreen.ConfirmRemoveCube);
                }
            }
        }
    });

    const [newCubeOpacity, setNewCubeOpacity] = useState<number>();
    const newCubeStartingTime = useRef<number>(0);
    const currTime = useRef<number>(0);

    const showFlashingCube =
        canvasScreen === CanvasScreen.ConfirmAddCube ||
        canvasScreen === CanvasScreen.ConfirmRemoveCube;

    useEffect(() => {
        newCubeStartingTime.current = currTime.current;
    }, [showFlashingCube]);

    useFrame(({ camera, mouse, clock }) => {
        forceUpdate();

        /* Handle cube opacity */
        const time = clock.getElapsedTime();

        currTime.current = time;
        if (showFlashingCube) {
            setNewCubeOpacity(
                Math.cos(
                    ((time - newCubeStartingTime.current) * Math.PI) / 1.4
                ) ** 2
            );
        }

        /* Handle cube placement in tapestry */
        const planeNormal = new THREE.Vector3(0, 0, 1);
        const planeOrigin = new THREE.Vector3(0, 0, 0);
        planeNormal.normalize();

        const cameraDirection = new THREE.Vector3(0, 0, 1);
        const cameraY = new THREE.Vector3(0, 1, 0);
        const cameraX = new THREE.Vector3(1, 0, 0);
        cameraDirection.applyEuler(camera.rotation);
        cameraY.applyEuler(camera.rotation);
        cameraX.applyEuler(camera.rotation);
        cameraPosition.current = camera.position.toArray();

        const [tanHeight, tanWidth] = getFOVHeightWidthTan(camera);
        const mouseVector = new THREE.Vector3(
            -tanWidth * mouse.x,
            -tanHeight * mouse.y,
            1
        );
        mouseVector.normalize();
        mouseVector.applyEuler(camera.rotation);

        const mouseInPlaneFrame = new THREE.Vector3();
        mouseInPlaneFrame.copy(camera.position);
        mouseInPlaneFrame.addScaledVector(planeOrigin, -1);

        const mouseInPlane = new THREE.Vector3();
        mouseInPlane.copy(mouseInPlaneFrame);
        mouseInPlane.projectOnPlane(planeNormal);

        const mouseOrtho = new THREE.Vector3();
        mouseOrtho.copy(mouseInPlaneFrame);
        mouseOrtho.addScaledVector(mouseInPlane, -1);

        const orthoDotNormal = mouseOrtho.dot(planeNormal);
        const directionMultiplier = orthoDotNormal > 0 ? -1 : 1;

        const mouseDistanceToPlane = mouseOrtho.length();
        const mouseDotNormal =
            directionMultiplier * planeNormal.dot(mouseVector);

        const cubePosition = new THREE.Vector3();
        cubePosition.copy(camera.position);

        cubePosition.addScaledVector(
            mouseVector,
            mouseDistanceToPlane / mouseDotNormal
        );

        cubePosition.x =
            Math.floor(cubePosition.x / cubeSideLength + 0.5) * cubeSideLength;
        cubePosition.y =
            Math.floor(cubePosition.y / cubeSideLength + 0.5) * cubeSideLength;

        const cubeArray = cubePosition.toArray();

        if (canvasScreen === CanvasScreen.AddCube) {
            if (!tapestry.cubes.some((c) => _.isEqual(c.position, cubeArray))) {
                currentCubePosition.current = cubeArray;
            }
        } else {
            currentCubePosition.current = cubeArray;
        }
    });

    let finalTap = tapestry;

    if (canvasScreen === CanvasScreen.RemoveCube) {
        const newCubes = [...tapestry.cubes].filter(
            (c) => !_.isEqual(c.position, currentCubePosition.current)
        );

        finalTap = new CubeTapestryModel(newCubes);
    } else if (canvasScreen === CanvasScreen.ConfirmRemoveCube) {
        finalTap = new CubeTapestryModel(
            [...tapestry.cubes].filter(
                (c) => !_.isEqual(c.position, newCubePosition)
            )
        );
    }

    if (
        !props.loading &&
        (tapestry.cubes.length > 0 || canvasScreen !== CanvasScreen.Default)
    ) {
        return (
            <>
                <group>
                    <CubeTapestry tapestry={finalTap} />
                    {canvasScreen === CanvasScreen.AddCube && (
                        <>
                            <FixedCube
                                cubeModel={cubeModel}
                                position={currentCubePosition.current}
                                distanceToViewer={euclideanDistance(
                                    currentCubePosition.current,
                                    cameraPosition.current
                                )}
                            />
                        </>
                    )}
                    {(canvasScreen === CanvasScreen.ConfirmAddCube ||
                        canvasScreen === CanvasScreen.ConfirmRemoveCube) && (
                        <>
                            <FixedCube
                                cubeModel={cubeModel}
                                position={newCubePosition}
                                distanceToViewer={euclideanDistance(
                                    currentCubePosition.current,
                                    cameraPosition.current
                                )}
                                opacity={newCubeOpacity}
                            />
                        </>
                    )}
                </group>
            </>
        );
    } else {
        return <EmptyCanvasText loading={props.loading} />;
    }
};

export default CubeCanvas;
