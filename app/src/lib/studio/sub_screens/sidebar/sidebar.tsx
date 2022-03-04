import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { StudioStyles } from "../../studio_styles";
import { AiFillHome } from "react-icons/ai";
import { FaPaintBrush } from "react-icons/fa";
import { CubeModel } from "../../../../global_architecture/cube_model/cube_model";
import {
    StudioScreen,
    useNewCubeInfo,
    useStudioScreenInfo,
    useTapestryInfo,
} from "../../service_providers/studio_state_provider/studio_state_provider";
import Link from "next/link";
import { MosaicTapestryV2 } from "../../../../global_building_blocks/mosaic_tapestry/mosaic_tapestry";
import { tap } from "underscore";
import { useSolCanvas } from "../../routes/canvasTime/api/queries";

interface Props {
    canvasTime: number;
    switchScreens: () => void;
    setCubeEditorPeriod: (period: number) => void;
}

const minPeriod = 0.1;
const defaultPeriod = 0.2;
const maxPeriod = 1;

const Sidebar: React.FC<Props> = (props) => {
    const { newCubeAlgo, undo, setNewCubeAlgo } = useNewCubeInfo();
    const { studioScreen } = useStudioScreenInfo();
    const { tapestry } = useTapestryInfo();

    const {
        data: canvas,
        loading: canvasLoading,
        error,
    } = useSolCanvas(props.canvasTime);

    const [cubePeriod, setCubePeriod] = useState<number>(defaultPeriod);

    useEffect(() => {
        props.setCubeEditorPeriod(cubePeriod);
    }, [cubePeriod]);

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
                    {studioScreen === StudioScreen.Canvas && (
                        <div className="flex flex-col">
                            <div className={StudioStyles.buttonContainer}>
                                <div
                                    className={StudioStyles.studioButton}
                                    onClick={props.switchScreens}
                                >
                                    {hasMoreCubes
                                        ? "Add Cube"
                                        : "Get More Cubes!"}
                                </div>
                            </div>
                            <div className="flex justify-center mt-4">
                                {tapestry.cubes.length === 1 ? (
                                    <div className="h-[100px] w-[100px]">
                                        <MosaicTapestryV2 tapestry={tapestry} />
                                    </div>
                                ) : (
                                    <div className="h-[150px] w-[150px]">
                                        <MosaicTapestryV2 tapestry={tapestry} />
                                    </div>
                                )}
                            </div>
                        </div>
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
                                        setCubePeriod(val);
                                    }}
                                    value={cubePeriod}
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
                                        setNewCubeAlgo(undefined);
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
