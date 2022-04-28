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
import { axiosPost, BASE_URL } from "../../../global_networking/constants";
import { Cubed } from "../../../global_types/cubed";
import * as anchor from "@project-serum/anchor";
import {
    canvasTimeToBNAndBuffer,
    getCanvasInfo,
    getListingEscrowAccountInfo,
    getListingOfferInfo,
    getMintInfo,
    getMosaicListingInfo,
    getTokenOwnerInfo,
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

export async function listMosaic(
    provider: Provider,
    program: Program<Cubed>,
    canvasTime: number,
    price: number
) {
    const { master_bump, master_pda } = await getDefaultAddresses(program);

    const { escrow_pda, escrow_bump } = await getListingEscrowAccountInfo(
        canvasTime,
        program.programId
    );

    const { mint_bump, mint_pda } = await getMintInfo(
        canvasTime,
        program.programId
    );

    const { listing_pda, listing_bump } = await getMosaicListingInfo(
        canvasTime,
        program.programId
    );

    const { token_bump, token_pda } = await getTokenOwnerInfo(
        canvasTime,
        provider.wallet.publicKey,
        program.programId
    );

    const { canvas_time } = await getCanvasInfo(canvasTime, program.programId);

    await program.rpc.listMosaic(
        master_bump,
        mint_bump,
        token_bump,
        escrow_bump,
        listing_bump,
        canvas_time,
        new anchor.BN(price),
        {
            accounts: {
                owner: provider.wallet.publicKey,
                cubedMaster: master_pda,
                tokenAccount: token_pda,
                escrowAccount: escrow_pda,
                mint: mint_pda,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                listing: listing_pda,
                rent: SYSVAR_RENT_PUBKEY,
            },
        }
    );

    await axiosPost("check_listing", { time: canvasTime });
}

export async function changeListing(
    provider: Provider,
    program: Program<Cubed>,
    canvasTime: number,
    price: number
) {
    const { escrow_pda, escrow_bump } = await getListingEscrowAccountInfo(
        canvasTime,
        program.programId
    );

    const { listing_pda, listing_bump } = await getMosaicListingInfo(
        canvasTime,
        program.programId
    );

    const { canvas_time } = await getCanvasInfo(canvasTime, program.programId);

    await program.rpc.changeListing(
        escrow_bump,
        listing_bump,
        canvas_time,
        new anchor.BN(price),
        {
            accounts: {
                owner: provider.wallet.publicKey,
                listing: listing_pda,
                escrowAccount: escrow_pda,
                systemProgram: SystemProgram.programId,
            },
        }
    );

    await axiosPost("check_listing", { time: canvasTime });
}

export async function removeListing(
    provider: Provider,
    program: Program<Cubed>,
    canvasTime: number
) {
    const { master_bump, master_pda } = await getDefaultAddresses(program);

    const { escrow_pda, escrow_bump } = await getListingEscrowAccountInfo(
        canvasTime,
        program.programId
    );

    const { listing_pda, listing_bump } = await getMosaicListingInfo(
        canvasTime,
        program.programId
    );

    const { token_bump, token_pda } = await getTokenOwnerInfo(
        canvasTime,
        provider.wallet.publicKey,
        program.programId
    );

    const { canvas_time } = await getCanvasInfo(canvasTime, program.programId);

    await program.rpc.removeListing(
        master_bump,
        token_bump,
        escrow_bump,
        listing_bump,
        canvas_time,
        {
            accounts: {
                owner: provider.wallet.publicKey,
                cubedMaster: master_pda,
                listing: listing_pda,
                escrowAccount: escrow_pda,
                tokenAccount: token_pda,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            },
        }
    );

    await axiosPost("check_listing", { time: canvasTime });
}

export async function buyMosaic(
    provider: Provider,
    program: Program<Cubed>,
    owner: PublicKey,
    canvasTime: number
) {
    const { master_bump, master_pda } = await getDefaultAddresses(program);

    const { escrow_pda, escrow_bump } = await getListingEscrowAccountInfo(
        canvasTime,
        program.programId
    );

    const { mint_bump, mint_pda } = await getMintInfo(
        canvasTime,
        program.programId
    );

    const { listing_pda, listing_bump } = await getMosaicListingInfo(
        canvasTime,
        program.programId
    );

    const { token_bump, token_pda } = await getTokenOwnerInfo(
        canvasTime,
        provider.wallet.publicKey,
        program.programId
    );

    const { canvas_time } = await getCanvasInfo(canvasTime, program.programId);

    await program.rpc.buyMosaic(
        master_bump,
        mint_bump,
        token_bump,
        escrow_bump,
        listing_bump,
        canvas_time,
        {
            accounts: {
                cubedMaster: master_pda,
                buyer: provider.wallet.publicKey,
                owner,
                mint: mint_pda,
                listing: listing_pda,
                buyerAccount: token_pda,
                escrowAccount: escrow_pda,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            },
        }
    );

    const a = await axiosPost("buy_mosaic", {
        time: canvasTime,
        buyer: provider.wallet.publicKey.toString(),
    });

    console.log(a.data);
}
