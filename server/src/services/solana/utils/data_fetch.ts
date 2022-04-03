import { Cubed } from "../types/cubed";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  CANVAS_SEED,
  LISTING_SEED_PREFIX,
  TOKEN_ACCOUNT_SEED_PREFIX,
} from "../constants";
import { CubedSolanaProgram } from "../init";
import { CubeSyntaxTurn } from "../../../models/cubed/cube_model";

interface Canvas {
  artist: PublicKey;
  price: anchor.BN;
  collectionName: number[];
  cubesInCanvas: number;
  finished: boolean;
  initHash: number[];
  lastHash: number[];
  unusedCubes: number;
}

export function getCanvasInfo(time: number) {
  const canvas_time = new anchor.BN(time);
  const canvas_time_buffer = canvas_time.toArrayLike(Buffer, "le", 8);

  return {
    canvas_time,
    canvas_time_buffer,
  };
}

export async function getCanvas(time: number): Promise<Canvas> {
  const canvas_time_bn = new anchor.BN(time);
  const canvas_time_buffer = canvas_time_bn.toArrayLike(Buffer, "le", 8);

  const [canvas_pda] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
      canvas_time_buffer,
    ],
    CubedSolanaProgram.programId
  );

  return await CubedSolanaProgram.account.cubedCanvas.fetch(canvas_pda);
}

export interface MosaicListing {
  price: anchor.BN;
  owner: PublicKey;
}

export async function getMosaicListing(time: number): Promise<MosaicListing> {
  const canvas_time_bn = new anchor.BN(time);
  const canvas_time_buffer = canvas_time_bn.toArrayLike(Buffer, "le", 8);

  const [listing_pda] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(LISTING_SEED_PREFIX)),
      canvas_time_buffer,
    ],
    CubedSolanaProgram.programId
  );

  return await CubedSolanaProgram.account.mosaicListing.fetch(listing_pda);
}

export async function getTokenAccount(time: number, owner: PublicKey) {
  const { canvas_time, canvas_time_buffer } = getCanvasInfo(time);

  const [token_pda, token_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(TOKEN_ACCOUNT_SEED_PREFIX)),
      canvas_time_buffer,
      owner.toBytes(),
    ],
    CubedSolanaProgram.programId
  );

  // TODO: Need to actually fetch the token account!!
}
