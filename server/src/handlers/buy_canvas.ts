import { Response, Request } from "express";
import { getCanvas } from "../services/solana/utils/data_fetch";
import { CanvasModel } from "../models";

export async function getCanvasRoute(
  req: Request<any, any, { time: number }>,
  res: Response
) {
  const { time } = req.body;
  const mongoCanvases = await CanvasModel.find({ time });

  return res.json(mongoCanvases);
}

export async function buyCanvas(
  req: Request<any, any, { time: number }>,
  res: Response
) {
  const { time } = req.body;

  try {
    /* See if we have the canvas in mongo */
    const mongoCanvases = await CanvasModel.find({ time });

    if (mongoCanvases.length > 0) {
      return res.status(400).send({
        message: "Canvas already purchased",
      });
    }

    /* First actually get the canvas */
    const canvas = await getCanvas(time);

    /* Alright, now we're going to create the object in mongo */
    const doc = new CanvasModel({
      artist: canvas.artist.toString(),
      time,
      finalCubes: [],
      intendedCubes: [],
    });

    await doc.save();

    return res.status(200).send();
  } catch (e) {
    res.status(400).send({
      message: "An error occurred!",
    });
  }
}
