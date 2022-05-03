import { collectionStringToBytes } from "../global_architecture/cube_model/cube_model";

export const MASTER_SEED = "master";
export const CANVAS_SEED = "canvas";
export const MINT_SEED_PREFIX = "mint";
export const COLLECTION_SEED = "clln";
export const INITIAL_CANVAS_CUBES = 16;
export const MIN_CANVAS_PRICE = 0.1;
export const CUBE_PRICE = 0.01;
export const DEFAULT_COLLECTION_NAME = "default";
export const DEFAULT_COLLECTION_NAME_BYTES = collectionStringToBytes(
    DEFAULT_COLLECTION_NAME
);
export const TOKEN_ACCOUNT_SEED_PREFIX = "token";
export const ESCROW_ACCOUNT_SEED_PREFIX = "escrow";
export const LISTING_SEED_PREFIX = "listing";
export const OFFER_SEED_PREFIX = "offer";
export const AUCTION_SEED_PREFIX = "auction";
export const AUCTION_ESCROW_ACCOUNT_SEED_PREFIX = "aes";

// Change this when we deploy to dev net
export const TOKEN_METADATA_PROGRAM_ID =
    process.env.NEXT_PUBLIC_CLUSTER === "local"
        ? "HgwNM7dNbivnhuS62jyk3gMuepZgbFTT6thnjqvyGAso"
        : "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
export const METADATA_NAME = "metadata";
