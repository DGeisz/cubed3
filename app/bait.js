const BN = require("bn.js");

const a = new BN(10);
console.log("a.toBuffer", a.toBuffer("le", 8));
