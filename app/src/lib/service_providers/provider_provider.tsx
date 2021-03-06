import React, { createContext, useContext, useMemo } from "react";
import { Program, Provider } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ConfirmOptions, PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import idl from "../../global_idl/idl.json";
import { Cubed } from "../../global_types/cubed";
import { useCanvasWallet } from "../studio/service_providers/studio_state_provider/studio_state_provider";

const programID = new PublicKey(idl.metadata.address);
// const programID = new PublicKey("EiawDaRsHXKZEt3rJHRbpwPZeNhzxZTv37RxPZgjkUSJ");
// const programID = new PublicKey("5pDJMtbFrSnctiWQi57WtFgbpsuPbQKFkBMUyDMaVpef");

interface ContextType {
    provider: Provider;
    program: Program<Cubed>;
}

const opts: ConfirmOptions = {
    preflightCommitment: "processed",
};

// @ts-ignore
const ProviderContext = createContext<ContextType>({
    // @ts-ignore
    provider: {},
    // @ts-ignore
    program: {},
});

export function useProvider(): ContextType {
    return useContext(ProviderContext);
}

interface ProviderProps {
    opts?: ConfirmOptions;
}

export const ProviderProvider: React.FC<ProviderProps> = (props) => {
    const { connection } = useConnection();
    const wallet = useCanvasWallet() as Wallet;

    const finalOpts = props.opts || opts;

    const [provider, program] = useMemo(() => {
        const provider = new Provider(connection, wallet, props.opts || opts);

        // @ts-ignore
        return [provider, new Program<Cubed>(idl, programID, provider)];
    }, [finalOpts, connection, wallet]);

    return (
        <ProviderContext.Provider value={{ provider, program }}>
            {props.children}
        </ProviderContext.Provider>
    );
};
