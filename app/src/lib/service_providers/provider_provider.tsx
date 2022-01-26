import React, { createContext, useContext, useMemo } from "react";
import { Program, Provider } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ConfirmOptions, PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import idl from "../../../../target/idl/cubed.json";
import { Cubed } from "../../../../target/types/cubed";

const programID = new PublicKey(idl.metadata.address);

interface ContextType {
    provider: Provider;
    program: Program<Cubed>;
}

const opts: ConfirmOptions = {
    preflightCommitment: "processed",
};

// @ts-ignore
const ProviderContext = createContext<ContextType>();

export function useProvider(): ContextType {
    return useContext(ProviderContext);
}

interface ProviderProps {
    opts?: ConfirmOptions;
}

export const ProviderProvider: React.FC<ProviderProps> = (props) => {
    const { connection } = useConnection();
    const wallet = useWallet() as Wallet;

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
