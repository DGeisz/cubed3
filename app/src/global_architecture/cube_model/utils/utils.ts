import * as THREE from "three";
import { TextureEncoding, Vector3Tuple, VideoTexture } from "three";
import {
    correctStickerVector,
    CubeModel,
    CubeModelPiece,
    CubeSyntaxTurn,
    negX,
    negY,
    negZ,
    PieceType,
    x,
    y,
    z,
} from "../cube_model";

const infinitesimal = 0.001;

export function getPieceTypeFromPiece(piece: CubeModelPiece): PieceType {
    const { x, y, z } = piece.position;
    const product = Math.abs(x * y * z);
    const arr = [x, y, z];

    if (product > infinitesimal) {
        return PieceType.Corner;
    } else {
        const numInf = arr.filter((a) => Math.abs(a) < infinitesimal).length;

        if (numInf === 1) {
            return PieceType.Edge;
        } else {
            return PieceType.Center;
        }
    }
}

function turnIsPrime(turn: CubeSyntaxTurn): boolean {
    return turn % 2 === 0;
}

export function invertTurn(turn: CubeSyntaxTurn): CubeSyntaxTurn {
    if (turnIsPrime(turn)) {
        return turn - 1;
    } else {
        return turn + 1;
    }
}

export function invertAlgo(turns: CubeSyntaxTurn[]): CubeSyntaxTurn[] {
    return turns.map(invertTurn).reverse();
}

function turnsAreInverses(turn: CubeSyntaxTurn, nextTurn: CubeSyntaxTurn) {
    if (!turnIsPrime(turn)) {
        return turn + 1 === nextTurn;
    } else {
        return turn - 1 === nextTurn;
    }
}

export function cleanAlgorithm(dirtyAlgo: CubeSyntaxTurn[]): CubeSyntaxTurn[] {
    let turnIndex = 0;
    const cleanAlgo: CubeSyntaxTurn[] = [];
    dirtyAlgo = [...dirtyAlgo];

    while (turnIndex < dirtyAlgo.length) {
        const turn = dirtyAlgo[turnIndex];
        const nextTurn = dirtyAlgo[turnIndex + 1];
        const nextNext = dirtyAlgo[turnIndex + 2];

        /* Check if we have primes back to back */
        if (turnsAreInverses(turn, nextTurn)) {
            turnIndex += 2;
        } else if (turn === nextTurn && turn === nextNext) {
            /* Check if we have three identical turns in a row */
            if (turnIsPrime(turn)) {
                // cleanAlgo.push(turn - 1);
                dirtyAlgo[turnIndex + 2] = turn - 1;
            } else {
                // cleanAlgo.push(turn + 1);
                dirtyAlgo[turnIndex + 2] = turn + 1;
            }
            turnIndex += 2;
        } else {
            cleanAlgo.push(turn);
            turnIndex += 1;
        }
    }

    return cleanAlgo;
}

interface TurnVectorized {
    axis: THREE.Vector3;
    prime: boolean;
    double: boolean;
    full?: boolean;
}

