import {
    FetchResponse,
    useFetch,
    usePostRequest,
} from "../../../../../global_api/queries";
import { ServerCanvas } from "../../../../../global_architecture/cube_model/cube_model";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { CANVAS_SEED } from "../../../../../global_chain/chain_constants";
import { useProvider } from "../../../../service_providers/provider_provider";

export function useCanvasByTime(time: number): FetchResponse<ServerCanvas> {
    return usePostRequest(
        "canvas_by_time",
        {
            canvasTime: time,
        },
        [time]
    );
}

export function useSolCanvas(time: number) {
    const { program } = useProvider();

    return useFetch(async () => {
        const canvas_time_bn = new anchor.BN(time);
        const canvas_time_buffer = canvas_time_bn.toArrayLike(Buffer, "le", 8);

        const [canvas_pda] = await PublicKey.findProgramAddress(
            [
                Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
                canvas_time_buffer,
            ],
            program.programId
        );

        return await program.account.cubedCanvas.fetch(canvas_pda);
    }, [time, program]);
}
