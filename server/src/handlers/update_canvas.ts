import { Response, Request } from "express";
import { CanvasModel, CubePlacement } from "../models";
import nacl from "tweetnacl";
import { getCanvas } from "../services/solana/utils/data_fetch";

export async function finalizeCanvasUpdate(req: Request, res: Response) {}

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

    /* Make sure the artist signed this message */
    const valid = nacl.sign.detached.verify(msg, sig, canvas.artist.toBuffer());

    /* Make sure this bad boi is valid */
    if (!valid) {
      return res.status(401).send();
    }

    /* Ok, now let's fetch the canvas */
    const c = await CanvasModel.find({ time });

    console.log("c", c);

    if (c.length !== 1) {
      return res.status(400).send();
    }

    const mongoCanvas = c[0];

    console.log(mongoCanvas);

    const nextIntended = [...mongoCanvas.finalCubes];
    nextIntended.push(cubePlacement);

    mongoCanvas.intendedCubes = nextIntended;

    await mongoCanvas.save();

    return res.json({ gottem: true });
  } catch (e) {
    console.log(e);

    res.send();
    // return res.status(400).send({
    //   message: "Error occurred...",
    // });
  }
}
