import { Program, Provider } from "@project-serum/anchor";
import { buyCanvas } from "../../global_chain/chain_methods";
import { Cubed } from "../../global_types/cubed";
import axios from "axios";
import { BASE_URL } from "../../global_networking/constants";
import { DEFAULT_COLLECTION_NAME } from "../../global_chain/chain_constants";

export async function buyCanvasOnChainAndServer(
    provider: Provider,
    program: Program<Cubed>
): Promise<number> {
    const time = await buyCanvas(provider, program);

    await axios.post(`${BASE_URL}/buy_canvas`, {
        time,
        collectionName: DEFAULT_COLLECTION_NAME,
    });

    return time;
}
