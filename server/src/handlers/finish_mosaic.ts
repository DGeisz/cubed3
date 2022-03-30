import { Response, Request } from "express";
import { CanvasModel } from "../models";
import _ from "underscore";
import { drawMosaicImageToBuffer } from "../models/cubed/mosaic_tapestry";
import { S3 } from "aws-sdk";
import { getCanvas } from "../services/solana/utils/data_fetch";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

export async function finishMosaic(
  req: Request<any, any, { time: number }>,
  res: Response
) {
  const { time } = req.body;

  /* First get the canvas */
  const chainCanvas = await getCanvas(time);

  const mongoCanvases = await CanvasModel.find({ time });

  if (mongoCanvases.length > 1 || mongoCanvases.length == 0) {
    return res.status(400).json(`Bad canvas time ${time}`);
  }

  const mongoCanvas = mongoCanvases[0];

  /* Make sure that the chain canvas is finished, but we haven't propagated the change to the server yet */
  if (!(chainCanvas.finished && !mongoCanvas.finished)) {
    return res
      .status(400)
      .json("Tried to finish a canvas that wasn't finished");
  }

  /* First we're going to put the image on s3 */
  const buffer = drawMosaicImageToBuffer(mongoCanvas);

  await s3
    .putObject({
      Bucket: "cubed-data",
      Key: `img/${time}.png`,
      Body: buffer,
      ContentType: "image/png",
    })
    .promise();

  /* And now we're going to put the metadata on s3 */
  const metadata = JSON.stringify({
    name: `Cubed Mosaic NFT`,
    symbol: "",
    description: "A delectable cubed mosaic",
    seller_fee_basis_points: 0,
    image: `https://dmjmpivqt60di.cloudfront.net/img/${time}.png`,
    animation_url: "",
    external_url: `https://www.cubeduniverse.com/studio/${time}`,
    attributes: [
      {
        display_type: "number",
        trait_type: "Cube Count",
        value: mongoCanvas.finalCubes.reduce(
          (prev, next) => prev + (next.created ? 1 : -1),
          0
        ),
      },
    ],
    collection: {
      name: "Cubed Mosaic",
      family: "Cubed",
    },
    properties: {
      files: [
        {
          uri: `https://dmjmpivqt60di.cloudfront.net/img/${time}.png`,
          type: "image/png",
        },
      ],
      category: "image",
      creators: [
        {
          address: chainCanvas.artist.toString(),
          share: 3,
        },
      ],
    },
  });

  await s3
    .putObject({
      Bucket: "cubed-data",
      Key: `data/${time}.json`,
      Body: metadata,
      ContentType: "application/json",
    })
    .promise();

  /* Finally, set the server canvas to finished */
  mongoCanvas.finished = true;
  await mongoCanvas.save();

  return res.json({
    success: true,
  });
}
