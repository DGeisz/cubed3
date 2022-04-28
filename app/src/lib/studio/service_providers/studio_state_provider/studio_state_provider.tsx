import { Canvas, Props } from "@react-three/fiber";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import React, { useContext, useState } from "react";
import { Vector3Tuple } from "three";
import {
    CanvasCube,
    CubeSyntaxTurn,
    CubeTapestryModel,
} from "../../../../global_architecture/cube_model/cube_model";
import { ProviderProvider } from "../../../service_providers/provider_provider";

export const DEFAULT_TURN_PERIOD = 0.3;

export enum StudioScreen {
    Editor,
    Canvas,
}

export enum CubeTapestryState {
    Unsolved,
    Solving,
    Solved,
    UnSolving,
}

export enum CanvasScreen {
    Default,
    AddCube,
    ConfirmAddCube,
    RemoveCube,
    ConfirmRemoveCube,
    MoreCubes,
    ConfirmFinishMosaic,
    MakeOffer,
    /* For owner */
    SetPrice,
    ChangePrice,
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
    newCubePosition: Vector3Tuple;
    setNewCubePosition: (p: Vector3Tuple) => void;
    turnPeriod: number;
    setPeriod: (p: number) => void;
    handleUndo: () => void;
    setHandleUndo: (handler: () => () => void) => void;
    tapestryState: CubeTapestryState;
    setTapestryState: (state: CubeTapestryState) => void;
    performanceCubes: boolean;
    setPerformanceCubes: (p: boolean) => void;
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
    newCubePosition: [0, 0, 0],
    setNewCubePosition: () => {},
    turnPeriod: DEFAULT_TURN_PERIOD,
    setPeriod: () => {},
    handleUndo: () => {},
    setHandleUndo: () => () => {},
    tapestryState: CubeTapestryState.Unsolved,
    setTapestryState: () => {},

    performanceCubes: false,
    setPerformanceCubes: () => {},
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

        const [newCubePosition, setNewCubePosition] = useState<Vector3Tuple>([
            0, 0, 0,
        ]);

        const [tapestryState, setTapestryState] = useState<CubeTapestryState>(
            CubeTapestryState.Solving
        );

        const [performanceCubes, setPerformanceCubes] =
            useState<boolean>(false);

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
                    newCubePosition,
                    setNewCubePosition,
                    handleUndo,
                    setHandleUndo,
                    tapestryState,
                    setTapestryState,
                    performanceCubes,
                    setPerformanceCubes,
                }}
            >
                <Component {...props} />
            </StudioContext.Provider>
        );
    };
}

type CanvasProps = Props;

interface CanvasWallet {
    wallet: WalletContextState;
}

const CanvasWalletContext = React.createContext<CanvasWallet>({
    // @ts-ignore
    wallet: {},
});

export function useCanvasWallet(): WalletContextState {
    const { wallet } = useContext(CanvasWalletContext);

    return wallet;
}

interface CanvasWalletProviderProps {
    wallet?: WalletContextState;
}

export const CanvasWalletProvider: React.FC<CanvasWalletProviderProps> = (
    props
) => {
    const wallet = useWallet();

    const finalWallet = props.wallet || wallet;

    return (
        <CanvasWalletContext.Provider value={{ wallet: finalWallet }}>
            {props.children}
        </CanvasWalletContext.Provider>
    );
};

export const ForwardCanvas: React.FC<CanvasProps> = (props) => {
    const value = useContext(StudioContext);
    const wallet = useCanvasWallet();

    return (
        <Canvas {...props}>
            <CanvasWalletProvider wallet={wallet}>
                <ProviderProvider>
                    <StudioContext.Provider value={value}>
                        {props.children}
                    </StudioContext.Provider>
                </ProviderProvider>
            </CanvasWalletProvider>
        </Canvas>
    );
};

export function useNewCubeInfo() {
    const {
        newCubeAlgo,
        setNewCubeAlgo,
        newCubePosition,
        setNewCubePosition,
        handleUndo: undo,
        setHandleUndo: su,
    } = useContext(StudioContext);

    const setHandleUndo = (handler: () => void) => {
        su(() => handler);
    };

    return {
        newCubeAlgo,
        setNewCubeAlgo,
        undo,
        setHandleUndo,
        newCubePosition,
        setNewCubePosition,
    };
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
