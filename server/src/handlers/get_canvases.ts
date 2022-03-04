import { Response, Request } from "express";
import { CanvasModel, getMongoCanvas } from "../models";

export async function getAllCanvases(req: Request, res: Response) {
  res.json(await CanvasModel.find());
}

export async function getArtistCanvases(
  req: Request<any, any, { artist: string }>,
  res: Response
) {
  const { artist } = req.body;
  res.json(await CanvasModel.find({ artist }));
}

export async function getAllCollectionCanvases(
  req: Request<any, any, { collectionName: string }>,
  res: Response
) {
  const { collectionName } = req.body;

  res.json(await CanvasModel.find({ collectionName }));
}

export async function getCanvasByTime(
  req: Request<any, any, { canvasTime: number }>,
  res: Response
) {
  const { canvasTime } = req.body;

  return res.json(await getMongoCanvas(canvasTime));
}
