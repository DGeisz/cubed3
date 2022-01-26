import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { MIN_CANVAS_PRICE } from "./chain_constants";

const SEC_IN_HOUR = 60 * 60;

export function priceEmaToCurrentPriceLamports(
    lamportsEma: number,
    secondsSinceLast: number
) {
    const minPriceLamps = MIN_CANVAS_PRICE * LAMPORTS_PER_SOL;

    let current;

    if (secondsSinceLast < SEC_IN_HOUR) {
        current = lamportsEma;
    } else {
        current = (lamportsEma * SEC_IN_HOUR) / secondsSinceLast;
    }

    current = Math.max(minPriceLamps, current);

    return current;
}

export function priceEmaLamportsToCurrentSol(
    lamportsEma: number,
    secondsSinceLast: number
) {
    const price =
        priceEmaToCurrentPriceLamports(lamportsEma, secondsSinceLast) /
        LAMPORTS_PER_SOL;
    const dec = 1000;

    return Math.floor(price * dec) / dec;
}
