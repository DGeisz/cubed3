import { Program, Provider } from "@project-serum/anchor";
import {
    useAnchorWallet,
    WalletContextState,
} from "@solana/wallet-adapter-react";
import axios from "axios";
import { FaAnchor } from "react-icons/fa";
import { ServerCubePlacement } from "../../../global_architecture/cube_model/cube_model";
import {
    getDefaultAddresses,
    placeCube,
    removeCube,
} from "../../../global_chain/chain_methods";
import { BASE_URL } from "../../../global_networking/constants";
import { Cubed } from "../../../global_types/cubed";
import * as anchor from "@project-serum/anchor";
import {
    canvasTimeToBNAndBuffer,
    getCanvasInfo,
    getMintInfo,
} from "../../../global_api/helpers";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
    TOKEN_ACCOUNT_SEED_PREFIX,
    TOKEN_METADATA_PROGRAM_ID,
} from "../../../global_chain/chain_constants";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { programs } from "@metaplex/js";

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

        // TODO: Probably have better error handling here...
        await axios.post(`${BASE_URL}/queue_canvas_update`, {
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

export async function getMoreCubes(
    provider: Provider,
    program: Program<Cubed>,
    numCubes: number,
    canvasTime: number
) {
    /* Strategy here is to update this bitch on solana, and then just tell the server to normalize parameters against what's on chain */
    const { canvas_time, canvas_pda, canvas_bump } = await getCanvasInfo(
        canvasTime,
        program.programId
    );

    const { master_pda, master_bump } = await getDefaultAddresses(program);

    await program.rpc.buyCubes(
        master_bump,
        canvas_bump,
        canvas_time,
        numCubes,
        {
            accounts: {
                buyer: provider.wallet.publicKey,
                cubedMaster: master_pda,
                canvas: canvas_pda,
                systemProgram: SystemProgram.programId,
            },
        }
    );
}

export async function finishMosaic(
    provider: Provider,
    program: Program<Cubed>,
    canvasTime: number
) {
    const { canvas_time, canvas_pda, canvas_bump, canvas_time_buffer } =
        await getCanvasInfo(canvasTime, program.programId);
    const { master_pda, master_bump } = await getDefaultAddresses(program);
    const { mint_pda, mint_bump } = await getMintInfo(
        canvasTime,
        program.programId
    );

    const [token_pda, token_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(
                anchor.utils.bytes.utf8.encode(TOKEN_ACCOUNT_SEED_PREFIX)
            ),
            canvas_time_buffer,
            provider.wallet.publicKey.toBytes(),
        ],
        program.programId
    );

    const token_metadata_program_id = new anchor.web3.PublicKey(
        TOKEN_METADATA_PROGRAM_ID
    );

    const [metadata_pda] = await PublicKey.findProgramAddress(
        [
            Buffer.from(
                anchor.utils.bytes.utf8.encode(
                    programs.metadata.MetadataProgram.PREFIX
                )
            ),
            token_metadata_program_id.toBuffer(),
            mint_pda.toBuffer(),
        ],
        token_metadata_program_id
    );

    console.log("Calling mint on chain");

    await program.rpc.mintMosaic(
        master_bump,
        canvas_bump,
        mint_bump,
        token_bump,
        canvas_time,
        {
            accounts: {
                tokenMetadataProgram: token_metadata_program_id,
                metadata: metadata_pda,
                artist: provider.wallet.publicKey,
                cubedMaster: master_pda,
                canvas: canvas_pda,
                tokenAccount: token_pda,
                mint: mint_pda,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            },
        }
    );

    console.log("Calling mint on server");

    /* Now we're going to let the server know that everything has finished up... */
    await axios.post(`${BASE_URL}/finish_mosaic`, {
        time: canvasTime,
    });

    console.log("Finished everywhere");
}
