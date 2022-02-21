import { Program, Provider } from "@project-serum/anchor";
import axios from "axios";
import { DEFAULT_COLLECTION_NAME } from "../../../global_chain/chain_constants";
import {
    buyCanvas,
    getCollectionInfo,
} from "../../../global_chain/chain_methods";
import { BASE_URL } from "../../../global_networking/constants";
import { Cubed } from "../../../global_types/cubed";

export async function buyCanvasMutation(
    provider: Provider,
    program: Program<Cubed>,
    collectionName?: string
): Promise<number> {
    let time: number;

    if (collectionName) {
        const collectionInfo = await getCollectionInfo(program, collectionName);

        time = await buyCanvas(provider, program, collectionInfo);
    } else {
        time = await buyCanvas(provider, program);
    }

    await axios.post(`${BASE_URL}/buy_canvas`, {
        time,
        collectionName: collectionName || DEFAULT_COLLECTION_NAME,
    });

    return time;
}
