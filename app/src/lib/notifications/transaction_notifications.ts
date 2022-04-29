import { toast } from "react-toastify";
import _ from "underscore";

export async function createTransactionNotification<T>(
    promise: Promise<T> | (() => Promise<T>),
    options?: Partial<{ pending: string; success: string; error: string }>
): Promise<T> {
    const finalOptions = _.defaults(options, {
        pending: "Loading...",
        success: "Transaction successful!",
        error: "The transaction didn't go through! \n\n Check your connection and Solana's current TPS, then try again.",
    });

    return toast.promise(promise, finalOptions);
}
