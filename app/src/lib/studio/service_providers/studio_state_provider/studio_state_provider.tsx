import { Canvas, Props } from "@react-three/fiber";
import React, { useContext, useState } from "react";
import {
    CanvasCube,
    CubeSyntaxTurn,
    CubeTapestryModel,
} from "../../../../global_architecture/cube_model/cube_model";

export enum StudioScreen {
    Editor,
    Canvas,
    Confirm,
}

interface StudioStateContext {
    studioScreen: StudioScreen;
    setStudioScreen: (screen: StudioScreen) => void;
    newCubeAlgo: CubeSyntaxTurn[] | undefined;
    setNewCubeAlgo: (algo: CubeSyntaxTurn[] | undefined) => void;
    tapestry: CubeTapestryModel;
    setTapestry: (t: CubeTapestryModel) => void;
    handleUndo: () => void;
    setHandleUndo: (handler: () => () => void) => void;
}

export const StudioContext = React.createContext<StudioStateContext>({
    studioScreen: StudioScreen.Editor,
    setStudioScreen: () => {},
    newCubeAlgo: [],
    setNewCubeAlgo: () => {},
    tapestry: new CubeTapestryModel(),
    setTapestry: () => {},
    handleUndo: () => {},
    setHandleUndo: () => () => {},
});

export function withStudioState<P>(Component: React.FC<P>): React.FC<P> {
    return function NewComponent(props) {
        const [studioScreen, setStudioScreen] = useState<StudioScreen>(
            StudioScreen.Canvas
        );
        const [newCubeAlgo, setNewCubeAlgo] = useState<
            CubeSyntaxTurn[] | undefined
        >(undefined);
        const [tapestry, setTapestry] = useState<CubeTapestryModel>(
            new CubeTapestryModel()
        );
        const [handleUndo, setHandleUndo] = useState<() => void>(() => {});

        return (
            <StudioContext.Provider
                value={{
                    studioScreen,
                    setStudioScreen,
                    newCubeAlgo,
                    setNewCubeAlgo,
                    tapestry,
                    setTapestry,
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

export function useTapestryInfo() {
    const { tapestry, setTapestry } = useContext(StudioContext);

    function addCubeToTapestry(newCube: CanvasCube) {
        setTapestry(tapestry.newTapestry(newCube));
    }

    return { tapestry, setTapestry, addCubeToTapestry };
}
