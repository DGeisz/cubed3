import {
    FetchResponse,
    useFetch,
    usePostRequest,
} from "../../../../../global_api/queries";
import { ServerCanvas } from "../../../../../global_architecture/cube_model/cube_model";
import { useProvider } from "../../../../service_providers/provider_provider";
import { getCanvasInfo } from "../../../../../global_api/helpers";
import { useEffect } from "react";

export function useCanvasByTime(time: number): FetchResponse<ServerCanvas> {
    return usePostRequest(
        "canvas_by_time",
        {
            canvasTime: time,
        },
        [time]
    );
}

type RefetchId = number;

class SolCanvasDirectory {
    refetchForId: Map<RefetchId, () => void> = new Map();

    addRefetch = (refetch: () => void): RefetchId => {
        const id = this._genId();

        this.refetchForId.set(id, refetch);

        return id;
    };

    removeId = (id: RefetchId) => {
        this.refetchForId.delete(id);
    };

    refetchAll = () => {
        console.log("Calling refetch all!", this.refetchForId.values());

        for (const refetch of this.refetchForId.values()) {
            refetch();
        }
    };

    private _genId = () => Math.random();
}

const solCanvasDirectory = new SolCanvasDirectory();

export function useSolCanvas(time: number) {
    const { program } = useProvider();

    const fetch = useFetch(async () => {
        const { canvas_pda } = await getCanvasInfo(time, program.programId);

        return await program.account.cubedCanvas.fetch(canvas_pda);
    }, [time, program]);

    useEffect(() => {
        const id = solCanvasDirectory.addRefetch(fetch.refetch);

        return () => {
            solCanvasDirectory.removeId(id);
        };
    }, [time]);

    return { ...fetch, refetch: solCanvasDirectory.refetchAll };
}
