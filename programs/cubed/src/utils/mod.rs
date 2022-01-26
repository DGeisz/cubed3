use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::sol_to_lamports;

pub fn get_epoch_time_secs() -> i64 {
    Clock::get().unwrap().unix_timestamp
}

pub const MIN_CANVAS_PRICE_SOL: f64 = 0.1;
pub const SEC_IN_HOUR: i64 = 60 * 60;
pub const MILLIS_IN_HOUR: i64 = 1000 * SEC_IN_HOUR;

pub struct PricePackage {
    pub current: u64,
    pub next: u64,
}

/* Based on a 24 hour ema */
pub fn calculate_prices(price_ema: u64, mut period_in_sec: u64) -> PricePackage {
    if period_in_sec < 1 {
        period_in_sec = 1;
    }

    let min_canvas_price_lamports = sol_to_lamports(MIN_CANVAS_PRICE_SOL);

    let mut current = if period_in_sec < (SEC_IN_HOUR as u64) {
        price_ema
    } else {
        let milli_supply = 1000 * period_in_sec / (SEC_IN_HOUR as u64);

        (price_ema * 1000) / milli_supply
    };

    current = std::cmp::max(min_canvas_price_lamports, current);

    let mut next_target = (current * (SEC_IN_HOUR as u64)) / (period_in_sec);
    /* Don't let next_target be more than twice the current price (otherwise price spikes waaaay to fast)*/
    next_target = std::cmp::min(next_target, 2 * price_ema);

    /* Handle ema averaged over the last 24 transactions */
    let mut next = if next_target > price_ema {
        price_ema + (((next_target - price_ema) * 2) / 25)
    } else {
        price_ema - (((price_ema - next_target) * 2) / 25)
    };

    /* Don't let next be more than twice the current price */
    next = std::cmp::min(next, 2 * price_ema);
    next = std::cmp::max(next, min_canvas_price_lamports);

    PricePackage { current, next }
}
