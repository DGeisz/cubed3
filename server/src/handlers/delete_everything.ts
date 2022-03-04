import { Response, Request } from "express";
import { CanvasModel } from "../models";

export async function deleteEverything(req: Request, res: Response) {
  if (process.env.DEV === "true") {
    await CanvasModel.remove({});
  }

  return res.send();
}
