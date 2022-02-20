import { Response, Request } from "express";
import { CubePlacement, getMongoCanvas } from "../models";
import nacl from "tweetnacl";
import { getCanvas } from "../services/solana/utils/data_fetch";
import { getCanvasHashFromPlacements } from "../models/cubed/hash_utils";
import _ from "underscore";

export async function finalizeCanvasUpdate(
  req: Request<any, any, { time: number }>,
  res: Response
) {
  const { time } = req.body;

  try {
    /* First actually get the canvas */
    const canvas = await getCanvas(time);

    /* Grab the canvas rep from mongo */
    const mongoCanvas = await getMongoCanvas(time);

    if (!mongoCanvas) {
      return res.status(400).send();
    }

    console.log("prior", mongoCanvas.intendedCubes);

    /* Ok, now we want to check that the hash of the intended cube placements
    matches the current hash of the canvas */
    const canvasHash = getCanvasHashFromPlacements(
      mongoCanvas.intendedCubes,
      new Uint8Array(canvas.initHash)
    );

    /* If the hashes don't match up, we have an error */
    if (!_.isEqual(Array.from(canvasHash), canvas.lastHash)) {
      return res.status(400).json({
        message: "The hashes didn't match",
        canvasHash,
        lastHash: canvas.lastHash,
      });
    }

    console.log(
      "placements",
      mongoCanvas.finalCubes,
      mongoCanvas.intendedCubes
    );

    /* If we're here, the hashes match up, so we can finalize the cube placement order */
    mongoCanvas.finalCubes = [...mongoCanvas.intendedCubes];

    await mongoCanvas.save();

    return res.json({
      message: "Mission Accomplished",
    });
  } catch (e) {
    console.log(e);

    return res.status(400).send({
      message: "Error occurred...",
    });
  }
}

export async function queueCanvasUpdate(
  req: Request<
    any,
    any,
    {
      cubePlacement: CubePlacement;
      signature: { data: number[] };
      time: number;
    }
  >,
  res: Response
) {
  const { cubePlacement, signature, time } = req.body;
  const sig = new Uint8Array(signature.data);
  const msg = new Uint8Array(
    Buffer.from(JSON.stringify(cubePlacement), "utf-8")
  );

  try {
    /* First actually get the canvas */
    const canvas = await getCanvas(time);

    /* Make sure the canvas isn't finished */
    if (canvas.finished) {
      return res.status(400).send({
        message: "Canvas is already finished",
      });
    }

    /* Make sure the artist signed this message */
    const valid = nacl.sign.detached.verify(msg, sig, canvas.artist.toBuffer());

    /* Make sure this bad boi is valid */
    if (!valid) {
      return res.status(401).send();
    }

    const mongoCanvas = await getMongoCanvas(time);

    if (!mongoCanvas) {
      return res.status(400).send();
    }

    const nextIntended = [...mongoCanvas.finalCubes];
    nextIntended.push(cubePlacement);

    mongoCanvas.intendedCubes = nextIntended;

    await mongoCanvas.save();

    return res.json({ gottem: true });
  } catch (e) {
    console.log(e);

    return res.status(400).send({
      message: "Error occurred...",
    });
  }
}
