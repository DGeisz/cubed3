import { Program, Provider } from "@project-serum/anchor";
import {
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
const network = "http://127.0.0.1:8899";
const connection = new Connection(network, "processed");

const opts: ConfirmOptions = {
  preflightCommitment: "processed",
};

// @ts-ignore
const wallet: Wallet = {};

const provider = new Provider(connection, wallet, opts);

// @ts-ignore
export const CubedSolanaProgram = new Program<Cubed>(idl, programID, provider);
