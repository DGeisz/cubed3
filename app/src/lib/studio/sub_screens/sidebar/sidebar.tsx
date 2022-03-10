import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { StudioStyles } from "../../studio_styles";
import { AiFillHome } from "react-icons/ai";
import { FaPaintBrush } from "react-icons/fa";
import { CubeModel } from "../../../../global_architecture/cube_model/cube_model";
import {
    CanvasScreen,
    StudioScreen,
    useCanvasScreenInfo,
    useNewCubeInfo,
    useStudioScreenInfo,
    useStudioState,
    useTapestryInfo,
} from "../../service_providers/studio_state_provider/studio_state_provider";
import Link from "next/link";
import { MosaicTapestryV2 } from "../../../../global_building_blocks/mosaic_tapestry/mosaic_tapestry";
import { tap } from "underscore";
import { useSolCanvas } from "../../routes/canvasTime/api/queries";
import {
    studioEventSystem,
    STUDIO_EVENT,
} from "../../service_providers/studio_events/studio_event";

interface Props {
    canvasTime: number;
    switchScreens: () => void;
}

const minPeriod = 0.1;
const maxPeriod = 1;

const Sidebar: React.FC<Props> = (props) => {
    const { newCubeAlgo, undo, setNewCubeAlgo } = useNewCubeInfo();
    const { studioScreen } = useStudioScreenInfo();
    const { canvasScreen, setCanvasScreen } = useCanvasScreenInfo();
    const { tapestry } = useTapestryInfo();

    const { turnPeriod, setPeriod } = useStudioState();

    const {
        data: canvas,
        loading: canvasLoading,
        refetch,
    } = useSolCanvas(props.canvasTime);

    useEffect(() => {
        refetch();
    }, [tapestry.cubes.length]);

    const hasMoreCubes = !!canvas ? canvas.unusedCubes > 0 : true;

    return (
        <>
            <div
                className={clsx(
                    "absolute top-0 bottom-0 right-0",
                    "bg-white",
                    "w-[200px]",
                    "shadow-md",
                    "py-4 px-2",
                    "flex flex-col"
                )}
            >
                <div
                    className={clsx(
                        "flex flex-row border-b border-solid border-gray-200",
                        "pb-2 mb-4 "
                    )}
                >
                    <div className={clsx("flex flex-row flex-grow")}>
                        <div className={clsx("flex flex-1 justify-start")}>
                            <Link href="/">
                                <a>
                                    <AiFillHome
                                        className={clsx(
                                            "text-cyan-500 cursor-pointer"
                                        )}
                                    />
                                </a>
                            </Link>
                        </div>
                        <div className="flex flex-1 justify-end">
                            <Link href="/designer">
                                <a target="_blank">
                                    <FaPaintBrush
                                        className={clsx(
                                            "text-cyan-500 cursor-pointer"
                                        )}
                                    />
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* This is the main body of the sidebar */}
                <div className="flex flex-grow flex-col">
                    {studioScreen === StudioScreen.Canvas &&
                        (canvasScreen === CanvasScreen.Default ? (
                            <div className="flex flex-col">
                                <div className={StudioStyles.buttonContainer}>
                                    <div
                                        className={StudioStyles.studioButton}
                                        onClick={() => {
                                            setNewCubeAlgo([]);
                                            props.switchScreens();
                                        }}
                                    >
                                        {hasMoreCubes
                                            ? "Add Cube"
                                            : "Get More Cubes!"}
                                    </div>
                                </div>
                                {tapestry.cubes.length > 0 && (
                                    <>
                                        <div
                                            className={
                                                StudioStyles.buttonContainer
                                            }
                                        >
                                            <div
                                                className={
                                                    StudioStyles.studioButtonCancel
                                                }
                                                onClick={() => {
                                                    setCanvasScreen(
                                                        CanvasScreen.RemoveCube
                                                    );
                                                }}
                                            >
                                                Remove Cube
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : canvasScreen === CanvasScreen.AddCube ? (
                            <div className={clsx("flex flex-col")}>
                                <div
                                    className={clsx(
                                        "flex items-center flex-col text-center",
                                        "px-4 mb-4",
                                        "font-semibold",
                                        "text-slate-400 select-none"
                                    )}
                                >
                                    Hold "Shift" and click to place cube
                                </div>
                                <div className={StudioStyles.buttonContainer}>
                                    <div
                                        className={
                                            StudioStyles.studioButtonCancel
                                        }
                                        onClick={() =>
                                            setCanvasScreen(
                                                CanvasScreen.Default
                                            )
                                        }
                                    >
                                        Cancel
                                    </div>
                                </div>
                            </div>
                        ) : canvasScreen === CanvasScreen.RemoveCube ? (
                            <div className={clsx("flex flex-col")}>
                                <div
                                    className={clsx(
                                        "flex items-center flex-col text-center",
                                        "px-4 mb-4",
                                        "font-semibold",
                                        "text-slate-400 select-none"
                                    )}
                                >
                                    Hold "Shift" and click to remove cube
                                </div>
                                <div className={StudioStyles.buttonContainer}>
                                    <div
                                        className={
                                            StudioStyles.studioButtonCancel
                                        }
                                        onClick={() =>
                                            setCanvasScreen(
                                                CanvasScreen.Default
                                            )
                                        }
                                    >
                                        Cancel
                                    </div>
                                </div>
                            </div>
                        ) : canvasScreen === CanvasScreen.ConfirmAddCube ? (
                            <div className="flex flex-col">
                                <div className={StudioStyles.buttonContainer}>
                                    <div
                                        className={StudioStyles.studioButton}
                                        onClick={() =>
                                            studioEventSystem.emit(
                                                STUDIO_EVENT.CONFIRM_ADD_CUBE
                                            )
                                        }
                                    >
                                        Confirm Cube
                                    </div>
                                </div>
                                <div className={StudioStyles.buttonContainer}>
                                    <div
                                        className={
                                            StudioStyles.studioButtonCancel
                                        }
                                        onClick={() => {
                                            studioEventSystem.emit(
                                                STUDIO_EVENT.CANCEL_CONFIRM_ADD_CUBE
                                            );
                                        }}
                                    >
                                        Cancel
                                    </div>
                                </div>
                            </div>
                        ) : canvasScreen === CanvasScreen.ConfirmRemoveCube ? (
                            <div className="flex flex-col">
                                <div
                                    className={clsx(
                                        StudioStyles.studioTitle,
                                        "flex text-center mb-4"
                                    )}
                                >
                                    Are you sure you want to remove this cube?
                                    (You can't undo this)
                                </div>
                                <div className={StudioStyles.buttonContainer}>
                                    <div
                                        className={StudioStyles.studioButton}
                                        onClick={() =>
                                            studioEventSystem.emit(
                                                STUDIO_EVENT.CONFIRM_REMOVE_CUBE
                                            )
                                        }
                                    >
                                        Confirm
                                    </div>
                                </div>
                                <div className={StudioStyles.buttonContainer}>
                                    <div
                                        className={
                                            StudioStyles.studioButtonCancel
                                        }
                                        onClick={() => {
                                            studioEventSystem.emit(
                                                STUDIO_EVENT.CANCEL_CONFIRM_REMOVE_CUBE
                                            );
                                        }}
                                    >
                                        Cancel
                                    </div>
                                </div>
                            </div>
                        ) : null)}

                    {tapestry.cubes.length > 0 && (
                        <>
                            <div className="flex justify-center mt-8">
                                <div className="bg-slate-100 p-4 pt-0 rounded-md shadow-md flex flex-col items-center">
                                    <div className="text-center py-2 font-bold text-lg text-slate-400 select-none">
                                        Mosaic Image
                                    </div>
                                    {tapestry.cubes.length === 1 ? (
                                        <div className="h-[100px] w-[100px]">
                                            <MosaicTapestryV2
                                                tapestry={tapestry}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-[150px] w-[150px]">
                                            <MosaicTapestryV2
                                                tapestry={tapestry}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    {studioScreen === StudioScreen.Editor && (
                        <div className="flex flex-col flex-grow">
                            <div className={StudioStyles.categoryContainer}>
                                <div className={StudioStyles.categoryTitle}>
                                    Cube Algorithm
                                </div>
                                {newCubeAlgo && newCubeAlgo.length > 0 ? (
                                    <div className={StudioStyles.categoryText}>
                                        {CubeModel.turnsToString(newCubeAlgo)}
                                    </div>
                                ) : (
                                    <div
                                        className={
                                            StudioStyles.categoryTextNone
                                        }
                                    >
                                        None
                                    </div>
                                )}
                            </div>
                            <div className="w-full mb-8">
                                <div className="flex translate-y-2">
                                    <div className="flex flex-1 justify-start font-bold text-sm text-teal-600 select-none">
                                        Fast
                                    </div>
                                    <div className="flex flex-1 justify-end font-bold text-sm text-teal-600 select-none">
                                        Slow
                                    </div>
                                </div>
                                <input
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setPeriod(val);
                                    }}
                                    value={turnPeriod}
                                    type={"range"}
                                    min={minPeriod}
                                    max={maxPeriod}
                                    step={0.01}
                                    placeholder="speed"
                                />
                            </div>
                            <div className={StudioStyles.buttonContainer}>
                                <div
                                    className={StudioStyles.studioButton}
                                    onClick={() => {
                                        props.switchScreens();

                                        setCanvasScreen(CanvasScreen.AddCube);
                                        setNewCubeAlgo(newCubeAlgo || []);
                                    }}
                                >
                                    Confirm
                                </div>
                            </div>
                            <div className={StudioStyles.buttonContainer}>
                                <div
                                    className={StudioStyles.studioButtonCancel}
                                    onClick={() => {
                                        props.switchScreens();

                                        setCanvasScreen(CanvasScreen.Default);
                                        setNewCubeAlgo([]);
                                    }}
                                >
                                    Cancel
                                </div>
                            </div>
                            <div className="w-full h-px bg-gray-200 my-4" />
                            <div className="flex flex-1 justify-center items-center">
                                <div
                                    className={clsx(
                                        StudioStyles.buttonContainer
                                    )}
                                >
                                    <div
                                        className={
                                            newCubeAlgo &&
                                            newCubeAlgo.length > 0
                                                ? StudioStyles.studioButton
                                                : StudioStyles.studioButtonDisabled
                                        }
                                        onClick={undo}
                                    >
                                        Undo
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* This is the footer */}
                {studioScreen === StudioScreen.Canvas && (
                    <div>
                        <div className={StudioStyles.categoryContainer}>
                            <div className={StudioStyles.categoryTitle}>
                                Cubes in Canvas
                            </div>
                            <div className={StudioStyles.categoryStat}>
                                {tapestry.cubes.length}
                            </div>
                        </div>
                        <div className={StudioStyles.categoryContainer}>
                            <div className={StudioStyles.categoryTitle}>
                                Unused Cubes
                            </div>
                            <div className={StudioStyles.categoryStat}>
                                {canvasLoading
                                    ? "Loading..."
                                    : canvas?.unusedCubes}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;
