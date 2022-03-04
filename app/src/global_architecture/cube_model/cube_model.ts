import * as THREE from "three";
import { Vector3Tuple } from "three";
import _ from "underscore";
import { cubeSideLength } from "../../global_constants/cube_dimensions";
import {
    applyFullCubeSequenceToAlgo,
    cleanAlgorithm,
    getPieceTypeFromPiece,
    invertAlgo,
} from "./utils/utils";
import { sha256 } from "@ethersproject/sha2";
import * as anchor from "@project-serum/anchor";
import { CubePlacement } from "../../pages/test";

export interface ServerCubePlacement {
    created: boolean;
    algo: number[];
    x: number;
    y: number;
}

export interface ServerCanvas {
    artist: string;
    price: number;
    time: number;
    collectionName: string;
    finalCubes: ServerCubePlacement[];
    /* We tell the server what the next intension for the
  state of the canvas is so that we prevent data loss */
    intendedCubes: ServerCubePlacement[];
}

export enum FaceOrientation {
    U,
    D,
    F,
    B,
    L,
    R,
}

export function faceOrientationToString(o: FaceOrientation): string {
    switch (o) {
        case FaceOrientation.U:
            return "U";
        case FaceOrientation.D:
            return "D";
        case FaceOrientation.F:
            return "F";
        case FaceOrientation.B:
            return "B";
        case FaceOrientation.L:
            return "L";
        case FaceOrientation.R:
            return "R";
    }
}

export enum PieceType {
    Corner,
    Center,
    Edge,
}

export interface FocusedSticker {
    pieceIndex: number;
    orientation: FaceOrientation;
}

export const blankFocusedSticker: FocusedSticker = {
    pieceIndex: -1,
    orientation: FaceOrientation.F,
};

export enum StickerColor {
    Blue = 1,
    Green,
    Yellow,
    White,
    Red,
    Orange,
    HoverViolet,
    SourceMint,
    TargetBlue,
}

export enum StickerColorHex {
    Blue = "#001c5c",
    Green = "#075903",
    Yellow = "#b39702",
    White = "#FFFFFF",
    Red = "#B90000",
    Orange = "#c92200", //"#FF5900",
    HoverViolet = "#f480ff",
    TargetBlue = "#266bff",
    SourceMint = "#0dff2c",
}

export enum StickerColorRegularHex {
    Blue = "#0059bf",
    Green = "#02b044", //"#009B48",
    Yellow = "#eaff00",
    White = "#FFFFFF",
    Red = "#B90000",
    Orange = "#FF5900",
}

export function stickerColorToHex(color: StickerColor): StickerColorHex {
    switch (color) {
        case StickerColor.Blue:
            return StickerColorHex.Blue;
        case StickerColor.Green:
            return StickerColorHex.Green;
        case StickerColor.Yellow:
            return StickerColorHex.Yellow;
        case StickerColor.White:
            return StickerColorHex.White;
        case StickerColor.Red:
            return StickerColorHex.Red;
        case StickerColor.Orange:
            return StickerColorHex.Orange;
        case StickerColor.TargetBlue:
            return StickerColorHex.TargetBlue;
        case StickerColor.HoverViolet:
            return StickerColorHex.HoverViolet;
        case StickerColor.SourceMint:
            return StickerColorHex.SourceMint;
    }
}

export function stickerColorToRegularHex(
    color: StickerColor
): StickerColorRegularHex {
    switch (color) {
        case StickerColor.Blue:
            return StickerColorRegularHex.Blue;
        case StickerColor.Green:
            return StickerColorRegularHex.Green;
        case StickerColor.Yellow:
            return StickerColorRegularHex.Yellow;
        case StickerColor.White:
            return StickerColorRegularHex.White;
        case StickerColor.Red:
            return StickerColorRegularHex.Red;
        case StickerColor.Orange:
            return StickerColorRegularHex.Orange;
    }

    return StickerColorRegularHex.Blue;
}

export interface Sticker {
    color: StickerColor;
    baseOrientation: FaceOrientation;
}

export interface CubeModelPiece {
    position: THREE.Vector3;
    lastFixedPosition: THREE.Vector3;
    quaternion: THREE.Quaternion;
    lastFixedQuaternion: THREE.Quaternion;
    stickers: Sticker[];
}

