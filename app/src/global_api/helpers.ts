import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
    AUCTION_SEED_PREFIX,
    CANVAS_SEED,
    ESCROW_ACCOUNT_SEED_PREFIX,
    LISTING_SEED_PREFIX,
    MINT_SEED_PREFIX,
    OFFER_SEED_PREFIX,
} from "../global_chain/chain_constants";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export function getTokenMaster(provider: anchor.Provider) {
    const pair = Keypair.generate();

    const tokenMaster = new Token(
        provider.connection,
        pair.publicKey,
        TOKEN_PROGRAM_ID,
        pair
    );

    return tokenMaster;
}

export function numToBNAndBuffer(n: number, numBytes: number) {
    const bn = new anchor.BN(n);
    const buffer = bn.toArrayLike(Buffer, "le", numBytes);

    return {
        bn,
        buffer,
    };
}

export function canvasTimeToBNAndBuffer(canvasTime: number) {
    return numToBNAndBuffer(canvasTime, 8);
}

export async function getCanvasInfo(canvasTime: number, programId: PublicKey) {
    const { bn: canvas_time, buffer: canvas_time_buffer } =
        canvasTimeToBNAndBuffer(canvasTime);

    const [canvas_pda, canvas_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
            canvas_time_buffer,
        ],
        programId
    );

    return {
        canvas_time,
        canvas_time_buffer,
        canvas_pda,
        canvas_bump,
    };
}

export async function getMintInfo(canvasTime: number, programId: PublicKey) {
    const { canvas_time_buffer } = await getCanvasInfo(canvasTime, programId);

    const [mint_pda, mint_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(MINT_SEED_PREFIX)),
            canvas_time_buffer,
        ],
        programId
    );

    return {
        mint_pda,
        mint_bump,
    };
}

export async function getMosaicListingInfo(
    canvasTime: number,
    programId: PublicKey
) {
    const { buffer: canvas_time_buffer } = canvasTimeToBNAndBuffer(canvasTime);

    const [listing_pda, listing_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(LISTING_SEED_PREFIX)),
            canvas_time_buffer,
        ],
        programId
    );

    return {
        listing_pda,
        listing_bump,
    };
}

export async function getListingEscrowAccountInfo(
    canvasTime: number,
    programId: PublicKey
) {
    const { buffer: canvas_time_buffer } = canvasTimeToBNAndBuffer(canvasTime);

    const [escrow_pda, escrow_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(
                anchor.utils.bytes.utf8.encode(ESCROW_ACCOUNT_SEED_PREFIX)
            ),
            canvas_time_buffer,
        ],
        programId
    );

    return {
        escrow_pda,
        escrow_bump,
    };
}

export async function getListingOfferInfo(
    canvasTime: number,
    programId: PublicKey
) {
    const { buffer: canvas_time_buffer } = canvasTimeToBNAndBuffer(canvasTime);

    const [offer_pda, offer_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(OFFER_SEED_PREFIX)),
            canvas_time_buffer,
        ],
        programId
    );

    return {
        offer_pda,
        offer_bump,
    };
}

export async function getAuctionInfo(canvasTime: number, program: PublicKey) {
    const { buffer: canvas_time_buffer } = canvasTimeToBNAndBuffer(canvasTime);

    const [auction_pda, auction_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(AUCTION_SEED_PREFIX)),
            canvas_time_buffer,
        ],
        program
    );

    return {
        auction_pda,
        auction_bump,
    };
}

export async function getAuctionEscrowAccountInfo(
    canvasTime: number,
    program: PublicKey
) {
    const { buffer: canvas_time_buffer } = canvasTimeToBNAndBuffer(canvasTime);

    const [escrow_pda, escrow_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(
                anchor.utils.bytes.utf8.encode(ESCROW_ACCOUNT_SEED_PREFIX)
            ),
            canvas_time_buffer,
        ],
        program
    );

    return {
        escrow_pda,
        escrow_bump,
    };
}
