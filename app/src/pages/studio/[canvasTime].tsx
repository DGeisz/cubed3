import React, { Suspense, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { NextPage } from "next";
import { OrbitControls } from "@react-three/drei";
import { CubeEditor } from "../../global_building_blocks/cube/cube";
import clsx from "clsx";
import {
    CanvasCube,
    CubeModel,
    serverCanvasToTapestry,
} from "../../global_architecture/cube_model/cube_model";
import { Vector3Tuple } from "three";
import CubeCanvas from "../../lib/studio/sub_screens/cube_canvas/cube_canvas";
import _ from "underscore";
import {
    ForwardCanvas,
    StudioScreen,
    useNewCubeInfo,
    useStudioScreenInfo,
    useStudioState,
    useTapestryInfo,
    withStudioState,
} from "../../lib/studio/service_providers/studio_state_provider/studio_state_provider";
import Sidebar from "../../lib/studio/sub_screens/sidebar/sidebar";
import { useRouter } from "next/router";
import { useCanvasByTime } from "../../lib/studio/routes/canvasTime/api/queries";

interface StudioProps {
    loading: boolean;
}

const initCameraEditorPosition: Vector3Tuple = [5, 8, 15];
const initCameraCanvasPosition: Vector3Tuple = [0, 0, 50];
const initEmptyCanvasPosition: Vector3Tuple = initCameraEditorPosition;

const StudioInner: React.FC<StudioProps> = (props) => {
    const cameraSet = useRef<StudioScreen>(StudioScreen.Editor);
    const { tapestry, addCubeToTapestry } = useTapestryInfo();

    const { studioScreen: screen } = useStudioScreenInfo();
    const { newCubeAlgo, setNewCubeAlgo } = useNewCubeInfo();
    const { turnPeriod } = useStudioState();

    const lastRotation = useRef<number>(0);

    const controls = useRef<any>();

    useFrame(({ camera, clock }) => {
        const elapsed = clock.getElapsedTime();

        if (cameraSet.current !== screen) {
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
                    : tapestry.cubes.length > 0 || newCubeAlgo
                    ? initCameraCanvasPosition
                    : initEmptyCanvasPosition
            );

            cameraSet.current = screen;
        }
    });

    console.log("this is turn period", turnPeriod);

    return (
        <>
            <ambientLight />
            <Suspense fallback={null}>
                {screen === StudioScreen.Editor && <CubeEditor />}
                {screen === StudioScreen.Canvas && (
                    <CubeCanvas loading={props.loading} />
                )}
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

    const {
        data: serverCanvas,
        loading,
        error,
        refetch,
    } = useCanvasByTime(canvasTime);

    const [dark, setDark] = useState<boolean>(false);

    const { setStudioScreen, studioScreen } = useStudioScreenInfo();
    const { setTapestry } = useTapestryInfo();

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
                <StudioInner loading={loading} />
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
