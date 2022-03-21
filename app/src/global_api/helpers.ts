import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { CANVAS_SEED } from "../global_chain/chain_constants";

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
