"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const cors_1 = __importDefault(require("cors"));
const web3_js_1 = require("@solana/web3.js");
require("dotenv/config");
const init_1 = require("./services/solana/init");
const init_2 = require("./services/mongo/init");
const anchor = __importStar(require("@project-serum/anchor"));
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
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    health: Number,
});
const UserModel = (0, mongoose_1.model)("User", userSchema);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/create_user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, health } = req.body;
    const doc = new UserModel({
        name,
        health,
    });
    yield doc.save();
    return res.json(req.body);
}));
app.post("/get_user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const user = yield UserModel.find({ name });
    const canvases = yield init_1.CubedSolanaProgram.account.cubedCanvas.all();
    // CubedSolanaProgram.account.cubedCanvas.fetch()
    return res.json(canvases);
}));
app.post("/get_canvas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const time = req.body.time;
    const canvas_time_bn = new anchor.BN(time);
    const canvas_time_buffer = canvas_time_bn.toArrayLike(Buffer, "le", 8);
    const [canvas_pda, canvas_bump] = yield web3_js_1.PublicKey.findProgramAddress([
        Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
        canvas_time_buffer,
    ], init_1.CubedSolanaProgram.programId);
    try {
        const canvas = yield init_1.CubedSolanaProgram.account.cubedCanvas.fetch(canvas_pda);
        res.json(canvas);
    }
    catch (e) {
        console.error(e);
    }
}));
app.post("/buy_canvas", (req, res) => {
    req.body;
    console.log("this is body", req.body);
    res.json(req.body);
});
// app.get("/", (req: Request, res: Response) => {
//   res.json({ hey: 2 });
// });
const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
// app.use(cors());
// app.use(express.json());
// app.use(menuRoutes);
const uri = `mongodb+srv://cubed:${process.env.MONGO_PASSWORD}@cluster0.r5rab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, init_2.initMongo)();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (e) {
        throw e;
    }
}))();
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
