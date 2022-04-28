import { AccountInfo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Response, Request } from "express";
import _ from "underscore";
import { getMongoCanvas, MarketplaceInfo } from "../models";
import {
  getMosaicListing,
  getTokenAccount,
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

  let mongoCanvas;

  mongoCanvas = await getMongoCanvas(time);

  if (!mongoCanvas) {
    return res.status(400).send();
  }

  const buyerKey = new PublicKey(buyer);

  const buyerTokenAccount = await getTokenAccount(time, buyerKey);

  /* Make sure this person actually owns this */
  if (buyerTokenAccount.amount.toNumber() !== 1) {
    return res.status(400).json({
      message: "You don't own this mosaic!",
    });
  }

  mongoCanvas.owner = buyer;

  await mongoCanvas.save();

  return res.json({
    message: "Everything successfully went through!",
  });
}
