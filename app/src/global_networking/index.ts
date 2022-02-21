import { Program, Provider } from "@project-serum/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import axios from "axios";
import { ServerCubePlacement } from "../global_architecture/cube_model/cube_model";
import { placeCube, removeCube } from "../global_chain/chain_methods";
import { Cubed } from "../global_types/cubed";
import { BASE_URL } from "./constants";

enum UpdateCanvasRes {
    Success,
    BadWallet,
}

export async function updateCanvasEverywhere(
    provider: Provider,
    program: Program<Cubed>,
    wallet: WalletContextState,
    cubePlacement: ServerCubePlacement,
    canvasTime: number
): Promise<UpdateCanvasRes> {
    if (wallet.signMessage) {
        /* Express intent to update the canvas to the server */
        const msg = Buffer.from(JSON.stringify(cubePlacement), "utf-8");
        const sig = await wallet.signMessage(msg);

        const res = await axios.post(`${BASE_URL}/queue_canvas_update`, {
            time: canvasTime,
            signature: sig,
            cubePlacement,
        });

        /* Actually send the update to solana */
        if (cubePlacement.created) {
            await placeCube(
                provider,
                program,
                canvasTime,
                cubePlacement.algo,
                cubePlacement.x,
                cubePlacement.y
            );
        } else {
            await removeCube(
                provider,
                program,
                canvasTime,
                cubePlacement.x,
                cubePlacement.y
            );
        }

        /* Now finalize everything on the server */
        await axios.post(`${BASE_URL}/finalize_canvas_update`, {
            time: canvasTime,
        });

        return UpdateCanvasRes.Success;
    } else {
        return UpdateCanvasRes.BadWallet;
    }
}
