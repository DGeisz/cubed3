import * as anchor from "@project-serum/anchor";
import { sha256 } from "@ethersproject/sha2";
import { CubePlacement } from "..";

const MAX_ALGO_LEN = 512;
const two_16_div_2 = 2 ** 15;

const COLLECTION_NAME_BYTE_LEN = 32;
export function collectionStringToBytes(name: string): Buffer {
  const c_bytes = anchor.utils.bytes.utf8.encode(name);
  const c_suffix = new Uint8Array(
    new Array(COLLECTION_NAME_BYTE_LEN - c_bytes.length).fill(0)
  );

  return Buffer.concat([c_bytes, c_suffix]);
}

enum MosaicAction {
  PlaceCube = 0,
  RemoveCube = 1,
}

type CubeSyntaxTurn = number;

export function encodePosition(pos: number): number {
  return two_16_div_2 + pos;
}

export function decodePosition(en_pos: number): number {
  return en_pos - two_16_div_2;
}

export function extendAlgo(algo: CubeSyntaxTurn[]): CubeSyntaxTurn[] {
  /* Copy this so we don't have a bunch of zeros where we don't want them */
  algo = [...algo];

  const zeroLen = MAX_ALGO_LEN - algo.length;
  const zeros = new Array(zeroLen).fill(0);
  algo.push(...zeros);

  return algo;
}

export function sha256ByteBash(buff: Buffer): Uint8Array {
  let hash = sha256(new Uint8Array(buff)).slice(2);
  let publicKeyBytes = new anchor.BN(hash, 16).toArray(undefined, 32);

  return new Uint8Array(publicKeyBytes);
}

export function placeCubeNextHash(
  algo: CubeSyntaxTurn[],
  x: number,
  y: number,
  lastHash: Uint8Array
): Uint8Array {
  if (algo.length > MAX_ALGO_LEN) {
    throw new Error("Algo length is greater than maximum!");
  }

  algo = extendAlgo(algo);

  const action = new anchor.BN(MosaicAction.PlaceCube).toBuffer("le", 1);

  const algoBuffer = new Uint8Array(algo);
  const xBuffer = new anchor.BN(x).toBuffer("le", 2);
  const yBuffer = new anchor.BN(y).toBuffer("le", 2);

  let buffer = Buffer.alloc(0);

  for (const buf of [action, algoBuffer, xBuffer, yBuffer, lastHash]) {
    buffer = Buffer.concat([buffer, buf]);
  }

  return sha256ByteBash(buffer);
}

export function removeCubeNextHash(x: number, y: number, lastHash: Uint8Array) {
  const action = new anchor.BN(MosaicAction.RemoveCube).toBuffer("le", 1);
  const xBuffer = new anchor.BN(x).toBuffer("le", 2);
  const yBuffer = new anchor.BN(y).toBuffer("le", 2);

  let buffer = Buffer.alloc(0);

  for (const buf of [action, xBuffer, yBuffer, lastHash]) {
    buffer = Buffer.concat([buffer, buf]);
  }

  return sha256ByteBash(buffer);
}

export function getCanvasHashFromPlacements(
  cubePlacements: CubePlacement[],
  initHash: Uint8Array
): Uint8Array {
  let currHash = initHash;

  for (const placement of cubePlacements) {
    const { x, y } = placement;

    const xEn = encodePosition(x);
    const yEn = encodePosition(y);

    /* Whether a cube was added or removed  */
    if (placement.created) {
      currHash = placeCubeNextHash(placement.algo, xEn, yEn, currHash);
    } else {
      currHash = removeCubeNextHash(xEn, yEn, currHash);
    }
  }

  return currHash;
}
