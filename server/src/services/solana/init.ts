import { Program, Provider } from "@project-serum/anchor";
import {
  Cluster,
  clusterApiUrl,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import { Cubed } from "./types/cubed";
import idl from "./idl.json";

const programID = new PublicKey("5pDJMtbFrSnctiWQi57WtFgbpsuPbQKFkBMUyDMaVpef");

/* Use clusterApiUrl to get the different network URLs once you actually deploy */
let network: string;

if (process.env.CLUSTER === "local") {
  network = "http://127.0.0.1:8899";
} else {
  network = clusterApiUrl(process.env.CLUSTER as Cluster);
}

const connection = new Connection(network, "processed");

const opts: ConfirmOptions = {
  preflightCommitment: "processed",
};

// @ts-ignore
const wallet: Wallet = {};

export const provider = new Provider(connection, wallet, opts);

// @ts-ignore
export const CubedSolanaProgram = new Program<Cubed>(idl, programID, provider);