function copyCubePiece(piece: CubeModelPiece): CubeModelPiece {
    const newPiece = {
        position: new THREE.Vector3(),
        lastFixedPosition: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
        lastFixedQuaternion: new THREE.Quaternion(),
        stickers: piece.stickers,
    };

    newPiece.position.copy(piece.position);
    newPiece.lastFixedPosition.copy(piece.lastFixedPosition);
    newPiece.quaternion.copy(piece.quaternion);
    newPiece.lastFixedQuaternion.copy(piece.lastFixedQuaternion);

    return newPiece;
}

export enum CubeSyntaxTurn {
    U = 1,
    UP,
    u,
    up,
    D,
    DP,
    d,
    dp,
    F,
    FP,
    f,
    fp,
    B,
    BP,
    b,
    bp,
    R,
    RP,
    r,
    rp,
    L,
    LP,
    l,
    lp,
    x,
    xp,
    y,
    yp,
    z,
    zp,
}

const MAX_ALGO_LEN = 512;

export function extendAlgo(algo: CubeSyntaxTurn[]): CubeSyntaxTurn[] {
    const zeroLen = MAX_ALGO_LEN - algo.length;
    const zeros = new Array(zeroLen).fill(0);
    algo.push(...zeros);

    return algo;
}

enum MosaicAction {
    PlaceCube = 0,
    RemoveCube = 1,
}

export function sha256ByteBash(buff: Buffer): Uint8Array {
    let hash = sha256(new Uint8Array(buff)).slice(2);
    let publicKeyBytes = new anchor.BN(hash, 16).toArray(undefined, 32);

    return new Uint8Array(publicKeyBytes);
}

const two_16_div_2 = 2 ** 15;
export function encodePosition(pos: number): number {
    return two_16_div_2 + pos;
}

export function decodePosition(en_pos: number): number {
    return en_pos - two_16_div_2;
}