export function syntaxToVectorized(turn: CubeSyntaxTurn): TurnVectorized {
    const f = () => {
        switch (turn) {
            case CubeSyntaxTurn.U: {
                return {
                    axis: y,
                    prime: false,
                    double: false,
                };
            }
            case CubeSyntaxTurn.UP: {
                return {
                    axis: y,
                    prime: true,
                    double: false,
                };
            }
            case CubeSyntaxTurn.u: {
                return {
                    axis: y,
                    prime: false,
                    double: true,
                };
            }
            case CubeSyntaxTurn.up: {
                return {
                    axis: y,
                    prime: true,
                    double: true,
                };
            }
            case CubeSyntaxTurn.D: {
                return {
                    axis: negY,
                    prime: false,
                    double: false,
                };
            }
            case CubeSyntaxTurn.DP: {
                return {
                    axis: negY,
                    prime: true,
                    double: false,
                };
            }
            case CubeSyntaxTurn.d: {
                return {
                    axis: negY,
                    prime: false,
                    double: true,
                };
            }
            case CubeSyntaxTurn.dp: {
                return {
                    axis: negY,
                    prime: true,
                    double: true,
                };
            }

            /* RL */
            case CubeSyntaxTurn.R: {
                return {
                    axis: x,
                    prime: false,
                    double: false,
                };
            }
            case CubeSyntaxTurn.RP: {
                return {
                    axis: x,
                    prime: true,
                    double: false,
                };
            }
            case CubeSyntaxTurn.r: {
                return {
                    axis: x,
                    prime: false,
                    double: true,
                };
            }
            case CubeSyntaxTurn.rp: {
                return {
                    axis: x,
                    prime: true,
                    double: true,
                };
            }
            case CubeSyntaxTurn.L: {
                return {
                    axis: negX,
                    prime: false,
                    double: false,
                };
            }
            case CubeSyntaxTurn.LP: {
                return {
                    axis: negX,
                    prime: true,
                    double: false,
                };
            }
            case CubeSyntaxTurn.l: {
                return {
                    axis: negX,
                    prime: false,
                    double: true,
                };
            }
            case CubeSyntaxTurn.lp: {
                return {
                    axis: negX,
                    prime: true,
                    double: true,
                };
            }

            /* FB */
            case CubeSyntaxTurn.F: {
                return {
                    axis: z,
                    prime: false,
                    double: false,
                };
            }
            case CubeSyntaxTurn.FP: {
                return {
                    axis: z,
                    prime: true,
                    double: false,
                };
            }
            case CubeSyntaxTurn.f: {
                return {
                    axis: z,
                    prime: false,
                    double: true,
                };
            }
            case CubeSyntaxTurn.fp: {
                return {
                    axis: z,
                    prime: true,
                    double: true,
                };
            }
            case CubeSyntaxTurn.B: {
                return {
                    axis: negZ,
                    prime: false,
                    double: false,
                };
            }
            case CubeSyntaxTurn.BP: {
                return {
                    axis: negZ,
                    prime: true,
                    double: false,
                };
            }
            case CubeSyntaxTurn.b: {
                return {
                    axis: negZ,
                    prime: false,
                    double: true,
                };
            }
            case CubeSyntaxTurn.bp: {
                return {
                    axis: negZ,
                    prime: true,
                    double: true,
                };
            }

            /* Full cube */
            case CubeSyntaxTurn.x: {
                return {
                    axis: x,
                    prime: false,
                    double: false,
                    full: true,
                };
            }
            case CubeSyntaxTurn.xp: {
                return {
                    axis: x,
                    prime: true,
                    double: false,
                    full: true,
                };
            }
            case CubeSyntaxTurn.y: {
                return {
                    axis: y,
                    prime: false,
                    double: false,
                    full: true,
                };
            }
            case CubeSyntaxTurn.yp: {
                return {
                    axis: y,
                    prime: true,
                    double: false,
                    full: true,
                };
            }
            case CubeSyntaxTurn.z: {
                return {
                    axis: z,
                    prime: false,
                    double: false,
                    full: true,
                };
            }
            case CubeSyntaxTurn.zp: {
                return {
                    axis: z,
                    prime: true,
                    double: false,
                    full: true,
                };
            }
        }
    };

    const vec = f();
    const final = {
        axis: new THREE.Vector3(),
        prime: vec.prime,
        double: vec.double,
        full: vec?.full,
    };

    final.axis.copy(vec.axis);

    return final;
}

