import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { StudioStyles } from "../../../../studio_styles";
import {
    useCanvasMarketplaceInfo,
    useSolCanvas,
    useUserTokenAccount,
} from "../../../../routes/canvasTime/api/queries";
import { DotLoader } from "react-spinners";
import { useProvider } from "../../../../../service_providers/provider_provider";
import { isLocalURL } from "next/dist/shared/lib/router/router";
import {
    CanvasScreen,
    useCanvasScreenInfo,
} from "../../../../service_providers/studio_state_provider/studio_state_provider";
import { buyMosaic } from "../../../../api/mutations";

interface MarketplaceProps {
    canvasTime: number;
}

const Marketplace: React.FC<MarketplaceProps> = (props) => {
    const { program, provider } = useProvider();

    const {
        data: marketplaceData,
        loading: marketPlaceLoading,
        error: marketPlaceError,
        refetch: marketPlaceRefetch,
    } = useCanvasMarketplaceInfo(props.canvasTime);

    useEffect(() => {
        const int = setInterval(() => {
            marketPlaceRefetch();
        }, 2000);

        return () => {
            clearInterval(int);
        };
    }, []);

    const [marketPlaceLoaded, setMarketPlaceLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (!marketPlaceLoading) {
            setMarketPlaceLoaded(true);
        }
    }, [marketPlaceLoading]);

    const {
        data: userAccount,
        loading: userLoading,
        error: userError,
        refetch: userRefetch,
    } = useUserTokenAccount(props.canvasTime);

    const { setCanvasScreen, canvasScreen } = useCanvasScreenInfo();

    const {
        data: canvas,
        loading: canvasLoading,
        refetch: canvasRefetch,
    } = useSolCanvas(props.canvasTime);

    const anyLoading = !marketPlaceLoaded || userLoading || canvasLoading;

    const isListingOwner =
        marketplaceData.listing?.owner.toString() ===
        provider?.wallet?.publicKey.toString();
    const listingActive = marketplaceData.listingEscrow?.amount.toNumber() == 1;

    const hasToken = userAccount && userAccount.amount.toNumber() === 1;

    const isOwner = (isListingOwner && listingActive) || hasToken;

    if (isOwner) {
        if (marketplaceData.listing && listingActive) {
            return (
                <MarketPlaceContainer loading={anyLoading}>
                    <>
                        <div className={StudioStyles.marketPlaceTextContainer}>
                            <div className={StudioStyles.marketplaceTitle}>
                                Price
                            </div>
                            <div className={StudioStyles.marketplaceAmount}>
                                ◎{marketplaceData.listing.price.toNumber()}
                            </div>
                        </div>
                        <div
                            className={clsx(
                                StudioStyles.marketplaceButtonContainer
                            )}
                        >
                            <div
                                className={StudioStyles.smallButton}
                                onClick={() =>
                                    setCanvasScreen(CanvasScreen.ChangePrice)
                                }
                            >
                                Change Price
                            </div>
                        </div>
                    </>
                </MarketPlaceContainer>
            );
        } else {
            return (
                <MarketPlaceContainer loading={anyLoading}>
                    <div
                        className={clsx(
                            StudioStyles.marketplaceButtonContainer
                        )}
                    >
                        <div
                            className={StudioStyles.smallButton}
                            onClick={() =>
                                setCanvasScreen(CanvasScreen.SetPrice)
                            }
                        >
                            Set Price
                        </div>
                    </div>
                </MarketPlaceContainer>
            );
        }
    } else if (marketplaceData.listing && listingActive) {
        return (
            <MarketPlaceContainer loading={anyLoading}>
                <>
                    <div className={StudioStyles.marketPlaceTextContainer}>
                        <div className={StudioStyles.marketplaceTitle}>
                            Price
                        </div>
                        <div className={StudioStyles.marketplaceAmount}>
                            ◎{marketplaceData.listing?.price.toNumber()}
                        </div>
                    </div>
                    <div
                        className={clsx(
                            StudioStyles.marketplaceButtonContainer
                        )}
                    >
                        <div
                            className={StudioStyles.smallButton}
                            onClick={async () => {
                                await buyMosaic(
                                    provider,
                                    program,
                                    marketplaceData.listing!.owner,
                                    props.canvasTime
                                );
                            }}
                        >
                            Buy Mosaic
                        </div>
                    </div>
                </>
            </MarketPlaceContainer>
        );
    }

    return null;
};

export default Marketplace;

interface MarketplaceContainerProps {
    loading: boolean;
}

const MarketPlaceContainer: React.FC<MarketplaceContainerProps> = (props) => {
    return (
        <div
            className={clsx(
                "flex flex-col justify-center items-center",
                "rounded-lg",
                "bg-slate-100",
                "p-2",
                "shadow-md",
                "mb-4"
            )}
        >
            <div
                className={clsx(
                    "text-lg font-bold text-slate-400",
                    "self-stretch",
                    "text-center",
                    "pb-1",
                    "mb-2",
                    "border-b border-solid border-slate-300"
                )}
            >
                Marketplace
            </div>
            {props.loading ? (
                <div className="my-4 flex flex-1">
                    <DotLoader color="#00bcd4" />
                </div>
            ) : (
                <>
                    <div className={clsx(StudioStyles.marketPlaceContainer)}>
                        {props.children}
                    </div>
                </>
            )}
        </div>
    );
};
