import { collectionStringToBytes } from "../global_architecture/cube_model/cube_model";

export const MASTER_SEED = "master";
export const CANVAS_SEED = "canvas";
export const MINT_SEED_PREFIX = "mint";
export const COLLECTION_SEED = "clln";
export const INITIAL_CANVAS_CUBES = 16;
export const MIN_CANVAS_PRICE = 0.1;
export const CUBE_PRICE = 0.01;
export const DEFAULT_COLLECTION_NAME_BYTES = collectionStringToBytes("default");
export const TOKEN_ACCOUNT_SEED_PREFIX = "token";
export const ESCROW_ACCOUNT_SEED_PREFIX = "escrow";
export const LISTING_SEED_PREFIX = "listing";
export const OFFER_SEED_PREFIX = "offer";
export const AUCTION_SEED_PREFIX = "auction";
export const AUCTION_ESCROW_ACCOUNT_SEED_PREFIX = "aes";