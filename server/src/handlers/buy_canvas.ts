import { Response, Request } from "express";
import { getCanvas } from "../services/solana/utils/data_fetch";
import { CanvasModel } from "../models";
import { collectionStringToBytes } from "../models/cubed/hash_utils";
import _ from "underscore";
import {
  drawMosaicImage,
  drawMosaicImageToBuffer,
} from "../models/cubed/mosaic_tapestry";
import { S3 } from "aws-sdk";
import { getCanvasByTime } from "./get_canvases";

export async function getCanvasRoute(
  req: Request<any, any, { time: number }>,
  res: Response
) {
  const { time } = req.body;
  const mongoCanvases = await CanvasModel.find({ time });

  return res.json(mongoCanvases);
}

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

console.log({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

export async function testSaveImage(
  req: Request<any, any, { time: number }>,
  res: Response
) {
  console.log("Got test save image");

  const { time } = req.body;
  const mongoCanvases = await CanvasModel.find({ time });

  if (mongoCanvases.length > 0) {
    console.log("Saving to AWS");

    drawMosaicImage(mongoCanvases[0]);

    // {
    //   "name": "Solflare X NFT",
    //   "symbol": "",
    //   "description": "Celebratory Solflare NFT for the Solflare X launch",
    //   "seller_fee_basis_points": 0,
    //   "image": "https://www.arweave.net/abcd5678?ext=png",
    //   "animation_url": "https://www.arweave.net/efgh1234?ext=mp4",
    //   "external_url": "https://solflare.com",
    //   "attributes": [
    //     {
    //       "trait_type": "web",
    //       "value": "yes"
    //     },
    //     {
    //       "trait_type": "mobile",
    //       "value": "yes"
    //    },
    //    {
    //       "trait_type": "extension",
    //       "value": "yes"
    //     }
    //   ],
    //   "collection": {
    //      "name": "Solflare X NFT",
    //      "family": "Solflare"
    //   },
    //   "properties": {
    //     "files": [
    //       {
    //         "uri": "https://www.arweave.net/abcd5678?ext=png",
    //         "type": "image/png"
    //       },
    //       {
    //         "uri": "https://watch.videodelivery.net/9876jkl",
    //         "type": "unknown",
    //         "cdn": true
    //       },
    //       {
    //         "uri": "https://www.arweave.net/efgh1234?ext=mp4",
    //         "type": "video/mp4"
    //       }
    //     ],
    //     "category": "video",
    //     "creators": [
    //       {
    //         "address": "xEtQ9Fpv62qdc1GYfpNReMasVTe9YW5bHJwfVKqo72u",
    //         "share": 100
    //       }
    //     ]
    //   }
    // }

    const fileContent = drawMosaicImageToBuffer(mongoCanvases[0]);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: `img/${time}.jpg`,
      Body: fileContent,
    };

    try {
      await s3.upload(params).promise();
    } catch (e) {
      console.log("This is error", e);
    } finally {
      console.log("Or maybe not...");
    }
  }

  res.send("Yup!");
}

export async function buyCanvas(
  req: Request<any, any, { time: number; collectionName: string }>,
  res: Response
) {
  const { time, collectionName } = req.body;

  try {
    /* See if we have the canvas in mongo */
    const mongoCanvases = await CanvasModel.find({ time });

    if (mongoCanvases.length > 0) {
      return res.status(400).send({
        message: "Canvas already purchased",
      });
    }

    const collNameBytes = collectionStringToBytes(collectionName);

    /* First actually get the canvas */
    const canvas = await getCanvas(time);

    /* Make sure the collection name matches the on chain rep */
    if (!_.isEqual(canvas.collectionName, Array.from(collNameBytes))) {
      return res.status(400).send({
        message: "collection name doesn't match chain",
      });
    }

    /* Alright, now we're going to create the object in mongo */
    const doc = new CanvasModel({
      artist: canvas.artist.toString(),
      price: canvas.price,
      finished: canvas.finished,
      collectionName: collectionName,
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
