import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { ProviderProvider } from "../lib/service_providers/provider_provider";
import { withTutorial } from "../lib/service_providers/tutorial_provider";
import { CanvasWalletProvider } from "../lib/studio/service_providers/studio_state_provider/studio_state_provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

require("@solana/wallet-adapter-react-ui/styles.css");

function MyApp({ Component, pageProps }: AppProps) {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    // const network = WalletAdapterNetwork.Devnet;
    const network = "http://127.0.0.1:8899";

    // You can also provide a custom RPC endpoint
    const endpoint = useMemo(() => "http://127.0.0.1:8899", [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <CanvasWalletProvider>
                        <ProviderProvider>
                            <ToastContainer position="bottom-left" />
                            <Component {...pageProps} />
                        </ProviderProvider>
                    </CanvasWalletProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default MyApp;
// export default withTutorial(MyApp);
