import tweetnacl from "tweetnacl";

// tweetnacl.sign.keyPair;
const key = tweetnacl.sign.keyPair();

const a = [1, 2, 3, 4];
const msg = new Uint8Array(a);

console.log(key);

const sig = tweetnacl.sign.detached(msg, key.secretKey);

console.log("sig", sig);

const ver = tweetnacl.sign.detached.verify(msg, sig, key.publicKey);

console.log("ver", ver);