const COLLECTION_NAME_BYTE_LEN = 32;
export function collectionStringToBytes(name: string): Buffer {
    const c_bytes = anchor.utils.bytes.utf8.encode(name);
    const c_suffix = new Uint8Array(
        new Array(COLLECTION_NAME_BYTE_LEN - c_bytes.length).fill(0)
    );

    return Buffer.concat([c_bytes, c_suffix]);
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

// export function algorithmToBuffer(algo: CubeSyntaxTurn[]): Uint8Array {
//     return new Uint8Array();
// }

export const x = new THREE.Vector3(1, 0, 0);
export const negX = new THREE.Vector3(-1, 0, 0);
export const y = new THREE.Vector3(0, 1, 0);
export const negY = new THREE.Vector3(0, -1, 0);
export const z = new THREE.Vector3(0, 0, 1);
export const negZ = new THREE.Vector3(0, 0, -1);

export function correctStickerVector(vec: THREE.Vector3) {
    const absX = Math.abs(vec.x);

    if (absX < 0.5) {
        vec.x = 0;
    } else {
        vec.x = vec.x / absX;
    }

    const absY = Math.abs(vec.y);

    if (absY < 0.5) {
        vec.y = 0;
    } else {
        vec.y = vec.y / absY;
    }

    const absZ = Math.abs(vec.z);

    if (absZ < 0.5) {
        vec.z = 0;
    } else {
        vec.z = vec.z / absZ;
    }
}

export function faceOrientationToVector(
    orientation: FaceOrientation
): THREE.Vector3 {
    const vec = new THREE.Vector3();

    switch (orientation) {
        case FaceOrientation.U: {
            vec.copy(y);
            break;
        }
        case FaceOrientation.D: {
            vec.copy(negY);
            break;
        }
        case FaceOrientation.R: {
            vec.copy(x);
            break;
        }
        case FaceOrientation.L: {
            vec.copy(negX);
            break;
        }
        case FaceOrientation.F: {
            vec.copy(z);
            break;
        }
        case FaceOrientation.B: {
            vec.copy(negZ);
            break;
        }
    }

    return vec;
}

export interface BoundingBox {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
}

export class CubeModel {
    readonly pieces: CubeModelPiece[];
    algorithm: CubeSyntaxTurn[];

    constructor(oldModel?: CubeModel) {
        if (oldModel) {
            this.pieces = oldModel.pieces.map((piece) => copyCubePiece(piece));
            this.algorithm = oldModel.algorithm;
        } else {
            this.pieces = [];
            this.algorithm = [];

            for (const x of _.range(-1, 2)) {
                for (const y of _.range(-1, 2)) {
                    for (const z of _.range(-1, 2)) {
                        if (x || y || z) {
                            const stickers: Sticker[] = [];

                            if (z === -1) {
                                // stickers.push(initBVec());
                                stickers.push({
                                    color: StickerColor.Blue,
                                    baseOrientation: FaceOrientation.B,
                                });
                            } else if (z === 1) {
                                // stickers.push(initFVec());
                                stickers.push({
                                    color: StickerColor.Green,
                                    baseOrientation: FaceOrientation.F,
                                });
                            }

                            if (y === -1) {
                                // stickers.push(initDVec());
                                stickers.push({
                                    color: StickerColor.Yellow,
                                    baseOrientation: FaceOrientation.D,
                                });
                            } else if (y === 1) {
                                // stickers.push(initUVec());
                                stickers.push({
                                    color: StickerColor.White,
                                    baseOrientation: FaceOrientation.U,
                                });
                            }

                            if (x === -1) {
                                // stickers.push(initLVec());
                                stickers.push({
                                    color: StickerColor.Orange,
                                    baseOrientation: FaceOrientation.L,
                                });
                            } else if (x === 1) {
                                // stickers.push(initRVec());
                                stickers.push({
                                    color: StickerColor.Red,
                                    baseOrientation: FaceOrientation.R,
                                });
                            }

                            this.pieces.push({
                                stickers,
                                quaternion: new THREE.Quaternion(),
                                lastFixedQuaternion: new THREE.Quaternion(),
                                position: new THREE.Vector3(x, y, z),
                                lastFixedPosition: new THREE.Vector3(x, y, z),
                            });
                        }
                    }
                }
            }
        }
    }

    getUPieces(doubleLayer?: boolean): CubeModelPiece[] {
        return this.pieces.filter((piece) => {
            return piece.lastFixedPosition.y > (doubleLayer ? -0.5 : 0.5);
        });
    }

    getDPieces(doubleLayer?: boolean): CubeModelPiece[] {
        return this.pieces.filter((piece) => {
            return piece.lastFixedPosition.y < (doubleLayer ? 0.5 : -0.5);
        });
    }

    getFPieces(doubleLayer?: boolean): CubeModelPiece[] {
        return this.pieces.filter((piece) => {
            return piece.lastFixedPosition.z > (doubleLayer ? -0.5 : 0.5);
        });
    }

    getBPieces(doubleLayer?: boolean): CubeModelPiece[] {
        return this.pieces.filter((piece) => {
            return piece.lastFixedPosition.z < (doubleLayer ? 0.5 : -0.5);
        });
    }

    getRPieces(doubleLayer?: boolean): CubeModelPiece[] {
        return this.pieces.filter((piece) => {
            return piece.lastFixedPosition.x > (doubleLayer ? -0.5 : 0.5);
        });
    }

    getLPieces(doubleLayer?: boolean): CubeModelPiece[] {
        return this.pieces.filter((piece) => {
            return piece.lastFixedPosition.x < (doubleLayer ? 0.5 : -0.5);
        });
    }

    applyCubeTurn(cubeTurn: CubeSyntaxTurn) {
        let direction: THREE.Vector3 = new THREE.Vector3();
        let pieces: CubeModelPiece[] = [];

        const newAlgo = [...this.algorithm];
        newAlgo.push(cubeTurn);
        this.algorithm = cleanAlgorithm(newAlgo);

        switch (cubeTurn) {
            case CubeSyntaxTurn.U: {
                direction = negY;
                pieces = this.getUPieces();
                break;
            }
            case CubeSyntaxTurn.u: {
                direction = negY;
                pieces = this.getUPieces(true);
                break;
            }
            case CubeSyntaxTurn.y: {
                direction = negY;
                pieces = this.pieces;
                break;
            }
            case CubeSyntaxTurn.UP: {
                direction = y;
                pieces = this.getUPieces();
                break;
            }
            case CubeSyntaxTurn.up: {
                direction = y;
                pieces = this.getUPieces(true);
                break;
            }
            case CubeSyntaxTurn.yp: {
                direction = y;
                pieces = this.pieces;
                break;
            }
            case CubeSyntaxTurn.D: {
                direction = y;
                pieces = this.getDPieces();
                break;
            }
            case CubeSyntaxTurn.d: {
                direction = y;
                pieces = this.getDPieces(true);
                break;
            }
            case CubeSyntaxTurn.DP: {
                direction = negY;
                pieces = this.getDPieces();
                break;
            }
            case CubeSyntaxTurn.dp: {
                direction = negY;
                pieces = this.getDPieces(true);
                break;
            }
            case CubeSyntaxTurn.F: {
                direction = negZ;
                pieces = this.getFPieces();
                break;
            }
            case CubeSyntaxTurn.f: {
                direction = negZ;
                pieces = this.getFPieces(true);
                break;
            }
            case CubeSyntaxTurn.z: {
                direction = negZ;
                pieces = this.pieces;
                break;
            }
            case CubeSyntaxTurn.FP: {
                direction = z;
                pieces = this.getFPieces();
                break;
            }
            case CubeSyntaxTurn.fp: {
                direction = z;
                pieces = this.getFPieces(true);
                break;
            }
            case CubeSyntaxTurn.zp: {
                direction = z;
                pieces = this.pieces;
                break;
            }
            case CubeSyntaxTurn.B: {
                direction = z;
                pieces = this.getBPieces();
                break;
            }
            case CubeSyntaxTurn.b: {
                direction = z;
                pieces = this.getBPieces(true);
                break;
            }
            case CubeSyntaxTurn.BP: {
                direction = negZ;
                pieces = this.getBPieces();
                break;
            }
            case CubeSyntaxTurn.bp: {
                direction = negZ;
                pieces = this.getBPieces(true);
                break;
            }
            case CubeSyntaxTurn.R: {
                direction = negX;
                pieces = this.getRPieces();
                break;
            }
            case CubeSyntaxTurn.x: {
                direction = negX;
                pieces = this.pieces;
                break;
            }
            case CubeSyntaxTurn.r: {
                direction = negX;
                pieces = this.getRPieces(true);
                break;
            }
            case CubeSyntaxTurn.RP: {
                direction = x;
                pieces = this.getRPieces();
                break;
            }
            case CubeSyntaxTurn.rp: {
                direction = x;
                pieces = this.getRPieces(true);
                break;
            }
            case CubeSyntaxTurn.xp: {
                direction = x;
                pieces = this.pieces;
                break;
            }
            case CubeSyntaxTurn.L: {
                direction = x;
                pieces = this.getLPieces();
                break;
            }
            case CubeSyntaxTurn.l: {
                direction = x;
                pieces = this.getLPieces(true);
                break;
            }
            case CubeSyntaxTurn.LP: {
                direction = negX;
                pieces = this.getLPieces();
                break;
            }
            case CubeSyntaxTurn.lp: {
                direction = negX;
                pieces = this.getLPieces(true);
                break;
            }
        }

        const tempQuaternion = new THREE.Quaternion();

        for (const piece of pieces) {
            tempQuaternion.setFromAxisAngle(direction, Math.PI / 2);
            piece.lastFixedQuaternion.premultiply(tempQuaternion);
            piece.quaternion.copy(piece.lastFixedQuaternion);

            piece.lastFixedPosition.applyQuaternion(tempQuaternion);
            correctStickerVector(piece.lastFixedPosition);
            piece.position.copy(piece.lastFixedPosition);
        }
    }

    static turnsToString(turns: CubeSyntaxTurn[]): string {
        let str: string[] = [];
        const e = Object.entries(CubeSyntaxTurn);

        for (const turn of turns) {
            const i = e.find((t) => t[1] === turn);
            if (i) {
                str.push(i[0]);
            }
        }

        str = str.map((s) => s.replace(/[pP]/g, "'"));

        const final: string[] = [];
        let finalIndex = 0;

        while (finalIndex < str.length) {
            const curr = str[finalIndex];
            const next = str[finalIndex + 1];

            if (curr === next) {
                final.push(`${curr}2`);
                finalIndex += 2;
            } else {
                final.push(curr);
                finalIndex += 1;
            }
        }

        return final.join(" ");
    }

    static algoStringToTurns(algo: string): CubeSyntaxTurn[] {
        const tokens = algo
            .split(" ")
            .map((t) => t.trim())
            .filter((t) => !!t);

        const parsedTurns: CubeSyntaxTurn[] = [];

        for (let token of tokens) {
            /* Look for double turn (ie u2) */
            let isDouble = false;
            if (token[token.length - 1] === "2") {
                isDouble = true;
                token = token.substring(0, token.length - 1);
            }

            /* Look for prime */
            let isPrime = false;
            if (token[token.length - 1] === "'") {
                isPrime = true;
                token = token.substring(0, token.length - 1);
            }

            let nextTurn: CubeSyntaxTurn | undefined = undefined;

            /* Now match on remaining string */
            switch (token) {
                case "U": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.U;
                    } else {
                        nextTurn = CubeSyntaxTurn.UP;
                    }
                    break;
                }
                case "u": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.u;
                    } else {
                        nextTurn = CubeSyntaxTurn.up;
                    }
                    break;
                }
                case "D": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.D;
                    } else {
                        nextTurn = CubeSyntaxTurn.DP;
                    }
                    break;
                }
                case "d": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.d;
                    } else {
                        nextTurn = CubeSyntaxTurn.dp;
                    }
                    break;
                }
                case "F": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.F;
                    } else {
                        nextTurn = CubeSyntaxTurn.FP;
                    }
                    break;
                }
                case "f": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.f;
                    } else {
                        nextTurn = CubeSyntaxTurn.fp;
                    }
                    break;
                }
                case "B": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.B;
                    } else {
                        nextTurn = CubeSyntaxTurn.BP;
                    }
                    break;
                }
                case "b": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.b;
                    } else {
                        nextTurn = CubeSyntaxTurn.bp;
                    }
                    break;
                }
                case "R": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.R;
                    } else {
                        nextTurn = CubeSyntaxTurn.RP;
                    }
                    break;
                }
                case "r": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.r;
                    } else {
                        nextTurn = CubeSyntaxTurn.rp;
                    }
                    break;
                }
                case "L": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.L;
                    } else {
                        nextTurn = CubeSyntaxTurn.LP;
                    }
                    break;
                }
                case "l": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.l;
                    } else {
                        nextTurn = CubeSyntaxTurn.lp;
                    }
                    break;
                }
                case "x": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.x;
                    } else {
                        nextTurn = CubeSyntaxTurn.xp;
                    }
                    break;
                }
                case "y": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.y;
                    } else {
                        nextTurn = CubeSyntaxTurn.yp;
                    }
                    break;
                }
                case "z": {
                    if (!isPrime) {
                        nextTurn = CubeSyntaxTurn.z;
                    } else {
                        nextTurn = CubeSyntaxTurn.zp;
                    }
                    break;
                }
            }

            if (typeof nextTurn !== "undefined") {
                if (isDouble) {
                    parsedTurns.push(nextTurn, nextTurn);
                } else {
                    parsedTurns.push(nextTurn);
                }
            }
        }

        return parsedTurns;
    }

    /* Takes an algorithm like "R' D' R D" and applies 
    the corresponding algorithm */
    applyAlgorithm(algo: string) {
        const parsedTurns = CubeModel.algoStringToTurns(algo);
        this.applyAlgoTurns(parsedTurns);
    }

    applyAlgoTurns(algo: CubeSyntaxTurn[]) {
        for (const turn of algo) {
            this.applyCubeTurn(turn);
        }
    }

    getFaceTransformationSeq(
        source: FocusedSticker,
        target: FocusedSticker
    ): CubeSyntaxTurn[] {
        const cubeCopy = new CubeModel(this);

        const targetOrientationSequence: CubeSyntaxTurn[] = [];
        let targetStickerVec = cubeCopy.getStickerOrientation(target);

        while (!targetStickerVec.equals(negY)) {
            let cubeTurn: CubeSyntaxTurn | undefined = undefined;

            if (targetStickerVec.equals(x)) {
                cubeTurn = CubeSyntaxTurn.z;
            } else if (targetStickerVec.equals(negX)) {
                cubeTurn = CubeSyntaxTurn.zp;
            } else if (targetStickerVec.equals(z)) {
                cubeTurn = CubeSyntaxTurn.xp;
            } else if (targetStickerVec.equals(negZ)) {
                cubeTurn = CubeSyntaxTurn.x;
            } else if (targetStickerVec.equals(y)) {
                cubeTurn = CubeSyntaxTurn.x;
            }

            if (cubeTurn) {
                cubeCopy.applyCubeTurn(cubeTurn);
                targetOrientationSequence.push(cubeTurn);
            }

            targetStickerVec = cubeCopy.getStickerOrientation(target);
        }

        let derivedAlgorithm: CubeSyntaxTurn[] = [];
        let sourceStickerVec = cubeCopy.getStickerOrientation(source);

        while (!sourceStickerVec.equals(negY)) {
            let cubeTurn: CubeSyntaxTurn | undefined = undefined;

            if (sourceStickerVec.equals(x)) {
                cubeTurn = CubeSyntaxTurn.z;
            } else if (sourceStickerVec.equals(negX)) {
                cubeTurn = CubeSyntaxTurn.zp;
            } else if (sourceStickerVec.equals(z)) {
                cubeTurn = CubeSyntaxTurn.xp;
            } else if (sourceStickerVec.equals(negZ)) {
                cubeTurn = CubeSyntaxTurn.x;
            } else if (sourceStickerVec.equals(y)) {
                cubeTurn = CubeSyntaxTurn.x;
            }

            if (cubeTurn) {
                cubeCopy.applyCubeTurn(cubeTurn);
                derivedAlgorithm.push(cubeTurn);
            }

            sourceStickerVec = cubeCopy.getStickerOrientation(source);
        }

        derivedAlgorithm = cleanAlgorithm(derivedAlgorithm);

        // const a = CubeModel.turnsToString(derivedAlgorithm);
        // const c = CubeModel.turnsToString(targetOrientationSequence);
        // debugger;

        /* Now we want undo the full cube rotation seq needed
            to normalize the target in the beginning */
        const invertedSeq = invertAlgo(targetOrientationSequence);

        // debugger;

        derivedAlgorithm = applyFullCubeSequenceToAlgo(
            derivedAlgorithm,
            invertedSeq
        );

        const b = CubeModel.turnsToString(derivedAlgorithm);
        // debugger;

        return derivedAlgorithm;
    }

    getStickerOrientation = (sticker: FocusedSticker) => {
        const piece = this.pieces[sticker.pieceIndex];

        const stickerVec = faceOrientationToVector(sticker.orientation);
        stickerVec.applyQuaternion(piece.quaternion);
        correctStickerVector(stickerVec);

        return stickerVec;
    };

    getStickerTransformationSeq(
        source: FocusedSticker,
        target: FocusedSticker
    ): CubeSyntaxTurn[] {
        const cubeCopy = new CubeModel(this);

        /* Start out by getting the position and sticker orientation for 
        the source and the target */
        const sourcePiece = cubeCopy.pieces[source.pieceIndex];

        const sourcePosition = new THREE.Vector3();
        sourcePosition.copy(sourcePiece.position);
        const sourceStickerVec = faceOrientationToVector(source.orientation);
        sourceStickerVec.applyQuaternion(sourcePiece.quaternion);

        const sourcePieceType = getPieceTypeFromPiece(sourcePiece);
        const targetPiece = cubeCopy.pieces[target.pieceIndex];

        const targetPieceType = getPieceTypeFromPiece(targetPiece);

        /* Make sure these are both the same piece type
        and make sure that they aren't the same piece */
        if (targetPieceType === sourcePieceType) {
            /* Here's sequence of steps we take:
            1. Make sure that the target is in a normalized position
            2. Calculate the solution to get source to target
            3. Undo rotations required to normalize target
            */
            const isStickerNormal: (sticker: FocusedSticker) => boolean = (
                sticker: FocusedSticker
            ) => {
                const stickerVec = cubeCopy.getStickerOrientation(sticker);
                const piece = cubeCopy.pieces[sticker.pieceIndex];
                const pieceType = getPieceTypeFromPiece(piece);

                /* Sticker must be pointed down */
                if (!stickerVec.equals(negY)) {
                    return false;
                }

                /* Piece must be on D face */
                if (!(piece.position.y < 0)) {
                    return false;
                }

                switch (pieceType) {
                    /* Normalized corner piece is at FRD */
                    case PieceType.Corner: {
                        if (piece.position.z > 0 && piece.position.x > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    /* Normalized edge piece is at FD */
                    case PieceType.Edge: {
                        if (piece.position.z > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    /* Normalized center is at D */
                    case PieceType.Center: {
                        return true;
                    }
                }
            };

            const targetOrientationSequence: CubeSyntaxTurn[] = [];

            while (!isStickerNormal(target)) {
                const targetStickerVec = cubeCopy.getStickerOrientation(target);
                let cubeTurn: CubeSyntaxTurn | undefined = undefined;

                /* Check if the target is on the bottom */
                if (targetStickerVec.equals(negY)) {
                    /* If the sticker is a corner, we want it
                        at the intersection of F and R */
                    if (targetPieceType === PieceType.Corner) {
                        cubeTurn = CubeSyntaxTurn.y;
                    } else if (targetPieceType === PieceType.Edge) {
                        cubeTurn = CubeSyntaxTurn.y;
                    }
                } else if (targetStickerVec.equals(x)) {
                    cubeTurn = CubeSyntaxTurn.z;
                } else if (targetStickerVec.equals(negX)) {
                    cubeTurn = CubeSyntaxTurn.zp;
                } else if (targetStickerVec.equals(z)) {
                    cubeTurn = CubeSyntaxTurn.xp;
                } else if (targetStickerVec.equals(negZ)) {
                    cubeTurn = CubeSyntaxTurn.x;
                } else if (targetStickerVec.equals(y)) {
                    cubeTurn = CubeSyntaxTurn.x;
                }

                if (cubeTurn) {
                    cubeCopy.applyCubeTurn(cubeTurn);
                    targetOrientationSequence.push(cubeTurn);
                }
            }

            /* Ok, now the target should be normalized,
            so we can begin calculating the derived algorithm
             */
            let derivedAlgorithm: CubeSyntaxTurn[] = [];

            const applyTurns = (turns: CubeSyntaxTurn[]) => {
                for (const turn of turns) {
                    cubeCopy.applyCubeTurn(turn);
                }
                derivedAlgorithm.push(...turns);
            };

            const applySingleTurn = (turn: CubeSyntaxTurn) => {
                cubeCopy.applyCubeTurn(turn);
                derivedAlgorithm.push(turn);
            };

            while (!isStickerNormal(source)) {
                const sp = sourcePiece.position;

                switch (sourcePieceType) {
                    case PieceType.Corner: {
                        if (sp.y < 0) {
                            let algoTurns: CubeSyntaxTurn[] = [];
                            /* We need to get the piece out from the bottom
                            We'll use custom algos for each case */
                            if (sp.z > 0) {
                                if (sp.x > 0) {
                                    /* We're in the FRD position */
                                    algoTurns =
                                        CubeModel.algoStringToTurns("R U R'");
                                } else {
                                    /* We're in the FLD position */
                                    algoTurns =
                                        CubeModel.algoStringToTurns("L' U' L");
                                }
                            } else {
                                if (sp.x > 0) {
                                    /* This is RBD */
                                    algoTurns =
                                        CubeModel.algoStringToTurns("R' U' R");
                                } else {
                                    /* This is LBD */
                                    algoTurns =
                                        CubeModel.algoStringToTurns("L U L'");
                                }
                            }

                            applyTurns(algoTurns);
                        } else {
                            /* Now the corner piece is on top,
                            so we want to see if it's directly above the normalized position */
                            if (sp.x > 0 && sp.z > 0) {
                                /* We want to apply a custom algo for each sticker orientation */
                                const o =
                                    cubeCopy.getStickerOrientation(source);
                                let algoTurns: CubeSyntaxTurn[] = [];

                                if (o.y > 0) {
                                    /* On U */
                                    algoTurns =
                                        CubeModel.algoStringToTurns(
                                            "R U2 R' U' R U R'"
                                        );
                                } else if (o.z > 0) {
                                    /* On F */
                                    algoTurns =
                                        CubeModel.algoStringToTurns("F' U' F");
                                } else if (o.x > 0) {
                                    /* On R */
                                    algoTurns =
                                        CubeModel.algoStringToTurns("R U R'");
                                }

                                applyTurns(algoTurns);
                            } else {
                                applySingleTurn(CubeSyntaxTurn.U);
                            }
                        }

                        break;
                    }
                    case PieceType.Edge: {
                        if (sp.y < 0) {
                            let algoTurns: CubeSyntaxTurn[] = [];
                            /* We're on bottom, need custom
                            algos for each case */
                            if (sp.x > 0) {
                                /* R */
                                algoTurns =
                                    CubeModel.algoStringToTurns("b B' U b' B");
                            } else if (sp.x < 0) {
                                /* L */
                                algoTurns =
                                    CubeModel.algoStringToTurns("f F' U' f' F");
                            } else if (sp.z > 0) {
                                /* F */
                                algoTurns =
                                    CubeModel.algoStringToTurns("r R' U' r' R");
                            } else {
                                /* B */
                                algoTurns =
                                    CubeModel.algoStringToTurns("l L' U l' L");
                            }

                            applyTurns(algoTurns);
                        } else if (sp.y === 0) {
                            /* We're in the middle position,
                            we want to get the cube to the FR position */
                            if (sp.x > 0 && sp.z > 0) {
                                const o =
                                    cubeCopy.getStickerOrientation(source);
                                let algoTurns: CubeSyntaxTurn[] = [];

                                if (o.x > 0) {
                                    /* Pointing R */
                                    algoTurns =
                                        CubeModel.algoStringToTurns(
                                            "F r' R F' r R'"
                                        );
                                } else {
                                    /* Pointing F */
                                    algoTurns =
                                        CubeModel.algoStringToTurns(
                                            "u F' r' R F r R'"
                                        );
                                }

                                applyTurns(algoTurns);
                            } else {
                                applySingleTurn(CubeSyntaxTurn.u);
                            }
                        } else {
                            /* The edge is in the top position.  Get it
                            to right above the normal */
                            if (sp.z > 0) {
                                const o =
                                    cubeCopy.getStickerOrientation(source);
                                let algoTurns: CubeSyntaxTurn[] = [];

                                if (o.z > 0) {
                                    /* Pointing F */
                                    algoTurns =
                                        CubeModel.algoStringToTurns(
                                            "U' r R' U r' R"
                                        );
                                } else {
                                    /* Pointing U */
                                    algoTurns =
                                        CubeModel.algoStringToTurns(
                                            "r R' U2 r' R"
                                        );
                                }

                                applyTurns(algoTurns);
                            } else {
                                applySingleTurn(CubeSyntaxTurn.U);
                            }
                        }

                        break;
                    }
                    case PieceType.Center: {
                        /* Just apply custom algo for each of 5 cases */
                        const o = cubeCopy.getStickerOrientation(source);
                        let algoTurns: CubeSyntaxTurn[] = [];

                        if (o.y > 0) {
                            algoTurns =
                                CubeModel.algoStringToTurns("F B' r'2 R2 F' B");
                        } else if (o.x > 0) {
                            algoTurns =
                                CubeModel.algoStringToTurns("R L' f F' R' L");
                        } else if (o.x < 0) {
                            algoTurns =
                                CubeModel.algoStringToTurns("R L' f' F R' L");
                        } else if (o.z > 0) {
                            algoTurns =
                                CubeModel.algoStringToTurns("F B' r' R F' B");
                        } else if (o.z < 0) {
                            algoTurns =
                                CubeModel.algoStringToTurns("F B' r R' F' B");
                        }

                        applyTurns(algoTurns);
                        break;
                    }
                }
            }

            /* Ok, now we want to clean the algorithm */
            derivedAlgorithm = cleanAlgorithm(derivedAlgorithm);

            // const a = CubeModel.turnsToString(derivedAlgorithm);
            // const at = CubeModel.turnsToString(targetOrientationSequence);

            /* Now we want undo the full cube rotation seq needed
            to normalize the target in the beginning */
            const invertedSeq = invertAlgo(targetOrientationSequence);
            // const ai = CubeModel.turnsToString(invertedSeq);

            // debugger;
            derivedAlgorithm = applyFullCubeSequenceToAlgo(
                derivedAlgorithm,
                invertedSeq
            );

            // const b = CubeModel.turnsToString(derivedAlgorithm);
            // debugger;

            return derivedAlgorithm;
        } else {
            return [];
        }
    }
}

export function serverCanvasToTapestry(
    canvas: ServerCanvas
): CubeTapestryModel {
    const placeToString = (placement: CubePlacement) => {
        return `${placement.x}:${placement.y}`;
    };

    const cubeMap: Record<string, CubePlacement> = {};

    for (let place of canvas.finalCubes) {
        if (place.created) {
            cubeMap[placeToString(place)] = place;
        } else {
            delete cubeMap[placeToString(place)];
        }
    }

    const finalPlaces = Object.values(cubeMap);

    const cubes: CanvasCube[] = finalPlaces.map((placement) => {
        const cube = new CubeModel();
        cube.applyAlgoTurns(placement.algo);

        return {
            cube,
            position: [placement.x, placement.y, 0],
        };
    });

    return new CubeTapestryModel(cubes);
}

export interface CanvasCube {
    cube: CubeModel;
    position: Vector3Tuple;
}

export class CubeTapestryModel {
    cubes: CanvasCube[];

    constructor(cubes?: CanvasCube[]) {
        this.cubes = cubes || [];
    }

    newTapestry(newCube: CanvasCube) {
        return new CubeTapestryModel([...this.cubes, newCube]);
    }

    getBoundingBox(): BoundingBox {
        if (this.cubes.length === 0) {
            return {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                width: 0,
                height: 0,
            };
        }

        let left = this.cubes[0].position[0];
        let right = this.cubes[0].position[0];
        let top = this.cubes[0].position[1];
        let bottom = this.cubes[0].position[1];

        for (const cube of this.cubes) {
            const p = cube.position;

            if (p[0] > right) {
                right = p[0];
            }

            if (p[0] < left) {
                left = p[0];
            }

            if (p[1] > top) {
                top = p[1];
            }

            if (p[1] < bottom) {
                bottom = p[1];
            }
        }

        return {
            left: left - cubeSideLength / 2,
            right: right + cubeSideLength / 2,
            top: top + cubeSideLength / 2,
            bottom: bottom - cubeSideLength / 2,
            width: right - left + cubeSideLength,
            height: top - bottom + cubeSideLength,
        };
    }
}
