import * as THREE from "three";
import {
    ContactShadows,
    Environment,
    OrbitControls,
    RoundedBox,
} from "@react-three/drei";
import { Canvas, MeshProps, useFrame } from "@react-three/fiber";
import { NextPage } from "next";
import { Suspense, useMemo, useRef, useState } from "react";
import {
    getFOVHeightWidthTan,
    visibleHeightAtDistance,
    visibleWidthAtDistance,
} from "../../global_three/utils/camera";
import { FixedCube } from "../../global_building_blocks/cube/cube";
import {
    CanvasCube,
    CubeModel,
} from "../../global_architecture/cube_model/cube_model";
import { Vector3Tuple } from "three";
import {
    cubePieceSideLength,
    cubeRoundedRadius,
    cubeSideLength,
} from "../../global_constants/cube_dimensions";
import useEventListener from "@use-it/event-listener";
import _ from "underscore";

function euclideanDistance(vec1: Vector3Tuple, vec2: Vector3Tuple) {
    return Math.sqrt(
        vec1.reduce((prev, next, i) => prev + (next - vec2[i]) ** 2, 0)
    );
}

const cubeModel = new CubeModel();

const positions: Vector3Tuple[] = _.range(200).map((_) => [
    // Math.random() * 300,
    0,
    Math.random() * 300,
    Math.random() * 300 - 150,
]);

const CanvasInner: React.FC = () => {
    const cubeModel = useMemo(() => new CubeModel(), []);

    const [cubes, setCubes] = useState<CanvasCube[]>([]);

    const [cubePosition, setCurrentCubePosition] = useState<Vector3Tuple>([
        0, 0, 0,
    ]);
    const [cameraPosition, setCameraPosition] = useState<Vector3Tuple>([
        0, 0, 0,
    ]);

    useEventListener("mousedown", (e) => {
        // if (e.shiftKey) {
        setCubes((oldCubes) => {
            const newCubes = [...oldCubes];
            newCubes.push({
                cube: new CubeModel(),
                position: cubePosition,
            });

            return newCubes;
        });
        // }
    });

    useFrame(({ camera, mouse, clock }) => {
        const planeNormal = new THREE.Vector3(1, 0, 0);
        const planeOrigin = new THREE.Vector3(0, 0, 0);
        planeNormal.normalize();

        const cameraDirection = new THREE.Vector3(0, 0, 1);
        const cameraY = new THREE.Vector3(0, 1, 0);
        const cameraX = new THREE.Vector3(1, 0, 0);
        cameraDirection.applyEuler(camera.rotation);
        cameraY.applyEuler(camera.rotation);
        cameraX.applyEuler(camera.rotation);
        setCameraPosition(camera.position.toArray());

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

        cubePosition.z =
            Math.floor(cubePosition.z / cubeSideLength + 0.5) * cubeSideLength;
        cubePosition.y =
            Math.floor(cubePosition.y / cubeSideLength + 0.5) * cubeSideLength;

        setCurrentCubePosition(cubePosition.toArray());
    });

    return (
        <>
            <ambientLight color="white" />
            <pointLight position={[10, 10, -10]} />
            <Suspense fallback={null}>
                <ContactShadows
                    position={[0, -4, 0]}
                    opacity={0.4}
                    width={10}
                    height={10}
                    blur={2}
                    far={20}
                />
                {/* <Environment preset="sunset" /> */}
                {/* <Box position={cubePosition} /> */}
                <FixedCube
                    cubeModel={cubeModel}
                    position={cubePosition}
                    distanceToViewer={euclideanDistance(
                        cubePosition,
                        cameraPosition
                    )}
                />
                {/* {positions.map((p, i) => (
                    // @ts-ignore
                    <Box position={p} key={100 + i} />
                ))} */}
                {positions.map((p, i) => (
                    // @ts-ignore
                    // <Box position={p} key={100 + i} />
                    <FixedCube
                        key={`cube:${i}`}
                        cubeModel={cubeModel}
                        position={p}
                        distanceToViewer={euclideanDistance(p, cameraPosition)}
                    />
                ))}
                {/* {cubes.map((cube, i) => (
                    // <Box position={cube.position} key={i} />
                    <FixedCube
                        key={`cube:${i}`}
                        cubeModel={cube.cube}
                        position={cube.position}
                        distanceToViewer={euclideanDistance(
                            cube.position,
                            cameraPosition
                        )}
                    />
                ))} */}
            </Suspense>
            <OrbitControls />
        </>
    );
};

const Box: React.FC<MeshProps> = (props) => {
    return null;
    // return (
    //     <>
    //         {_.range(28).map((i) => (
    //             <RoundedBox
    //                 key={i}
    //                 {...props}
    //                 args={[
    //                     cubePieceSideLength,
    //                     cubePieceSideLength,
    //                     cubePieceSideLength,
    //                 ]}
    //                 radius={cubeRoundedRadius}
    //                 smoothness={4}
    //             >
    //                 <meshStandardMaterial color="black" />
    //             </RoundedBox>
    //         ))}
    //     </>
    // );

    // <mesh {...props}>
    //     <boxBufferGeometry args={[3, 3, 3]} />
    //     <meshLambertMaterial color="hotpink" />
    // </mesh>
};

const CanvasPage: NextPage = () => {
    return (
        <Canvas
            camera={{
                position: [10, 0, 0],
                fov: 50,
            }}
        >
            <CanvasInner />
        </Canvas>
    );
};

export default CanvasPage;
