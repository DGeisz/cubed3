import React, { useEffect, useRef, useState } from "react";
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
import {
    useCanvasMarketplaceInfo,
    useSolCanvas,
    useUserTokenAccount,
} from "../../routes/canvasTime/api/queries";
import {
    studioEventSystem,
    STUDIO_EVENT,
} from "../../service_providers/studio_events/studio_event";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LandingStyles, pinkToPurple } from "../../../landing_styles";
import { CUBE_PRICE } from "../../../../global_chain/chain_constants";
import { DotLoader } from "react-spinners";
import { finishMosaic } from "../../api/mutations";
import { useProvider } from "../../../service_providers/provider_provider";
import { clearScreenDown } from "readline";
import Marketplace from "./building_blocks/marketplace/marketplace";

interface Props {
    canvasTime: number;
    switchScreens: () => void;
}

const minPeriod = 0.1;
const maxPeriod = 1;

function showSidebarMosaic(
    numCubes: number,
    canvasScreen: CanvasScreen
): boolean {
    return numCubes > 0 && canvasScreen === CanvasScreen.Default;
}

const Sidebar: React.FC<Props> = (props) => {
    const { newCubeAlgo, undo, setNewCubeAlgo } = useNewCubeInfo();
    const { studioScreen } = useStudioScreenInfo();
    const { canvasScreen, setCanvasScreen } = useCanvasScreenInfo();
    const { tapestry } = useTapestryInfo();

    const { program, provider } = useProvider();
    const { turnPeriod, setPeriod } = useStudioState();
    const [loading, setLoading] = useState<boolean>(false);
    const [finishCanvasLoading, setFinishCanvasLoading] =
        useState<boolean>(false);

    const {
        data: canvas,
        loading: canvasLoading,
        refetch: canvasRefetch,
    } = useSolCanvas(props.canvasTime);

    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!canvasLoading) {
            setInitialLoading(false);
        }
    }, [canvasLoading]);

    useEffect(() => {
        canvasRefetch();
    }, [tapestry.cubes.length]);

    const hasMoreCubes = !!canvas ? canvas.unusedCubes > 0 : true;

    /* Handle getting more cubes */
    const [numMoreCubes, setNumMoreCubes] = useState<number>();

    useEffect(() => {
        if (canvasScreen === CanvasScreen.MoreCubes) {
            setNumMoreCubes(undefined);
        }
        setLoading(false);
    }, [canvasScreen]);

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
                <div className={clsx("flex justify-center items-center mb-4")}>
                    <WalletMultiButton
                        className={clsx(LandingStyles.WalletButton)}
                    />
                </div>
                <div
                    className={clsx(
                        "flex flex-row",
                        "border-b border-solid border-gray-200",
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
                        <>
                            {canvasScreen === CanvasScreen.Default ? (
                                !canvas?.finished && (
                                    <div className={clsx("flex flex-col")}>
                                        <div
                                            className={
                                                StudioStyles.buttonContainer
                                            }
                                        >
                                            <div
                                                className={
                                                    hasMoreCubes
                                                        ? StudioStyles.studioButton
                                                        : StudioStyles.studioButtonDisabled
                                                }
                                                onClick={() => {
                                                    if (hasMoreCubes) {
                                                        setNewCubeAlgo([]);
                                                        props.switchScreens();
                                                    }
                                                }}
                                            >
                                                {hasMoreCubes
                                                    ? "Add Cube"
                                                    : "Need More Cubes!"}
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
                                )
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
                                    <div
                                        className={StudioStyles.buttonContainer}
                                    >
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
                                    <div
                                        className={StudioStyles.buttonContainer}
                                    >
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
                                    <div
                                        className={StudioStyles.buttonContainer}
                                    >
                                        <div
                                            className={
                                                StudioStyles.studioButton
                                            }
                                            onClick={() =>
                                                studioEventSystem.emit(
                                                    STUDIO_EVENT.CONFIRM_ADD_CUBE
                                                )
                                            }
                                        >
                                            Confirm Cube
                                        </div>
                                    </div>
                                    <div
                                        className={StudioStyles.buttonContainer}
                                    >
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
                            ) : canvasScreen ===
                              CanvasScreen.ConfirmRemoveCube ? (
                                <div className="flex flex-col">
                                    <div
                                        className={clsx(
                                            StudioStyles.studioTitle,
                                            "flex text-center mb-4"
                                        )}
                                    >
                                        Are you sure you want to remove this
                                        cube? (You can't undo this)
                                    </div>
                                    <div
                                        className={StudioStyles.buttonContainer}
                                    >
                                        <div
                                            className={
                                                StudioStyles.studioButton
                                            }
                                            onClick={() =>
                                                studioEventSystem.emit(
                                                    STUDIO_EVENT.CONFIRM_REMOVE_CUBE
                                                )
                                            }
                                        >
                                            Confirm
                                        </div>
                                    </div>
                                    <div
                                        className={StudioStyles.buttonContainer}
                                    >
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
                            ) : canvasScreen ===
                              CanvasScreen.ConfirmFinishMosaic ? (
                                <div className="flex flex-col">
                                    <div
                                        className={clsx(
                                            StudioStyles.studioTitle,
                                            "flex text-center mb-4"
                                        )}
                                    >
                                        You all finished? If so, way to go,
                                        champ 👊.
                                        <br />
                                        <br />
                                        Slap that "Confirm" to show the world
                                        your masterpiece.
                                    </div>
                                    {finishCanvasLoading ? (
                                        <div
                                            className={clsx(
                                                StudioStyles.buttonContainer,
                                                "mt-4"
                                            )}
                                        >
                                            <DotLoader color="#00bcd4" />
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className={
                                                    StudioStyles.buttonContainer
                                                }
                                            >
                                                <div
                                                    className={
                                                        StudioStyles.studioButton
                                                    }
                                                    onClick={async () => {
                                                        setFinishCanvasLoading(
                                                            true
                                                        );

                                                        await finishMosaic(
                                                            provider,
                                                            program,
                                                            props.canvasTime
                                                        );

                                                        setFinishCanvasLoading(
                                                            false
                                                        );

                                                        setCanvasScreen(
                                                            CanvasScreen.Default
                                                        );
                                                    }}
                                                >
                                                    Confirm
                                                </div>
                                            </div>
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
                                                            CanvasScreen.Default
                                                        );
                                                    }}
                                                >
                                                    Cancel
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : canvasScreen === CanvasScreen.MoreCubes ? (
                                <div className="flex flex-col">
                                    <div
                                        className={clsx(
                                            "font-bold",
                                            "text-cyan-500"
                                        )}
                                    >
                                        Grab more cubes
                                    </div>
                                    <div
                                        className={clsx(
                                            "mt-4",
                                            "border-solid border-b border-gray-200 ",
                                            "overflow-hidden"
                                        )}
                                    >
                                        <input
                                            value={numMoreCubes}
                                            onChange={(e) => {
                                                e.preventDefault();

                                                setNumMoreCubes(
                                                    parseInt(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        )
                                                    )
                                                );
                                            }}
                                            autoFocus
                                            type={"number"}
                                            placeholder="How many cubes?"
                                            className={clsx(
                                                "flex flex-1",
                                                "text-xl font-medium placeholder:text-slate-300"
                                            )}
                                        />
                                    </div>
                                    <div
                                        className={clsx(
                                            "mt-1",
                                            "font-semibold",
                                            "text-slate-500"
                                        )}
                                    >
                                        Cost:{" "}
                                        <span className={clsx("text-cyan-600")}>
                                            ◎{(numMoreCubes || 0) * CUBE_PRICE}
                                        </span>
                                    </div>
                                    <div
                                        className={clsx(
                                            "flex flex-col justify-center",
                                            "mt-8"
                                        )}
                                    >
                                        {!loading ? (
                                            <>
                                                <div
                                                    className={
                                                        StudioStyles.buttonContainer
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            numMoreCubes
                                                                ? StudioStyles.studioButton
                                                                : StudioStyles.studioButtonDisabled
                                                        }
                                                        onClick={() => {
                                                            studioEventSystem.emit(
                                                                STUDIO_EVENT.GET_MORE_CUBES,
                                                                numMoreCubes
                                                            );
                                                            setLoading(true);
                                                        }}
                                                    >
                                                        Confirm
                                                    </div>
                                                </div>
                                                <div
                                                    className={
                                                        StudioStyles.buttonContainer
                                                    }
                                                    onClick={() =>
                                                        setCanvasScreen(
                                                            CanvasScreen.Default
                                                        )
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            StudioStyles.studioButtonCancel
                                                        }
                                                    >
                                                        Cancel
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-center items-center">
                                                <DotLoader color="#00bcd4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                            {showSidebarMosaic(
                                tapestry.cubes.length,
                                canvasScreen
                            ) && (
                                <>
                                    <div className="flex justify-center mb-6">
                                        <div
                                            className={clsx(
                                                "bg-slate-100 px-4 pb-2 pt-0 rounded-md shadow-md flex flex-col items-center",
                                                !canvas?.finished && "mt-6"
                                            )}
                                        >
                                            <div className="text-center py-2 font-bold text-lg text-slate-400 select-none">
                                                Mosaic Image
                                            </div>
                                            <div
                                                className={clsx(
                                                    !canvas?.finished
                                                        ? "mb-4"
                                                        : "mb-2",
                                                    "border-b border-solid border-gray-300",
                                                    "pb-4"
                                                )}
                                            >
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
                                            {!canvas?.finished ? (
                                                <div
                                                    className={
                                                        StudioStyles.buttonContainer
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            StudioStyles.studioButton
                                                        }
                                                        onClick={() =>
                                                            setCanvasScreen(
                                                                CanvasScreen.ConfirmFinishMosaic
                                                            )
                                                        }
                                                    >
                                                        Finish Mosaic
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="font-semibold text-slate-400">
                                                    Cubes:{" "}
                                                    {tapestry.cubes.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
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
                        {!canvas?.finished ? (
                            <>
                                <div className={StudioStyles.categoryContainer}>
                                    <div
                                        className={clsx([
                                            StudioStyles.categoryTitle,
                                        ])}
                                    >
                                        Cubes
                                    </div>
                                    <div className={StudioStyles.categoryStat}>
                                        In Canvas:{" "}
                                        <span>{tapestry.cubes.length}</span>
                                    </div>
                                    <div className={StudioStyles.categoryStat}>
                                        Unused:{" "}
                                        <span>
                                            {canvasLoading
                                                ? "Loading..."
                                                : canvas?.unusedCubes}
                                        </span>
                                    </div>
                                </div>
                                {canvasScreen !== CanvasScreen.MoreCubes && (
                                    <div
                                        className={StudioStyles.buttonContainer}
                                    >
                                        <div
                                            className={
                                                StudioStyles.studioButton
                                            }
                                            onClick={() =>
                                                setCanvasScreen(
                                                    CanvasScreen.MoreCubes
                                                )
                                            }
                                        >
                                            Grab More Cubes!
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Marketplace {...props} />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;
