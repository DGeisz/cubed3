import {
    FetchResponse,
    useFetch,
    usePostRequest,
} from "../../../../../global_api/queries";
import { ServerCanvas } from "../../../../../global_architecture/cube_model/cube_model";
import { useProvider } from "../../../../service_providers/provider_provider";
import {
    getAuctionEscrowAccountInfo,
    getAuctionInfo,
    getCanvasInfo,
    getListingEscrowAccountInfo,
    getListingOfferInfo,
    getMosaicListingInfo,
    getTokenMaster,
} from "../../../../../global_api/helpers";
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

export function useCanvasMarketplaceInfo(time: number) {
    const { program, provider } = useProvider();

    /* First let's get whether there's an active listing */
    /* Get the listing */
    const listingFetch = useFetch(async () => {
        const { listing_pda } = await getMosaicListingInfo(
            time,
            program.programId
        );

        return await program.account.mosaicListing.fetch(listing_pda);
    }, [time, program]);

    /* Get the associated escrow account */
    const listingEscrowFetch = useFetch(async () => {
        const tokenMaster = getTokenMaster(provider);

        const { escrow_pda } = await getListingEscrowAccountInfo(
            time,
            program.programId
        );

        return await tokenMaster.getAccountInfo(escrow_pda);
    }, [time, program]);

    const offerFetch = useFetch(async () => {
        const { offer_pda } = await getListingOfferInfo(
            time,
            program.programId
        );

        return await program.account.mosaicOffer.fetch(offer_pda);
    }, [time, program]);

    const auctionFetch = useFetch(async () => {
        const { auction_pda } = await getAuctionInfo(time, program.programId);

        return await program.account.mosaicAuction.fetch(auction_pda);
    }, [time, program]);

    const auctionEscrowAccountFetch = useFetch(async () => {
        const tokenMaster = getTokenMaster(provider);

        const { escrow_pda } = await getAuctionEscrowAccountInfo(
            time,
            program.programId
        );

        return await tokenMaster.getAccountInfo(escrow_pda);
    }, [time, program]);

    return {
        data: {
            listing: listingFetch.data,
            listingEscrow: listingEscrowFetch.data,
            offer: offerFetch.data,
            auction: auctionFetch.data,
            auctionEscrowAccount: auctionEscrowAccountFetch.data,
        },
        loading:
            listingFetch.loading ||
            listingEscrowFetch.loading ||
            offerFetch.loading ||
            auctionFetch.loading ||
            auctionEscrowAccountFetch.loading,
        error:
            listingFetch.error ||
            listingEscrowFetch.error ||
            offerFetch.error ||
            auctionFetch.error ||
            auctionEscrowAccountFetch.error,
        refetch: () => {
            listingFetch.refetch();
            listingEscrowFetch.refetch();
            offerFetch.refetch();
            auctionFetch.refetch();
            auctionEscrowAccountFetch.refetch();
        },
    };
}
