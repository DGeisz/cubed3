import React, {
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    StickerColor,
    stickerColorToRegularHex,
} from "../../global_architecture/cube_model/cube_model";
import TopBar from "../../global_building_blocks/top_bar/top_bar";
import clsx from "clsx";
import _ from "underscore";
import useEventListener from "@use-it/event-listener";
import DesignerMosaic from "../../lib/designer/building_blocks/designer_mosaic/designer_mosaic";
import { DesignerStyles } from "../../lib/designer/designer_styles";
import CubeBackground from "../../global_building_blocks/cube_background/cube_background";

const Designer: React.FC = () => {
    const [selectedColor, setColor] = useState<StickerColor>(StickerColor.Blue);
    const [xDim, setXDim] = useState<number>(2);
    const [yDim, setYDim] = useState<number>(2);

    const [mouseDown, setMouseDown] = useState<boolean>(false);
    const [brushRadius, setBrushRadius] = useState<number>(1);
    const [separateCubes, setSeparateCubes] = useState<boolean>(false);

    useEventListener("mousedown", () => {
        setMouseDown(true);
    });

    useEventListener("mouseup", () => {
        setMouseDown(false);
    });

    return (
        <div className="relative">
            <CubeBackground />
            <div className="relative flex flex-col h-full w-full ">
                <TopBar />
                <div className="flex flex-row m-8 bg-white/90 h-full pt-2 rounded-md">
                    <div className="flex flex-col flex-wrap">
                        <div
                            className={clsx(
                                DesignerStyles.ToolContainer,
                                "flex flex-col"
                            )}
                        >
                            <div className={DesignerStyles.ToolTitle}>
                                Brush Color
                            </div>
                            <div className="flex flex-row ">
                                {Object.values(StickerColor)
                                    .filter(
                                        (c, i) =>
                                            typeof c === "number" && i < 15
                                    )
                                    .map((color, i) => {
                                        const active = color === selectedColor;

                                        return (
                                            <div
                                                key={`color:${i}`}
                                                onClick={() =>
                                                    setColor(
                                                        color as StickerColor
                                                    )
                                                }
                                                className={clsx(
                                                    "h-[50px] w-[50px] rounded shadow-md",
                                                    "mr-8",
                                                    active
                                                        ? "border-4 border-cyan-400"
                                                        : "border border-gray-300",
                                                    "cursor-pointer"
                                                )}
                                                style={{
                                                    backgroundColor:
                                                        stickerColorToRegularHex(
                                                            color as StickerColor
                                                        ),
                                                }}
                                            ></div>
                                        );
                                    })}
                            </div>
                        </div>
                        {/* <div className="flex justify-center"> */}
                        <div
                            className={clsx(
                                "flex justify-start items-start ",
                                DesignerStyles.ToolContainer
                            )}
                        >
                            <div className="w-[200px]">
                                <div className={DesignerStyles.ToolTitle}>
                                    Brush Size
                                </div>
                                <input
                                    type="range"
                                    placeholder="radius"
                                    value={brushRadius}
                                    onChange={(e) =>
                                        setBrushRadius(
                                            parseFloat(e.target.value)
                                        )
                                    }
                                    min={0.4}
                                    max={20}
                                    step={0.1}
                                />
                            </div>
                        </div>
                        <div
                            className={clsx(
                                DesignerStyles.ToolContainer,
                                "flex flex-row"
                            )}
                        >
                            <div className="mr-4">
                                <div className={DesignerStyles.ToolTitle}>
                                    X Dimension
                                </div>
                                <input
                                    value={xDim}
                                    className={DesignerStyles.NumericInput}
                                    type="number"
                                    placeholder="x"
                                    onChange={(e) =>
                                        setXDim(
                                            Math.max(
                                                parseInt(e.target.value),
                                                0
                                            )
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <div className={DesignerStyles.ToolTitle}>
                                    Y Dimension
                                </div>
                                <input
                                    value={yDim}
                                    className={DesignerStyles.NumericInput}
                                    type="number"
                                    placeholder="y"
                                    onChange={(e) =>
                                        setYDim(
                                            Math.max(
                                                parseInt(e.target.value),
                                                0
                                            )
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className={clsx(DesignerStyles.ToolContainer)}>
                            <div className={DesignerStyles.ToolTitle}>
                                Separate Cubes
                            </div>
                            <input
                                type="checkbox"
                                checked={separateCubes}
                                placeholder="y"
                                className="h-[20px] w-[20px]"
                                onChange={(e) => {
                                    setSeparateCubes(e.target.checked);
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-grow justify-center items-center">
                        <div className="relative h-[600px] w-[600px] bg-slate-200 rounded p-4 mb-4 shadow-md">
                            <DesignerMosaic
                                xDim={xDim}
                                yDim={yDim}
                                selectedColor={selectedColor}
                                brushRadius={brushRadius}
                                separateCubes={separateCubes}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Designer;
