// const { sha256 } = require("js-sha256");
// const anchor = require("@project-serum/anchor");
// // import { BN } from "@project-serum/anchor";
// const { BN } = require("@project-serum/anchor");

// const c = BN(0);
// console.log("c", c);
// // const a = sha256(c.toBuffer("le", 1));

// const b = anchor.utils.bytes.utf8.encode(a);

// console.log(b);

const { sha256 } = require("@ethersproject/sha2");
const { BN, utils } = require("@project-serum/anchor");

const two_16_div_2 = 2 ** 15;

const a = [1, 2, 3, 4, 400, 400 - 256];

const b = new Uint8Array(a);

// console.log(b);

let c = new utils.bytes.utf8.encode("abc");
const d = new Uint8Array(new Array(64 - c.length).fill(0));

const e = Buffer.concat([c, d]);

// Uint8Array.concat(c, d);

// console.log("c", c, c.length);
console.log("e", e, e.length);

let hash = sha256(new Uint8Array([0])).slice(2);
let publicKeyBytes = new BN(hash, 16).toArray(undefined, 32);

// console.log(publicKeyBytes);

// console.log(Array.from(new BN(-145).toBuffer("le", 3)));
