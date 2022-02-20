import { Cubed } from "../types/cubed";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { CANVAS_SEED } from "../constants";
import { CubedSolanaProgram } from "../init";

interface Canvas {
  artist: PublicKey;
  collectionName: number[];
  cubesInCanvas: number;
  finished: boolean;
  initHash: number[];
  lastHash: number[];
  unusedCubes: number;
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
