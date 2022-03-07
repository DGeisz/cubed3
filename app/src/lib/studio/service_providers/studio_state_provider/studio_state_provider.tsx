import { Canvas, Props } from "@react-three/fiber";
import React, { useContext, useState } from "react";
import { Vector3Tuple } from "three";
import {
    CanvasCube,
    CubeSyntaxTurn,
    CubeTapestryModel,
} from "../../../../global_architecture/cube_model/cube_model";

export const DEFAULT_TURN_PERIOD = 0.3;

export enum StudioScreen {
    Editor,
    Canvas,
}

export enum CanvasScreen {
    Default,
    AddCube,
    ConfirmAddCube,
    RemoveCube,
    ConfirmRemoveCube,
}

interface StudioStateContext {
    studioScreen: StudioScreen;
    setStudioScreen: (screen: StudioScreen) => void;
    canvasScreen: CanvasScreen;
    setCanvasScreen: (screen: CanvasScreen) => void;
    newCubeAlgo: CubeSyntaxTurn[];
    setNewCubeAlgo: (algo: CubeSyntaxTurn[]) => void;
    tapestry: CubeTapestryModel;
    setTapestry: (t: CubeTapestryModel) => void;
    turnPeriod: number;
    setPeriod: (p: number) => void;
    handleUndo: () => void;
    setHandleUndo: (handler: () => () => void) => void;
}

export const StudioContext = React.createContext<StudioStateContext>({
    studioScreen: StudioScreen.Editor,
    setStudioScreen: () => {},
    canvasScreen: CanvasScreen.Default,
    setCanvasScreen: () => {},
    newCubeAlgo: [],
    setNewCubeAlgo: () => {},
    tapestry: new CubeTapestryModel(),
    setTapestry: () => {},
    turnPeriod: DEFAULT_TURN_PERIOD,
    setPeriod: () => {},
    handleUndo: () => {},
    setHandleUndo: () => () => {},
});

export function withStudioState<P>(Component: React.FC<P>): React.FC<P> {
    return function NewComponent(props) {
        const [studioScreen, setStudioScreen] = useState<StudioScreen>(
            StudioScreen.Canvas
        );
        const [newCubeAlgo, setNewCubeAlgo] = useState<CubeSyntaxTurn[]>([]);
        const [tapestry, setTapestry] = useState<CubeTapestryModel>(
            new CubeTapestryModel()
        );
        const [canvasScreen, setCanvasScreen] = useState<CanvasScreen>(
            CanvasScreen.Default
        );

        const [turnPeriod, setPeriod] = useState<number>(DEFAULT_TURN_PERIOD);

        const [handleUndo, setHandleUndo] = useState<() => void>(() => {});

        return (
            <StudioContext.Provider
                value={{
                    studioScreen,
                    setStudioScreen,
                    canvasScreen,
                    setCanvasScreen,
                    newCubeAlgo,
                    setNewCubeAlgo,
                    tapestry,
                    setTapestry,
                    turnPeriod,
                    setPeriod,
                    handleUndo,
                    setHandleUndo,
                }}
            >
                <Component {...props} />
            </StudioContext.Provider>
        );
    };
}

type CanvasProps = Props;

export const ForwardCanvas: React.FC<CanvasProps> = (props) => {
    const value = useContext(StudioContext);

    return (
        <Canvas {...props}>
            <StudioContext.Provider value={value}>
                {props.children}
            </StudioContext.Provider>
        </Canvas>
    );
};

export function useNewCubeInfo() {
    const {
        newCubeAlgo,
        setNewCubeAlgo,
        handleUndo: undo,
        setHandleUndo: su,
    } = useContext(StudioContext);

    const setHandleUndo = (handler: () => void) => {
        su(() => handler);
    };

    return { newCubeAlgo, setNewCubeAlgo, undo, setHandleUndo };
}

export function useStudioScreenInfo() {
    const { studioScreen, setStudioScreen } = useContext(StudioContext);

    return { studioScreen, setStudioScreen };
}

export function useCanvasScreenInfo() {
    const { canvasScreen, setCanvasScreen } = useContext(StudioContext);

    return { canvasScreen, setCanvasScreen };
}

export function useTapestryInfo() {
    const { tapestry, setTapestry } = useContext(StudioContext);

    function addCubeToTapestry(newCube: CanvasCube) {
        setTapestry(tapestry.newTapestry(newCube));
    }

    return { tapestry, setTapestry, addCubeToTapestry };
}

export function useStudioState() {
    return useContext(StudioContext);
}
