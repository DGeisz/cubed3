import React, { useEffect } from "react";
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

    const { provider } = useProvider();

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         userRefetch();
    //     }, 1000);

    //     return () => clearInterval(interval);
    // });

    const anyLoading = marketPlaceLoading || userLoading || canvasLoading;

    const isListingOwner =
        marketplaceData.listing?.owner === provider.wallet.publicKey;

    const hasToken = userAccount && userAccount.amount.toNumber() === 1;

    /* Is owner if we have  */
    const isOwner = isListingOwner || hasToken;

    if (isOwner) {
        if (marketplaceData.listing) {
            return (
                <MarketPlaceContainer loading={anyLoading}>
                    <div className={StudioStyles.marketPlaceTextContainer}>
                        <div className={StudioStyles.marketplaceTitle}>
                            Price
                        </div>
                        <div className={StudioStyles.marketplaceAmount}>
                            ◎{marketplaceData.listing.price}
                        </div>
                    </div>
                    <div
                        className={clsx(
                            StudioStyles.marketplaceButtonContainer
                        )}
                    >
                        <div className={StudioStyles.smallButton}>
                            Change Price
                        </div>
                    </div>
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
                        <div className={StudioStyles.smallButton}>
                            Set Price
                        </div>
                    </div>
                </MarketPlaceContainer>
            );
        }
    } else if (marketplaceData.listing) {
        return (
            <MarketPlaceContainer loading={anyLoading}>
                <div className={StudioStyles.marketPlaceTextContainer}>
                    <div className={StudioStyles.marketplaceTitle}>Price</div>
                    <div className={StudioStyles.marketplaceAmount}>
                        ◎{marketplaceData.listing?.price}
                    </div>
                </div>
                <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
                    <div className={StudioStyles.smallButton}>Buy Mosaic</div>
                </div>
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

{
    /* <div className={StudioStyles.marketPlaceContainer}>
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
                    </div> */
}
// const SetPrice = (
//         <div
//             className={clsx(
//                 StudioStyles.marketPlaceContainer,
//                 StudioStyles.mpContainerAddOn
//             )}
//         >
//             <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
//                 <div className={StudioStyles.smallButton}>Set Price</div>
//             </div>
//         </div>
//     );

//     const ChangePrice = (
//         <div
//             className={clsx(
//                 StudioStyles.marketPlaceContainer,
//                 StudioStyles.mpContainerAddOn
//             )}
//         >
//             <div className={StudioStyles.marketPlaceTextContainer}>
//                 <div className={StudioStyles.marketplaceTitle}>Price</div>
//                 <div className={StudioStyles.marketplaceAmount}>
//                     ◎{marketplaceData.listing?.price}
//                 </div>
//             </div>
//             <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
//                 <div className={StudioStyles.smallButton}>Change Price</div>
//             </div>
//         </div>
//     );

//     const BuyMosaic = (
//         <div
//             className={clsx(
//                 StudioStyles.marketPlaceContainer,
//                 StudioStyles.mpContainerAddOn
//             )}
//         >
//             <div className={StudioStyles.marketPlaceTextContainer}>
//                 <div className={StudioStyles.marketplaceTitle}>Price</div>
//                 <div className={StudioStyles.marketplaceAmount}>
//                     ◎{marketplaceData.listing?.price}
//                 </div>
//             </div>
//             <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
//                 <div className={StudioStyles.smallButton}>Buy Mosaic</div>
//             </div>
//         </div>
//     );

//     const MakeOffer = (
//         <div className={StudioStyles.marketPlaceContainer}>
//             <div className={StudioStyles.marketPlaceTextContainer}>
//                 <div className={StudioStyles.marketplaceTitle}>
//                     Highest Offer
//                 </div>
//                 <div className={StudioStyles.marketplaceAmount}>◎{10.086}</div>
//             </div>
//             <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
//                 <div className={StudioStyles.smallButton}>Make Offer</div>
//             </div>
//         </div>
//     );

//     const AcceptOffer = (
//         <div className={StudioStyles.marketPlaceContainer}>
//             <div className={StudioStyles.marketPlaceTextContainer}>
//                 <div className={StudioStyles.marketplaceTitle}>
//                     Highest Offer
//                 </div>
//                 <div className={StudioStyles.marketplaceAmount}>◎{10.086}</div>
//             </div>
//             <div className={clsx(StudioStyles.marketplaceButtonContainer)}>
//                 <div className={StudioStyles.smallButton}>Make Offer</div>
//             </div>
//         </div>
//     );
