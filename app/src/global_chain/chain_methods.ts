import { Program, Provider } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {
    CANVAS_SEED,
    COLLECTION_SEED,
    DEFAULT_COLLECTION_NAME_BYTES,
    MASTER_SEED,
    MINT_SEED_PREFIX,
} from "./chain_constants";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Cubed } from "../global_types/cubed";
import {
    collectionStringToBytes,
    CubeSyntaxTurn,
    encodePosition,
    extendAlgo,
} from "../global_architecture/cube_model/cube_model";

interface DefaultAddresses {
    master_pda: PublicKey;
    master_bump: number;
    default_collection_pda: PublicKey;
    default_collection_bump: number;
}

interface CollectionInfo {
    key: PublicKey;
    bump: number;
    bytes: Buffer;
}

export async function getCollectionInfo(
    program: Program<Cubed>,
    name: string
): Promise<CollectionInfo> {
    const name_bytes = collectionStringToBytes(name);

    const [pda, bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(COLLECTION_SEED)),
            name_bytes,
        ],
        program.programId
    );

    return {
        key: pda,
        bump,
        bytes: name_bytes,
    };
}

export async function getDefaultAddresses(
    program: Program<Cubed>
): Promise<DefaultAddresses> {
    const [master_pda, master_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode(MASTER_SEED))],
        program.programId
    );

    const [default_collection_pda, default_collection_bump] =
        await PublicKey.findProgramAddress(
            [
                Buffer.from(anchor.utils.bytes.utf8.encode(COLLECTION_SEED)),
                DEFAULT_COLLECTION_NAME_BYTES,
            ],
            program.programId
        );

    return {
        master_pda,
        master_bump,
        default_collection_bump,
        default_collection_pda,
    };
}

export async function initializeCubed(
    provider: Provider,
    program: Program<Cubed>,
    onError?: () => void
) {
    const {
        master_pda,
        master_bump,
        default_collection_pda,
        default_collection_bump,
    } = await getDefaultAddresses(program);

    try {
        await program.rpc.initialize(
            master_bump,
            Array.from(DEFAULT_COLLECTION_NAME_BYTES),
            default_collection_bump,
            {
                accounts: {
                    cubedMaster: master_pda,
                    defaultCollection: default_collection_pda,
                    owner: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
            }
        );
    } catch (_e) {
        onError && onError();
    }
}

export async function buyCanvas(
    provider: Provider,
    program: Program<Cubed>,
    collection?: CollectionInfo
): Promise<number> {
    const {
        master_pda,
        master_bump,
        default_collection_pda,
        default_collection_bump,
    } = await getDefaultAddresses(program);

    const time = Math.floor(Date.now() / 1000) - 1;

    const canvas_time = new anchor.BN(time);
    const canvas_time_buffer = canvas_time.toArrayLike(Buffer, "le", 8);

    const [canvas_pda, canvas_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
            canvas_time_buffer,
        ],
        program.programId
    );

    console.log("canvas_pda", canvas_pda.toString());

    const [mint_pda, mint_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(MINT_SEED_PREFIX)),
            canvas_time_buffer,
        ],
        program.programId
    );

    /* Default to adding to the default collection  */
    collection = collection || {
        key: default_collection_pda,
        bump: default_collection_bump,
        bytes: DEFAULT_COLLECTION_NAME_BYTES,
    };

    try {
        await program.rpc.buyCanvas(
            // @ts-ignore
            master_bump,
            canvas_bump,
            mint_bump,
            canvas_time,
            collection.bytes,
            collection.bump,
            {
                accounts: {
                    artist: provider.wallet.publicKey,
                    cubedMaster: master_pda,
                    canvas: canvas_pda,
                    mint: mint_pda,
                    systemProgram: SystemProgram.programId,
                    collection: collection.key,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY,
                },
            }
        );
    } catch (e) {
        console.error(e);
    }

    return time;
}

export async function placeCube(
    provider: Provider,
    program: Program<Cubed>,
    canvasTime: number,
    algorithm: CubeSyntaxTurn[],
    x: number,
    y: number
) {
    const canvas_time = new anchor.BN(canvasTime);
    const canvas_time_buffer = canvas_time.toArrayLike(Buffer, "le", 8);

    const algo: CubeSyntaxTurn[] = extendAlgo(algorithm);
    const xEn = encodePosition(x);
    const yEn = encodePosition(y);

    const [canvas_pda, canvas_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
            canvas_time_buffer,
        ],
        program.programId
    );

    console.log("pub key", provider.wallet.publicKey.toString());

    await program.rpc.placeCube(canvas_bump, canvas_time, algo, xEn, yEn, {
        accounts: {
            artist: provider.wallet.publicKey,
            canvas: canvas_pda,
            systemProgram: SystemProgram.programId,
        },
    });
}

export async function removeCube(
    provider: Provider,
    program: Program<Cubed>,
    canvasTime: number,
    x: number,
    y: number
) {
    const canvas_time = new anchor.BN(canvasTime);
    const canvas_time_buffer = canvas_time.toArrayLike(Buffer, "le", 8);

    const xEn = encodePosition(x);
    const yEn = encodePosition(y);

    const [canvas_pda, canvas_bump] = await PublicKey.findProgramAddress(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
            canvas_time_buffer,
        ],
        program.programId
    );

    await program.rpc.removeCube(canvas_bump, canvas_time, xEn, yEn, {
        accounts: {
            artist: provider.wallet.publicKey,
            canvas: canvas_pda,
            systemProgram: SystemProgram.programId,
        },
    });
}
