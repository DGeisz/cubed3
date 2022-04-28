import React, { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { NextPage } from "next";
import { OrbitControls } from "@react-three/drei";
import { CubeEditor } from "../../global_building_blocks/cube/cube";
import clsx from "clsx";
import {
    CanvasCube,
    CompressedTapestry,
    CubeModel,
    CubeTapestryModel,
} from "../../global_architecture/cube_model/cube_model";
import { Vector3Tuple } from "three";
import CubeCanvas from "../../lib/studio/sub_screens/cube_canvas/cube_canvas";
import _ from "underscore";
import {
    CanvasScreen,
    ForwardCanvas,
    StudioScreen,
    useCanvasScreenInfo,
    useNewCubeInfo,
    useStudioScreenInfo,
    useTapestryInfo,
    withStudioState,
} from "../../lib/studio/service_providers/studio_state_provider/studio_state_provider";
import Sidebar from "../../lib/studio/sub_screens/sidebar/sidebar";
import {
    STUDIO_EVENT,
    useStudioEventHandler,
} from "../../lib/studio/service_providers/studio_events/studio_event";
import marioJson from "../../lib/mario/mario.json";
import { getFOVHeightWidthTan } from "../../global_three/utils/camera";

interface StudioProps {
    cubePeriod: number;
}

const iC = new THREE.Vector3(5, 5, 15);
iC.normalize();

const initCameraEditorPosition: Vector3Tuple = [0, 0, 15];
const initCameraCanvasPosition: Vector3Tuple = [0, 0, 50];
const initEmptyCanvasPosition: Vector3Tuple = initCameraEditorPosition;

const StudioInner: React.FC<StudioProps> = (props) => {
    const cameraSet = useRef<StudioScreen>(StudioScreen.Editor);
    const { tapestry, setTapestry } = useTapestryInfo();

    useEffect(() => {
        const tap = new CubeTapestryModel();
        tap.setFromCompressed(marioJson as CompressedTapestry);

        setTapestry(tap);
    }, []);

    const { studioScreen: screen } = useStudioScreenInfo();
    const { newCubeAlgo, setNewCubeAlgo } = useNewCubeInfo();

    const cameraRotated = useRef<boolean>(true);
    const lastRotation = useRef<number>(0);

    const controls = useRef<any>();

    useFrame(({ camera, clock }) => {
        const elapsed = clock.getElapsedTime();

        if (cameraSet.current !== screen) {
            if (screen === StudioScreen.Editor) {
                camera.position.fromArray(initCameraEditorPosition);
            } else if (screen === StudioScreen.Canvas) {
                if (tapestry.cubes.length > 0 || newCubeAlgo) {
                    const { width, height } = tapestry.getBoundingBox();
                    const [tanHeight, tanWidth] = getFOVHeightWidthTan(camera);

                    const newPosition = new THREE.Vector3();
                    newPosition.copy(iC);

                    const cameraLength =
                        Math.max(width / tanWidth, height / tanHeight) * 1.5;

                    newPosition.multiplyScalar(cameraLength);

                    camera.position.copy(newPosition);
                } else {
                    camera.position.fromArray(initEmptyCanvasPosition);
                }
            }

            cameraSet.current = screen;
        }
    });

    return (
        <>
            <ambientLight />
            <Suspense fallback={null}>
                {screen === StudioScreen.Editor && <CubeEditor />}
                {screen === StudioScreen.Canvas && (
                    <CubeCanvas
                        loading={false}
                        canvasTime={0}
                        canvasFinished={true}
                    />
                )}
            </Suspense>
            <OrbitControls ref={controls} />
        </>
    );
};

const switchTime = 700;
const switchClass = `duration-[700ms]`;

const Studio: NextPage = () => {
    const [dark, setDark] = useState<boolean>(false);
    const { setStudioScreen, studioScreen } = useStudioScreenInfo();
    const [cubePeriod, setCubePeriod] = useState<number>(0);

    const fancySwitch = () => {
        setDark(true);
        setTimeout(() => {
            if (studioScreen === StudioScreen.Editor) {
                setStudioScreen(StudioScreen.Canvas);
            } else {
                setStudioScreen(StudioScreen.Editor);
            }
            setDark(false);
        }, switchTime);
    };

    const { tapestry, setTapestry, addCubeToTapestry } = useTapestryInfo();
    const { setCanvasScreen } = useCanvasScreenInfo();
    const { newCubeAlgo, newCubePosition } = useNewCubeInfo();

    useStudioEventHandler((event, data) => {
        switch (event) {
            case STUDIO_EVENT.CONFIRM_ADD_CUBE: {
                (async () => {
                    console.log("Starting to confirm");
                    const cube = new CubeModel();
                    cube.applyAlgoTurns(newCubeAlgo);

                    addCubeToTapestry({
                        position: newCubePosition,
                        cube,
                    });
                    setCanvasScreen(CanvasScreen.Default);
                })();

                break;
            }
            case STUDIO_EVENT.CANCEL_CONFIRM_ADD_CUBE: {
                setCanvasScreen(CanvasScreen.AddCube);

                break;
            }
            case STUDIO_EVENT.CONFIRM_REMOVE_CUBE: {
                (async () => {
                    setTapestry(
                        new CubeTapestryModel(
                            [...tapestry.cubes].filter(
                                (c) => !_.isEqual(c.position, newCubePosition)
                            )
                        )
                    );
                    setCanvasScreen(CanvasScreen.Default);
                })();

                break;
            }
            case STUDIO_EVENT.CANCEL_CONFIRM_REMOVE_CUBE: {
                setCanvasScreen(CanvasScreen.Default);
                break;
            }
            case STUDIO_EVENT.GET_MORE_CUBES: {
                const numCubes: number = data;

                break;
            }
        }
    });

    return (
        <div className="h-full w-full">
            {/* <DemoTutorial /> */}
            <div className="cursor-none h-full w-full">
                <ForwardCanvas
                    camera={{
                        position: initCameraEditorPosition,
                        // fov: 50,
                        // fov: 100,
                    }}
                >
                    <color attach="background" args={["white"]} />
                    <StudioInner cubePeriod={cubePeriod} />
                </ForwardCanvas>
            </div>

            <Sidebar
                canvasTime={0}
                switchScreens={fancySwitch}
                overrideCanvasFinished
            />
            <div
                className={clsx(
                    "absolute inset-0",
                    "bg-black",
                    switchClass,
                    "pointer-events-none"
                )}
                style={{ opacity: dark ? 100 : 0 }}
            />
        </div>
    );
};

export default withStudioState(Studio);
