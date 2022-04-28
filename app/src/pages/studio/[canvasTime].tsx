import React, { Suspense, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { NextPage } from "next";
import { OrbitControls } from "@react-three/drei";
import { CubeEditor } from "../../global_building_blocks/cube/cube";
import clsx from "clsx";
import {
    CanvasCube,
    CubeModel,
    CubeTapestryModel,
    serverCanvasToTapestry,
} from "../../global_architecture/cube_model/cube_model";
import { Vector3Tuple } from "three";
import CubeCanvas from "../../lib/studio/sub_screens/cube_canvas/cube_canvas";
import _ from "underscore";
import {
    CanvasScreen,
    ForwardCanvas,
    StudioScreen,
    useCanvasScreenInfo,
    useCanvasWallet,
    useNewCubeInfo,
    useStudioScreenInfo,
    useTapestryInfo,
    withStudioState,
} from "../../lib/studio/service_providers/studio_state_provider/studio_state_provider";
import Sidebar from "../../lib/studio/sub_screens/sidebar/sidebar";
import { useRouter } from "next/router";
import {
    useCanvasByTime,
    useSolCanvas,
} from "../../lib/studio/routes/canvasTime/api/queries";
import {
    STUDIO_EVENT,
    useStudioEventHandler,
} from "../../lib/studio/service_providers/studio_events/studio_event";
import { useProvider } from "../../lib/service_providers/provider_provider";
import {
    getMoreCubes,
    updateCanvasEverywhere,
} from "../../lib/studio/api/mutations";

interface StudioProps {
    loading: boolean;
    canvasTime: number;
    canvasFinished: boolean;
}

const initCameraEditorPosition: Vector3Tuple = [5, 8, 15];
const initCameraCanvasPosition: Vector3Tuple = [0, 0, 50];
const initEmptyCanvasPosition: Vector3Tuple = initCameraEditorPosition;

const StudioInner: React.FC<StudioProps> = (props) => {
    const cameraSet = useRef<StudioScreen>(-1);
    const lastCubes = useRef<number>(-1);
    const { tapestry } = useTapestryInfo();

    const { studioScreen: screen } = useStudioScreenInfo();
    const { canvasScreen } = useCanvasScreenInfo();

    const lastRotation = useRef<number>(0);

    const controls = useRef<any>();

    useFrame(({ camera, clock }) => {
        const elapsed = clock.getElapsedTime();

        if (
            cameraSet.current !== screen ||
            lastCubes.current !== tapestry.cubes.length
        ) {
            let canvasCameraPosition: Vector3Tuple;

            if (tapestry.cubes.length > 0) {
                const p = tapestry.cubes.reduce<Vector3Tuple>(
                    (prev, next: CanvasCube) => {
                        return prev.map(
                            (p, i) => p + next.position[i]
                        ) as Vector3Tuple;
                    },
                    [0, 0, 0]
                );

                const cubePositionMean = p.map(
                    (p) => p / tapestry.cubes.length
                ) as Vector3Tuple;

                canvasCameraPosition = [...cubePositionMean];

                canvasCameraPosition[2] = 50;
                camera.lookAt(...cubePositionMean);
                lastRotation.current = elapsed;
            } else {
                canvasCameraPosition = initCameraCanvasPosition;
            }

            camera.position.fromArray(
                screen === StudioScreen.Editor
                    ? initCameraEditorPosition
                    : tapestry.cubes.length > 0 ||
                      canvasScreen === CanvasScreen.AddCube ||
                      canvasScreen === CanvasScreen.ConfirmAddCube
                    ? initCameraCanvasPosition
                    : initEmptyCanvasPosition
            );

            cameraSet.current = screen;
            lastCubes.current = tapestry.cubes.length;
        }
    });

    return (
        <>
            <ambientLight />
            <Suspense fallback={null}>
                {screen === StudioScreen.Editor && <CubeEditor />}
                {screen === StudioScreen.Canvas && <CubeCanvas {...props} />}
            </Suspense>
            <OrbitControls ref={controls} />
        </>
    );
};

const switchTime = 700;
const switchClass = `duration-[700ms]`;

const Studio: NextPage = () => {
    const router = useRouter();

    let canvasTime = 0;

    if (typeof router.query?.canvasTime === "string") {
        canvasTime = parseInt(router.query.canvasTime);
    }

    const { data: serverCanvas, loading } = useCanvasByTime(canvasTime);

    const { program, provider } = useProvider();
    const wallet = useCanvasWallet();

    const { tapestry, setTapestry, addCubeToTapestry } = useTapestryInfo();
    const { setCanvasScreen } = useCanvasScreenInfo();
    const { newCubeAlgo, newCubePosition } = useNewCubeInfo();

    const { data: canvas, refetch: refetchSolCanvas } =
        useSolCanvas(canvasTime);

    useStudioEventHandler((event, data) => {
        switch (event) {
            case STUDIO_EVENT.CONFIRM_ADD_CUBE: {
                (async () => {
                    console.log("Starting to confirm");
                    await updateCanvasEverywhere(
                        provider,
                        program,
                        wallet,
                        {
                            created: true,
                            algo: newCubeAlgo,
                            x: newCubePosition[0],
                            y: newCubePosition[1],
                        },
                        canvasTime
                    );
                    console.log("Ending confirm cube");

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
                    await updateCanvasEverywhere(
                        provider,
                        program,
                        wallet,
                        {
                            created: false,
                            algo: [],
                            x: newCubePosition[0],
                            y: newCubePosition[1],
                        },
                        canvasTime
                    );

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

                (async () => {
                    await getMoreCubes(provider, program, numCubes, canvasTime);

                    refetchSolCanvas();
                    setCanvasScreen(CanvasScreen.Default);
                })();

                break;
            }
        }
    });

    const [dark, setDark] = useState<boolean>(false);

    const { setStudioScreen, studioScreen } = useStudioScreenInfo();

    useEffect(() => {
        if (serverCanvas && canvasTime > 0) {
            setTapestry(serverCanvasToTapestry(serverCanvas));
        }
    }, [
        !!serverCanvas,
        canvasTime,
        serverCanvas?.finalCubes ? serverCanvas.finalCubes.length : 0,
    ]);

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

    return (
        <div className="h-full w-full">
            <ForwardCanvas
                camera={{
                    position: initCameraEditorPosition,
                    fov: 50,
                }}
            >
                <color attach="background" args={["white"]} />
                <StudioInner
                    loading={loading}
                    canvasTime={canvasTime}
                    canvasFinished={!!canvas?.finished}
                />
            </ForwardCanvas>
            <Sidebar canvasTime={canvasTime} switchScreens={fancySwitch} />
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