export function vectorizedToSyntax(vec: TurnVectorized): CubeSyntaxTurn {
    correctStickerVector(vec.axis);
    // debugger;

    if (vec.axis.equals(x)) {
        if (vec.full) {
            if (vec.prime) {
                return CubeSyntaxTurn.xp;
            } else {
                return CubeSyntaxTurn.x;
            }
        } else if (vec.double) {
            if (vec.prime) {
                return CubeSyntaxTurn.rp;
            } else {
                return CubeSyntaxTurn.r;
            }
        } else {
            if (vec.prime) {
                return CubeSyntaxTurn.RP;
            } else {
                return CubeSyntaxTurn.R;
            }
        }
    }

    if (vec.axis.equals(negX)) {
        if (vec.full) {
            if (vec.prime) {
                return CubeSyntaxTurn.x;
            } else {
                return CubeSyntaxTurn.xp;
            }
        } else if (vec.double) {
            if (vec.prime) {
                return CubeSyntaxTurn.lp;
            } else {
                return CubeSyntaxTurn.l;
            }
        } else {
            if (vec.prime) {
                return CubeSyntaxTurn.LP;
            } else {
                return CubeSyntaxTurn.L;
            }
        }
    }

    if (vec.axis.equals(z)) {
        if (vec.full) {
            if (vec.prime) {
                return CubeSyntaxTurn.zp;
            } else {
                return CubeSyntaxTurn.z;
            }
        } else if (vec.double) {
            if (vec.prime) {
                return CubeSyntaxTurn.fp;
            } else {
                return CubeSyntaxTurn.f;
            }
        } else {
            if (vec.prime) {
                return CubeSyntaxTurn.FP;
            } else {
                return CubeSyntaxTurn.F;
            }
        }
    }

    if (vec.axis.equals(negZ)) {
        if (vec.full) {
            if (vec.prime) {
                return CubeSyntaxTurn.z;
            } else {
                return CubeSyntaxTurn.zp;
            }
        } else if (vec.double) {
            if (vec.prime) {
                return CubeSyntaxTurn.bp;
            } else {
                return CubeSyntaxTurn.b;
            }
        } else {
            if (vec.prime) {
                return CubeSyntaxTurn.BP;
            } else {
                return CubeSyntaxTurn.B;
            }
        }
    }

    if (vec.axis.equals(y)) {
        if (vec.full) {
            if (vec.prime) {
                return CubeSyntaxTurn.yp;
            } else {
                return CubeSyntaxTurn.y;
            }
        } else if (vec.double) {
            if (vec.prime) {
                return CubeSyntaxTurn.up;
            } else {
                return CubeSyntaxTurn.u;
            }
        } else {
            if (vec.prime) {
                return CubeSyntaxTurn.UP;
            } else {
                return CubeSyntaxTurn.U;
            }
        }
    }

    if (vec.axis.equals(negY)) {
        if (vec.full) {
            if (vec.prime) {
                return CubeSyntaxTurn.y;
            } else {
                return CubeSyntaxTurn.yp;
            }
        } else if (vec.double) {
            if (vec.prime) {
                return CubeSyntaxTurn.dp;
            } else {
                return CubeSyntaxTurn.d;
            }
        } else {
            if (vec.prime) {
                return CubeSyntaxTurn.DP;
            } else {
                return CubeSyntaxTurn.D;
            }
        }
    }

    /* This should never be reached */
    return CubeSyntaxTurn.x;
}

function applyFullCubeRotationToTurn(
    turn: CubeSyntaxTurn,
    rotation: CubeSyntaxTurn
): CubeSyntaxTurn {
    const vec = syntaxToVectorized(turn);
    let axis = new THREE.Vector3();

    switch (rotation) {
        case CubeSyntaxTurn.x: {
            axis.copy(x);
            break;
        }
        case CubeSyntaxTurn.xp: {
            axis.copy(negX);
            break;
        }
        case CubeSyntaxTurn.y: {
            axis.copy(y);
            break;
        }
        case CubeSyntaxTurn.yp: {
            axis.copy(negY);
            break;
        }
        case CubeSyntaxTurn.z: {
            axis.copy(z);
            break;
        }
        case CubeSyntaxTurn.zp: {
            axis.copy(negZ);
            break;
        }
    }

    const q = new THREE.Quaternion();
    q.setFromAxisAngle(axis, -Math.PI / 2);
    vec.axis.applyQuaternion(q);
    correctStickerVector(vec.axis);

    return vectorizedToSyntax(vec);
}

export function applyFullCubeSequenceToAlgo(
    algo: CubeSyntaxTurn[],
    fullCubeSeq: CubeSyntaxTurn[]
): CubeSyntaxTurn[] {
    return algo.map((turn) => {
        let next = turn;

        for (const r of fullCubeSeq) {
            next = applyFullCubeRotationToTurn(next, r);
        }

        return next;
    });
}

export function euclideanDistance(vec1: Vector3Tuple, vec2: Vector3Tuple) {
    return Math.sqrt(
        vec1.reduce((prev, next, i) => prev + (next - vec2[i]) ** 2, 0)
    );
}
