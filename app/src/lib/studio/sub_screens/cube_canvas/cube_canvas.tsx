import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useEventListener from "@use-it/event-listener";
import { Vector3Tuple } from "three";
import {
    CubeModel,
    CubeSyntaxTurn,
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
import { ContactShadows } from "@react-three/drei";

interface Props {
    tapestry: CubeTapestryModel;
    newCubeAlgo?: CubeSyntaxTurn[];
    setNewCube: (position: Vector3Tuple) => void;
}

const CubeCanvas: React.FC<Props> = (props) => {
    const cameraPosition = useRef<Vector3Tuple>([0, 0, 0]);
    const currentCubePosition = useRef<Vector3Tuple>([0, 0, 0]);

    const forceUpdate = useForceRerender();

    const cubeModel = useMemo(() => {
        const model = new CubeModel();
        model.applyAlgoTurns(props.newCubeAlgo || []);

        return model;
    }, [props.newCubeAlgo]);

    useEventListener("mousedown", (e: MouseEvent) => {
        if (e.shiftKey) {
            props.setNewCube(currentCubePosition.current);
        }
    });

    useFrame(({ camera, mouse }) => {
        forceUpdate();
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

        if (
            !props.tapestry.cubes.some((c) => _.isEqual(c.position, cubeArray))
        ) {
            currentCubePosition.current = cubeArray;
        }
    });

    if (props.tapestry.cubes.length > 0 || props.newCubeAlgo) {
        return (
            <>
                <group>
                    <CubeTapestry tapestry={props.tapestry} />
                    {props.newCubeAlgo && (
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
                </group>
            </>
        );
    } else {
        return <EmptyCanvasText />;
    }
};

export default CubeCanvas;
