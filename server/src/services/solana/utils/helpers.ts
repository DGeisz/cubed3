import * as anchor from "@project-serum/anchor";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CANVAS_SEED,
  MINT_SEED_PREFIX,
  TOKEN_ACCOUNT_SEED_PREFIX,
} from "../constants";

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

export async function getTokenMaster(
  provider: anchor.Provider,
  canvasTime: number,
  programId: PublicKey
) {
  const { mint_pda } = await getMintInfo(canvasTime, programId);

  const pair = Keypair.generate();

  const tokenMaster = new Token(
    provider.connection,
    mint_pda,
    TOKEN_PROGRAM_ID,
    pair
  );

  return tokenMaster;
}

export async function getTokenOwnerInfo(
  canvasTime: number,
  ownerKey: PublicKey,
  program: PublicKey
) {
  const { buffer: canvas_time_buffer } = canvasTimeToBNAndBuffer(canvasTime);

  const [token_pda, token_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(TOKEN_ACCOUNT_SEED_PREFIX)),
      canvas_time_buffer,
      ownerKey.toBytes(),
    ],
    program
  );

  return { token_pda, token_bump };
}
