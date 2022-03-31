import React, { useEffect } from "react";
import clsx from "clsx";
import { StudioStyles } from "../../../../studio_styles";
import {
    useCanvasMarketplaceInfo,
    useSolCanvas,
    useUserTokenAccount,
} from "../../../../routes/canvasTime/api/queries";
import { DotLoader } from "react-spinners";

interface MarketplaceProps {
    canvasTime: number;
}

const Marketplace: React.FC<MarketplaceProps> = (props) => {
    const {
        data: marketplaceData,
        loading: marketPlaceLoading,
        error: marketPlaceError,
        refetch: marketPlaceRefetch,
    } = useCanvasMarketplaceInfo(props.canvasTime);

    const {
        data: userAccount,
        loading: userLoading,
        error: userError,
        refetch: userRefetch,
    } = useUserTokenAccount(props.canvasTime);

    if (userError) {
        console.log(userError);
    }

    const {
        data: canvas,
        loading: canvasLoading,
        refetch: canvasRefetch,
    } = useSolCanvas(props.canvasTime);

    console.log(
        "userLoading",
        userAccount?.amount.toNumber(),
        marketplaceData,
        marketPlaceError
    );

    useEffect(() => {
        const interval = setInterval(() => {
            userRefetch();
        }, 1000);

        return () => clearInterval(interval);
    });

    const anyLoading = marketPlaceLoading || userLoading || canvasLoading;

    /* Is owner if we have  */
    const isOwner = userAccount && userAccount.amount.toNumber() === 1;

    const SetPrice = (
        <div
            className={clsx(
                StudioStyles.marketPlaceContainer,
                StudioStyles.mpContainerAddOn
            )}
        >
            <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
                <div className={StudioStyles.smallButton}>Set Price</div>
            </div>
        </div>
    );

    const ChangePrice = (
        <div
            className={clsx(
                StudioStyles.marketPlaceContainer,
                StudioStyles.mpContainerAddOn
            )}
        >
            <div className={StudioStyles.marketPlaceTextContainer}>
                <div className={StudioStyles.marketplaceTitle}>Price</div>
                <div className={StudioStyles.marketplaceAmount}>
                    ◎{marketplaceData.listing?.price}
                </div>
            </div>
            <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
                <div className={StudioStyles.smallButton}>Change Price</div>
            </div>
        </div>
    );

    const BuyMosaic = (
        <div
            className={clsx(
                StudioStyles.marketPlaceContainer,
                StudioStyles.mpContainerAddOn
            )}
        >
            <div className={StudioStyles.marketPlaceTextContainer}>
                <div className={StudioStyles.marketplaceTitle}>Price</div>
                <div className={StudioStyles.marketplaceAmount}>
                    ◎{marketplaceData.listing?.price}
                </div>
            </div>
            <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
                <div className={StudioStyles.smallButton}>Buy Mosaic</div>
            </div>
        </div>
    );

    const MakeOffer = (
        <div className={StudioStyles.marketPlaceContainer}>
            <div className={StudioStyles.marketPlaceTextContainer}>
                <div className={StudioStyles.marketplaceTitle}>
                    Highest Offer
                </div>
                <div className={StudioStyles.marketplaceAmount}>◎{10.086}</div>
            </div>
            <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
                <div className={StudioStyles.smallButton}>Make Offer</div>
            </div>
        </div>
    );

    const AcceptOffer = (
        <div className={StudioStyles.marketPlaceContainer}>
            <div className={StudioStyles.marketPlaceTextContainer}>
                <div className={StudioStyles.marketplaceTitle}>
                    Highest Offer
                </div>
                <div className={StudioStyles.marketplaceAmount}>◎{10.086}</div>
            </div>
            <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
                <div className={StudioStyles.smallButton}>Make Offer</div>
            </div>
        </div>
    );

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
            {anyLoading ? (
                <div className="my-4 flex flex-1">
                    <DotLoader color="#00bcd4" />
                </div>
            ) : (
                <>
                    <div
                        className={clsx(
                            StudioStyles.marketPlaceContainer,
                            StudioStyles.mpContainerAddOn
                        )}
                    >
                        <div className={StudioStyles.marketPlaceTextContainer}>
                            <div className={StudioStyles.marketplaceTitle}>
                                Price
                            </div>
                            <div className={StudioStyles.marketplaceAmount}>
                                ◎{10.11}
                            </div>
                        </div>
                        <div
                            className={clsx(
                                StudioStyles.marketplaceButtonContainer
                            )}
                        >
                            <div className={StudioStyles.smallButton}>
                                Buy Mosaic
                            </div>
                        </div>
                    </div>
                    <div className={StudioStyles.marketPlaceContainer}>
                        <div className={StudioStyles.marketPlaceTextContainer}>
                            <div className={StudioStyles.marketplaceTitle}>
                                Highest Offer
                            </div>
                            <div className={StudioStyles.marketplaceAmount}>
                                ◎{10.086}
                            </div>
                        </div>
                        <div
                            className={clsx(
                                StudioStyles.marketplaceButtonContainer
                            )}
                        >
                            <div className={StudioStyles.smallButton}>
                                Make Offer
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Marketplace;
