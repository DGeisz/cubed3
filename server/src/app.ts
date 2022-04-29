import express, { Request, Response } from "express";
import { Schema, model } from "mongoose";
import cors from "cors";
import { PublicKey } from "@solana/web3.js";
import { Program, Provider } from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import "dotenv/config";
import { CubedSolanaProgram } from "./services/solana/init";
import { initMongo } from "./services/mongo/init";
import * as anchor from "@project-serum/anchor";

const MASTER_SEED = "master";
const CANVAS_SEED = "canvas";
const MINT_SEED_PREFIX = "mint";
const COLLECTION_SEED = "clln";
const INITIAL_CANVAS_CUBES = 16;
const MIN_CANVAS_PRICE = 0.1;
const CUBE_PRICE = 0.01;
const TOKEN_ACCOUNT_SEED_PREFIX = "token";
const ESCROW_ACCOUNT_SEED_PREFIX = "escrow";
const LISTING_SEED_PREFIX = "listing";
const OFFER_SEED_PREFIX = "offer";
const AUCTION_SEED_PREFIX = "auction";
const AUCTION_ESCROW_ACCOUNT_SEED_PREFIX = "aes";

interface User {
  name: string;
  health: number;
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  health: Number,
});

const UserModel = model<User>("User", userSchema);

const app = express();

app.use(cors());
app.use(express.json());

app.post(
  "/create_user",
  async (
    req: Request<any, any, { name: string; health: number }>,
    res: Response
  ) => {
    const { name, health } = req.body;

    const doc = new UserModel({
      name,
      health,
    });

    await doc.save();

    return res.json(req.body);
  }
);

app.post(
  "/get_user",
  async (req: Request<any, any, { name: string }>, res: Response) => {
    const { name } = req.body;

    const user = await UserModel.find({ name });
    const canvases = await CubedSolanaProgram.account.cubedCanvas.all();

    // CubedSolanaProgram.account.cubedCanvas.fetch()

    return res.json(canvases);
  }
);

app.post("/get_canvas", async (req: Request, res: Response) => {
  const time = req.body.time as number;

  const canvas_time_bn = new anchor.BN(time);
  const canvas_time_buffer = canvas_time_bn.toArrayLike(Buffer, "le", 8);

  const [canvas_pda, canvas_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
      canvas_time_buffer,
    ],
    CubedSolanaProgram.programId
  );

  try {
    const canvas = await CubedSolanaProgram.account.cubedCanvas.fetch(
      canvas_pda
    );

    res.json(canvas);
  } catch (e) {
    console.error(e);
  }
});

app.post("/buy_canvas", (req: Request, res: Response) => {
  req.body;

  res.json(req.body);
});

const PORT: string | number = process.env.PORT || 4000;

const uri = `mongodb+srv://cubed:${process.env.MONGO_PASSWORD}@cluster0.r5rab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

(async () => {
  try {
    await initMongo();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (e) {
    throw e;
  }
})();

// // const uri: string = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.raz9g.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
// mongoose
//   .connect(uri)
//   .then(() =>
//     app.listen(PORT, () =>
//       console.log(`Server running on http://localhost:${PORT}`)
//     )
//   )
//   .catch((error) => {
//     throw error;
//   });
