import { PublicKey } from "@solana/web3.js";
import { Response, Request } from "express";
import _ from "underscore";
import { getMongoCanvas, MarketplaceInfo } from "../models";
import {
  getCanvasInfo,
  getMosaicListing,
} from "../services/solana/utils/data_fetch";

export async function checkMosaicListing(
  req: Request<any, any, { time: number }>,
  res: Response
) {
  const { time } = req.body;

  let mosaicListing;

  const mongoCanvas = await getMongoCanvas(time);

  if (!mongoCanvas) {
    return res.status(400).send();
  }

  try {
    mosaicListing = await getMosaicListing(time);
  } catch (_e) {}

  if (mosaicListing) {
    mongoCanvas.marketplaceInfo = MarketplaceInfo.Listing;
    mongoCanvas.marketplacePrice = mosaicListing.price.toNumber();
  } else {
    mongoCanvas.marketplaceInfo = MarketplaceInfo.None;
    mongoCanvas.marketplacePrice = 0;
  }

  await mongoCanvas.save();

  return res.json({
    message: "Got it!",
  });
}

export async function buyMosaic(
  req: Request<any, any, { time: number; buyer: string }>,
  res: Response
) {
  const { time, buyer } = req.body;

  const mongoCanvas = getMongoCanvas(time);

  if (!mongoCanvas) {
    return res.status(400).send();
  }

  const buyerKey = new PublicKey(buyer);

  const { canvas_time, canvas_time_buffer } = getCanvasInfo(time);

  const [token_pda, token_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(TOKEN_ACCOUNT_SEED_PREFIX)),
      canvas_time_buffer,
      ownerKey.toBytes(),
    ],
    program
  );
}
